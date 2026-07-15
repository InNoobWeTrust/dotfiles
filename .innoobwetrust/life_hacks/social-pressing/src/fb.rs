// Module: fb — Facebook profile/post reporting via WebDriver.
// Owns FB-specific selectors and the report click flow. Does NOT own login/cookies.
use core::time::Duration;
use fantoccini::{elements::Element, error::CmdError, Client, Locator};
use rand::prelude::*;
use tracing::{debug, error, info, warn};

use crate::driver::ClientActionExt;
use crate::utils::delay;

/// Wait briefly for one CSS selector. Short timeout so multi-strategy chains stay snappy.
async fn wait_css(client: &Client, selector: &str, secs: u64) -> Result<Element, CmdError> {
    client
        .wait()
        .at_most(Duration::from_secs(secs))
        .for_element(Locator::Css(selector))
        .await
}

/// Wait briefly for one XPath. Used when CSS attribute substring matching is insufficient.
async fn wait_xpath(client: &Client, xpath: &str, secs: u64) -> Result<Element, CmdError> {
    client
        .wait()
        .at_most(Duration::from_secs(secs))
        .for_element(Locator::XPath(xpath))
        .await
}

async fn check_availability(client: &Client) -> Result<Element, CmdError> {
    // News-feed home link only appears on the main shell / soft-404, not on a real profile.
    wait_css(
        client,
        r#"a[href="/"][role="link"][tabindex="0"][aria-label="Go to News Feed"]"#,
        5,
    )
    .await
}

/// Profile "⋯" / "See options" menu trigger.
///
/// Live (2026-07, headful Firefox): `aria-label="Profile settings see more options"`
/// with `role="button"` + `aria-haspopup="menu"`. Older exact labels kept for regression.
async fn get_account_report_btn(client: &Client) -> Result<Element, CmdError> {
    // WHY: Prefer exact current label first so we do not match unrelated "More" chrome.
    let exact_css = [
        r#"div[aria-haspopup="menu"][role="button"][aria-label="Profile settings see more options"]"#,
        r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="Profile settings see more options"]"#,
        r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="See Options"]"#,
        r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="See options"]"#,
        r#"div[aria-haspopup="menu"][role="button"][aria-label="See Options"]"#,
        r#"div[aria-haspopup="menu"][role="button"][aria-label="See options"]"#,
        r#"div[role="button"][aria-label="See more options"]"#,
        r#"div[role="button"][aria-label="More options"]"#,
        // Prefix / substring without CSS `i` flag — Gecko WebDriver rejects some case-fold flags.
        r#"[role="button"][aria-haspopup="menu"][aria-label^="Profile settings"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="Profile settings"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="See option"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="See Option"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="more option"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="More option"]"#,
    ];

    for selector in exact_css {
        match wait_css(client, selector, 3).await {
            Ok(el) => {
                info!(selector, "Found profile menu button (CSS)");
                return Ok(el);
            }
            Err(_) => continue,
        }
    }

    let xpaths = [
        r#"//*[@role="button" and @aria-haspopup="menu" and contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'profile settings')]"#,
        r#"//*[@role="button" and @aria-haspopup="menu" and contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'see option')]"#,
        r#"//*[@role="button" and @aria-haspopup="menu" and contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'more option')]"#,
    ];

    for xpath in xpaths {
        match wait_xpath(client, xpath, 3).await {
            Ok(el) => {
                info!(xpath, "Found profile menu button (XPath)");
                return Ok(el);
            }
            Err(_) => continue,
        }
    }

    // Last resort: stamp the best visible profile-chrome candidate, then re-find.
    let stamp_js = r#"
        const needles = ['profile settings', 'see option', 'more option', 'see options'];
        const nodes = Array.from(document.querySelectorAll('[role="button"]'));
        const scored = [];
        for (const el of nodes) {
            const label = (el.getAttribute('aria-label') || '').toLowerCase();
            if (!label || !needles.some(n => label.includes(n))) continue;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const rect = el.getBoundingClientRect();
            if (rect.width < 8 || rect.height < 8) continue;
            let score = 0;
            if (rect.top < 500) score += 3;
            if (el.getAttribute('aria-haspopup') === 'menu') score += 3;
            if (label.includes('profile')) score += 2;
            if (label.includes('option')) score += 2;
            scored.push({ el, score });
        }
        scored.sort((a, b) => b.score - a.score);
        if (!scored.length) return false;
        scored[0].el.setAttribute('data-sp-profile-menu', '1');
        return true;
    "#;

    if let Ok(serde_json::Value::Bool(true)) = client.execute(stamp_js, vec![]).await {
        if let Ok(el) = wait_css(client, r#"[data-sp-profile-menu="1"]"#, 2).await {
            info!("Found profile menu button (JS stamp)");
            let _ = client
                .execute(
                    r#"document.querySelectorAll('[data-sp-profile-menu]').forEach(e => e.removeAttribute('data-sp-profile-menu'))"#,
                    vec![],
                )
                .await;
            return Ok(el);
        }
    }

// WHY: fantoccini has no free-form NoSuchElement constructor; WaitTimeout is
    // the established miss signal from Client::wait chains elsewhere in this module.
    Err(CmdError::WaitTimeout)
}

async fn get_posts_report_btns(client: &Client) -> Result<Vec<Element>, CmdError> {
    // Scroll 3 pages to get recent posts
    for _ in 1..=3 {
        client.mouse_scroll(0, 720).await?;
    }
    // Scroll back to top
    client.mouse_scroll(0, -720 * 3).await?;

    // WHY: FB renamed post ⋯ control from exact "Actions for this post" to
    // "Actions for this post by {Name}" (observed 2026-07 headful probe).
    // Prefer prefix / contains selectors; keep legacy exact match for reverts.
    let selectors = [
        r#"[role="button"][aria-haspopup="menu"][aria-label^="Actions for this post"]"#,
        r#"[role="button"][aria-label^="Actions for this post"]"#,
        r#"div[role="button"][aria-label^="Actions for this post"]"#,
        r#"[role="button"][aria-haspopup="menu"][aria-label*="Actions for this post"]"#,
        r#"[role="button"][aria-label*="Actions for this post"]"#,
        r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="Actions for this post"]"#,
        r#"div[aria-haspopup="menu"][role="button"][aria-label="Actions for this post"]"#,
        r#"div[role="button"][aria-label="Actions for this post"]"#,
        r#"[role="button"][aria-label^="More options for this post"]"#,
        r#"[role="button"][aria-label*="More options for this post"]"#,
        // Alternate control seen on some feeds
        r#"[role="button"][aria-label="Hide or report this"]"#,
        r#"[role="button"][aria-label*="Hide or report"]"#,
    ];

    for attempt in 1..=3 {
        for selector in &selectors {
            let results = client.find_all(Locator::Css(selector)).await;
            match results {
                Ok(ref elements) if !elements.is_empty() => {
                    info!(
                        count = elements.len(),
                        attempt,
                        selector,
                        "Found post report buttons"
                    );
                    return results;
                }
                _ => continue,
            }
        }

        let xpath = r#"//*[@role="button" and (starts-with(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'actions for this post') or contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'more options for this post') or contains(translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'hide or report'))]"#;
        if let Ok(elements) = client.find_all(Locator::XPath(xpath)).await {
            if !elements.is_empty() {
                info!(
                    count = elements.len(),
                    attempt, "Found post report buttons (XPath)"
                );
                return Ok(elements);
            }
        }

        // JS stamp: collect post action buttons by aria-label prefix.
        let stamp_js = r#"
            document.querySelectorAll('[data-sp-post-menu]').forEach(e => e.removeAttribute('data-sp-post-menu'));
            const nodes = Array.from(document.querySelectorAll('[role="button"]'));
            let n = 0;
            for (const el of nodes) {
                const label = (el.getAttribute('aria-label') || '').toLowerCase();
                if (!label.startsWith('actions for this post') && !label.includes('more options for this post') && !label.includes('hide or report')) continue;
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') continue;
                const rect = el.getBoundingClientRect();
                if (rect.width < 8 || rect.height < 8) continue;
                el.setAttribute('data-sp-post-menu', String(++n));
            }
            return n;
        "#;
        if let Ok(serde_json::Value::Number(count)) = client.execute(stamp_js, vec![]).await {
            if count.as_u64().unwrap_or(0) > 0 {
                if let Ok(elements) = client
                    .find_all(Locator::Css(r#"[data-sp-post-menu]"#))
                    .await
                {
                    if !elements.is_empty() {
                        info!(
                            count = elements.len(),
                            attempt, "Found post report buttons (JS stamp)"
                        );
                        return Ok(elements);
                    }
                }
            }
        }

        if attempt < 3 {
            debug!(attempt, "No post buttons found, waiting before retry...");
            delay(None);
        }
    }

    warn!("No post action buttons found after all attempts");
    Ok(vec![])
}

async fn is_temporary_limited(client: &Client) -> Result<bool, CmdError> {
    let dialog_title = client
        .find(Locator::Css(r#"div[role=dialog] span[dir=auto]"#))
        .await;
    if let Ok(dialog_title) = dialog_title {
        let title = dialog_title.text().await?;
        if title
            .trim()
            .to_lowercase()
            .contains(&"Temporarily Blocked".to_lowercase())
        {
            warn!(target: "fb", "Temporarily blocked from reporting. Aborting....");
            return Ok(true);
        }
    }

    Ok(false)
}

/// True when visible text looks like a Report menu entry (EN + common VI).
fn is_report_label(text: &str) -> bool {
    let t = text.trim().to_lowercase();
    if t.is_empty() || t.len() >= 80 {
        return false;
    }
    // WHY: Prefer short labels so we do not click a parent that concatenates the whole menu.
    t.contains("report") || t.contains("báo cáo") || t.contains("bao cao")
}

/// After opening a ⋯ menu, wait for menu surface before scanning items.
async fn wait_for_open_menu(client: &Client) {
    for selector in [
        r#"[role="menu"] [role="menuitem"]"#,
        r#"[role="menuitem"]"#,
        r#"[role="menu"]"#,
        r#"[aria-label="Additional profile actions menu"]"#,
    ] {
        if wait_css(client, selector, 4).await.is_ok() {
            return;
        }
    }
    // Best-effort settle if selectors miss an A/B layout.
    delay(Some(Duration::from_secs(1)));
}

async fn click_report_in_open_menu(client: &Client, target: &str) -> Result<bool, CmdError> {
    // Prefer role=menuitem (profile menu: "Report profile").
    let mut menu_items = client
        .find_all(Locator::Css(r#"[role="menuitem"]"#))
        .await
        .unwrap_or_default();
    if menu_items.is_empty() {
        menu_items = client
            .find_all(Locator::Css(r#"div[role=menuitem]"#))
            .await
            .unwrap_or_default();
    }

    // Prefer items whose text is a short "report*" label; do not shuffle those away first.
    let mut report_items = Vec::new();
    let mut other_items = Vec::new();
    for item in menu_items {
        let item_text = item.text().await.unwrap_or_default();
        if is_report_label(&item_text) {
            report_items.push((item, item_text));
        } else {
            other_items.push(item);
        }
    }
    // Stable preference: shorter labels first ("Report profile" over longer junk).
    report_items.sort_by_key(|(_, t)| t.len());
    for (item, item_text) in report_items {
        debug!(%target, %item_text, "Clicking report menuitem...");
        client.perform_click(&item).await?;
        return Ok(true);
    }
    let _ = other_items;

    // Fallback: post menus may use different structure (no role=menuitem)
    debug!(%target, "No menuitem with 'report' found, trying fallback selectors...");
    let fallback_selectors = [
        r#"[role="menu"] [role="menuitem"]"#,
        r#"div[role="menu"] div[role="button"]"#,
        r#"div[role="menu"] div[tabindex]"#,
        r#"[role="menu"] [role="button"]"#,
        r#"[role="dialog"] [role="menuitem"]"#,
        r#"[role="listbox"] [role="option"]"#,
        r#"[aria-label="Additional profile actions menu"] [role="menuitem"]"#,
    ];
    for selector in &fallback_selectors {
        if let Ok(items) = client.find_all(Locator::Css(selector)).await {
            for item in items {
                if let Ok(text) = item.text().await {
                    if is_report_label(&text) {
                        debug!(%target, %text, selector, "Clicking button (fallback)...");
                        client.perform_click(&item).await?;
                        return Ok(true);
                    }
                }
            }
        }
    }

    // XPath: click the menuitem / short node, not a giant container.
    let xpath = r#"//*[@role="menuitem" and (contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'report') or contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'báo cáo'))]"#;
    if let Ok(items) = client.find_all(Locator::XPath(xpath)).await {
        for item in items {
            if let Ok(text) = item.text().await {
                if is_report_label(&text) {
                    debug!(%target, %text, "Clicking button (XPath menuitem)...");
                    if client.perform_click(&item).await.is_ok() {
                        return Ok(true);
                    }
                }
            }
        }
    }

    Ok(false)
}

async fn report_process(
    client: &Client,
    target: &str,
    menu_btn: &Element,
) -> Result<bool, CmdError> {
    debug!(%target, "Clicking 'menu' button...");
    // Ensure control is in view; JS click alone can miss off-screen post menus.
    let _ = client.mouse_move_to_element(menu_btn).await;
    client.perform_click(menu_btn).await?;
    wait_for_open_menu(client).await;

    let found_report = click_report_in_open_menu(client, target).await?;
    if !found_report {
        warn!(%target, "Could not find 'Report' option in menu");
    }
    delay(None);

    if let Ok(true) = is_temporary_limited(client).await {
        return Ok(true);
    }

    // Only walk the reason dialog if we actually opened the report flow.
    if !found_report {
        return Ok(false);
    }

    loop {
        debug!(%target, "Checking for report options...");
        match client
            .find_all(Locator::Css(
                r#"div[role="dialog"] div[role="listitem"] div[role="button"]"#,
            ))
            .await
        {
            Ok(reasons) => {
                let mut filtered_reasons = Vec::new();
                let mut filtered_reasons_str = Vec::new();
                for reason in reasons {
                    if !reason.is_displayed().await? {
                        continue;
                    }
                    let reason_str = reason.text().await?;
                    if [
                        "Pretending to be someone".to_lowercase(),
                        "I want to help".to_lowercase(),
                        "A specific post".to_lowercase(),
                        "Block".to_lowercase(),
                        "Hide".to_lowercase(),
                        "Cancel".to_lowercase(),
                    ]
                    .iter()
                    .any(|r| reason_str.trim().to_lowercase().contains(r))
                    {
                        continue;
                    }
                    filtered_reasons.push(reason);
                    filtered_reasons_str.push(reason_str);
                }
                if filtered_reasons.is_empty() {
                    debug!(%target, "No valid report option, proceeding to submit...");
                    break;
                }
                {
                    let fmt_filtered_reason_str = format!("{:?}", filtered_reasons_str);
                    debug!(%target, filtered_reasons_str = fmt_filtered_reason_str, "Found");
                }
                // Picking reason
                let chosen_report = filtered_reasons.choose(&mut rand::rng()).unwrap();
                let reason = chosen_report.text().await?;
                let reason_str = format!("{:?}", reason);
                info!(%target, reason = %reason_str, "Choosing reason...");
                client.mouse_move_to_element(chosen_report).await?;
                client.perform_click(chosen_report).await?;
                delay(None);

                let mut is_done = false;
                for btn_css in [
                    r#"div[role="dialog"] div[aria-label="Submit"][role="button"]"#,
                    r#"div[role="dialog"] div[aria-label="Next"][role="button"]"#,
                    r#"div[role="dialog"] div[aria-label="Done"][role="button"]"#,
                    r#"div[role="dialog"] [aria-label="Submit"][role="button"]"#,
                    r#"div[role="dialog"] [aria-label="Next"][role="button"]"#,
                    r#"div[role="dialog"] [aria-label="Done"][role="button"]"#,
                    r#"div[role="dialog"] [aria-label="Continue"][role="button"]"#,
                ] {
                    match client.find(Locator::Css(btn_css)).await {
                        Ok(btn) => {
                            let btn_text = btn.text().await.unwrap_or_default();
                            let btn_text_str = format!("{:?}", btn_text);
                            debug!(%target, btn_text = %btn_text_str, "Clicking");
                            client.mouse_move_to_element(&btn).await?;
                            client.perform_click(&btn).await?;
                            delay(None);
                            is_done = true;
                        }
                        _ => (),
                    }
                }

                if is_done {
                    break;
                }
            }
            Err(_) => break,
        }
    }

    Ok(false)
}

pub async fn report(client: &Client, target: &str) -> Result<bool, CmdError> {
    if check_availability(client).await.is_ok() {
        warn!(%target, "User not found");
        return Ok(false);
    }

    // Profile menu is best-effort: if FB renames the control again, still try posts.
    match get_account_report_btn(client).await {
        Ok(account_report_btn) => {
            match report_process(client, target, &account_report_btn).await {
                Ok(is_temporary_limited) => {
                    if is_temporary_limited {
                        return Ok(true);
                    }
                }
                Err(e) => {
                    error!(%target, error = %e, "Account report process failed");
                }
            }
        }
        Err(e) => {
            warn!(
                %target,
                error = %e,
                "Profile menu button not found; continuing with post reports"
            );
        }
    }

    let posts_report_btns = get_posts_report_btns(client).await;
    if let Err(e) = posts_report_btns {
        warn!(%target, error = %e, "Found no post to report");
        return Ok(false);
    }
    let posts_report_btns = posts_report_btns?;
    if posts_report_btns.is_empty() {
        debug!(%target, "No post action buttons found on profile");
    }
    for menu_btn in posts_report_btns {
        match report_process(client, target, &menu_btn).await {
            Ok(is_temporary_limited) => {
                if is_temporary_limited {
                    return Ok(true);
                }
            }
            Err(e) => {
                error!(%target, error = %e);
            }
        }
    }

    Ok(false)
}
