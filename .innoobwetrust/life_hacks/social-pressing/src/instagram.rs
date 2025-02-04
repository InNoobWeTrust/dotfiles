use core::time::Duration;
use fantoccini::{elements::Element, error::CmdError, Client, Locator};
use rand::prelude::*;
use tracing::{debug, error, info, warn};

use crate::driver::{mouse_move_to_element, perform_click};
use crate::utils::delay;

async fn get_account_report_btn(client: &Client) -> Result<Element, CmdError> {
    client
        .wait()
        .at_most(Duration::from_secs(10))
        .for_element(Locator::Css(
            r#"main > div > header > section:nth-child(2) > div > div > div:nth-child(3) > div[role="button"][tabindex="0"]"#,
        ))
        .await
}

async fn is_temporary_limited(_client: &Client) -> Result<bool, CmdError> {
    // TODO: Checking if temporary limited

    //let dialog_title = client
    //    .find(Locator::Css(r#"div[role=dialog] span[dir=auto]"#))
    //    .await;
    //if let Ok(dialog_title) = dialog_title {
    //    let title = dialog_title.text().await?;
    //    if title
    //        .trim()
    //        .to_lowercase()
    //        .contains(&"Temporarily Blocked".to_lowercase())
    //    {
    //        warn!(target: "fb", "Temporarily blocked from reporting. Aborting....");
    //        return Ok(true);
    //    }
    //}

    Ok(false)
}

async fn choose_report_option(client: &Client, target: &str) -> Result<bool, CmdError> {
    let reasons = client
        .find_all(Locator::Css(
            r#"div[role="dialog"] div[role="list"] > button"#,
        ))
        .await
        .unwrap_or_default();

    let specific_reasons = client
        .find_all(Locator::Css(
            r#"fieldset > div > div[role="button"][tabindex="0"]"#,
        ))
        .await
        .unwrap_or_default();

    let mut filtered_reasons = Vec::new();
    let mut filtered_reasons_str = Vec::new();

    match (reasons.len() > 0, specific_reasons.len() > 0) {
        (true, false) => {
            for reason in reasons {
                if !reason.is_displayed().await? {
                    continue;
                }
                let reason_str = reason.text().await?;
                if [
                    "It's pretending to be someone else".to_lowercase(),
                    "They may be under the age of 13".to_lowercase(),
                    "Intellectual property violation".to_lowercase(),
                ]
                .iter()
                .any(|r| reason_str.trim().to_lowercase().contains(r))
                {
                    continue;
                }
                filtered_reasons.push(reason);
                filtered_reasons_str.push(reason_str);
            }
        }
        (false, true) => {
            for reason in specific_reasons {
                if !reason.is_displayed().await? {
                    continue;
                }
                let reason_str = reason.text().await?;
                filtered_reasons.push(reason);
                filtered_reasons_str.push(reason_str);
            }
        }
        _ => {
            warn!(
                target = target,
                "No report option found, proceeding to submit..."
            );
            return Ok(true);
        }
    }

    if filtered_reasons.len() == 0 {
        debug!(
            target = target,
            "No valid report option, proceeding to submit..."
        );
        return Ok(true);
    }

    debug!(target = target, "Found: {filtered_reasons_str:?}");

    // Picking reason
    let chosen_report = filtered_reasons.choose(&mut rand::rng()).unwrap();
    let reason = chosen_report.text().await?;

    info!(target = target, "Choosing reason {reason:?}...");

    mouse_move_to_element(client, chosen_report).await?;
    perform_click(client, chosen_report).await?;
    delay(None);

    Ok(false)
}

async fn report_process(
    client: &Client,
    target: &str,
    menu_btn: &Element,
) -> Result<bool, CmdError> {
    debug!(target = target, "Clicking 'menu' button...");
    perform_click(client, menu_btn).await?;
    delay(None);

    let mut menu_items = client
        .find_all(Locator::Css(r#"div[role="dialog"] > button[tabindex="0"]"#))
        .await?;
    menu_items.shuffle(&mut rand::rng());
    for item in menu_items {
        let item_text = item.text().await?;
        if item_text.to_lowercase().contains("report") {
            debug!(target = target, "Clicking '{item_text}' button...");
            perform_click(client, &item).await?;
            break;
        }
    }
    delay(None);

    if let Ok(true) = is_temporary_limited(client).await {
        return Ok(true);
    }

    let mut menu_items = client
        .find_all(Locator::Css(
            r#"div[role="dialog"] div[role="list"] > button"#,
        ))
        .await?;
    menu_items.shuffle(&mut rand::rng());
    for item in menu_items {
        let item_text = item.text().await?;
        if item_text.to_lowercase().contains("report account") {
            debug!(target = target, "Clicking '{item_text}' button...");
            perform_click(client, &item).await?;
            break;
        }
    }
    delay(None);

    if let Ok(true) = is_temporary_limited(client).await {
        return Ok(true);
    }

    debug!(target = target, "Checking for report options...");
    loop {
        match choose_report_option(client, target).await {
            Ok(is_done) => {
                if is_done {
                    break;
                }
            }
            _ => (),
        }

        // Try pressing submit after every choice made
        let mut is_finished = false;
        for btn_css in [
            r#"div[role="dialog"] > div > div > div > div > div > div > button[type="button"]"#, // Submit report
            r#"div[role="dialog"] > div > div > div > div > div > div > div:nth-child(4) > button[type="button"]"#, // Close
        ] {
            match client.find(Locator::Css(btn_css)).await {
                Ok(btn) => {
                    if btn.attr("disabled").await?.is_some() {
                        // Skip if button is disabled
                        continue;
                    }
                    let btn_text = btn.text().await?;
                    debug!(target = target, "Clicking {btn_text}");
                    mouse_move_to_element(client, &btn).await?;
                    perform_click(client, &btn).await?;
                    delay(None);
                    is_finished = true;
                }
                _ => (),
            }
        }

        if is_finished {
            break;
        }
    }

    Ok(false)
}

pub async fn report(client: &Client, target: &str) -> Result<bool, CmdError> {
    let account_report_btn = get_account_report_btn(client).await;
    if let Err(e) = account_report_btn {
        warn!(target = target, "User not found for {target}, error: {e}");
        return Ok(false);
    }
    match report_process(client, target, &account_report_btn?).await {
        Ok(is_temporary_limited) => {
            if is_temporary_limited {
                return Ok(true);
            }
        }
        Err(e) => {
            error!(target = target, "{e}");
        }
    }

    Ok(false)
}
