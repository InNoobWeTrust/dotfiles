use core::time::Duration;
use fantoccini::{elements::Element, error::CmdError, Client, Locator};
use rand::seq::SliceRandom;
use tracing::{debug, error, info, warn};

use crate::driver::{mouse_move_to_element, mouse_scroll, perform_click};
use crate::utils::delay;

async fn check_availability(client: &Client) -> Result<Element, CmdError> {
    client
        .wait()
        .at_most(Duration::from_secs(10))
        .for_element(Locator::Css(
            r#"a[href="/"][role="link"][tabindex="0"][aria-label="Go to News Feed"]"#,
        ))
        .await
}

async fn get_account_report_btn(client: &Client) -> Result<Element, CmdError> {
    let old_btn = client
        .wait()
        .at_most(Duration::from_secs(10))
        .for_element(Locator::Css(r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="See Options"]"#))
        .await;

    if let Err(_) = old_btn {
        return client
        .wait()
        .at_most(Duration::from_secs(10))
        .for_element(Locator::Css(r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="See options"]"#))
        .await;
    }

    old_btn
}

async fn get_posts_report_btns(client: &Client) -> Result<Vec<Element>, CmdError> {
    // Scroll 3 pages to get recent posts
    for _ in 1..=3 {
        mouse_scroll(client, 0, 720).await?;
    }
    // Scroll back to top
    mouse_scroll(client, 0, -720 * 3).await?;
    client
        .find_all(Locator::Css(r#"div[aria-expanded="false"][aria-haspopup="menu"][role="button"][aria-label="Actions for this post"]"#))
        .await
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

async fn report_process(
    client: &Client,
    target: &str,
    menu_btn: &Element,
) -> Result<bool, CmdError> {
    debug!(%target, "Clicking 'menu' button...");
    perform_click(client, menu_btn).await?;
    delay(None);

    let mut menu_items = client
        .find_all(Locator::Css(r#"div[role=menuitem]"#))
        .await?;
    menu_items.shuffle(&mut rand::thread_rng());
    for item in menu_items {
        let item_text = item.text().await?;
        if item_text.to_lowercase().contains("report") {
            debug!(%target, %item_text, "Clicking button...");
            perform_click(client, &item).await?;
            break;
        }
    }
    delay(None);

    if let Ok(true) = is_temporary_limited(client).await {
        return Ok(true);
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
                if filtered_reasons.len() == 0 {
                    debug!(%target, "No valid report option, proceeding to submit...");
                    break;
                }
                {
                    let fmt_filtered_reason_str = format!("{:?}", filtered_reasons_str);
                    debug!(%target, filtered_reasons_str = fmt_filtered_reason_str, "Found");
                }
                // Picking reason
                let chosen_report = filtered_reasons.choose(&mut rand::thread_rng()).unwrap();
                let reason = chosen_report.text().await?;
                let reason_str = format!("{:?}", reason);
                info!(%target, reason = %reason_str, "Choosing reason...");
                mouse_move_to_element(client, chosen_report).await?;
                perform_click(client, chosen_report).await?;
                delay(None);

                let mut is_done = false;
                for btn_css in [
                    r#"div[role="dialog"] div[aria-label="Submit"][role="button"]"#,
                    r#"div[role="dialog"] div[aria-label="Next"][role="button"]"#,
                    r#"div[role="dialog"] div[aria-label="Done"][role="button"]"#,
                ] {
                    match client.find(Locator::Css(btn_css)).await {
                        Ok(btn) => {
                            let btn_text = btn.text().await?;
                            let btn_text_str = format!("{:?}", btn_text);
                            debug!(%target, btn_text = %btn_text_str, "Clicking");
                            mouse_move_to_element(client, &btn).await?;
                            perform_click(client, &btn).await?;
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
    if let Ok(_) = check_availability(client).await {
        warn!(%target, "User not found");
        return Ok(false);
    }
    let account_report_btn = get_account_report_btn(client).await?;
    match report_process(client, target, &account_report_btn).await {
        Ok(is_temporary_limited) => {
            if is_temporary_limited {
                return Ok(true);
            }
        }
        Err(e) => {
            error!(%target, error = %e);
        }
    }

    let posts_report_btn = get_posts_report_btns(client).await;
    if let Err(e) = posts_report_btn {
        warn!(%target, error = %e, "Found no post to report");
        return Ok(false);
    }
    for menu_btn in posts_report_btn? {
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
