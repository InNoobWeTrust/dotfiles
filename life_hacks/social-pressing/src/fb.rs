use core::time::Duration;
use fantoccini::elements::Element;
use fantoccini::error::CmdError;
use fantoccini::{Client, Locator};
use log::{debug, info, warn};
use rand::seq::SliceRandom;

use crate::driver::perform_click;
use crate::utils::delay;

async fn get_account_report_btn(client: &Client) -> Result<Element, CmdError> {
    client
        .wait()
        .at_most(Duration::from_secs(10))
        .for_element(Locator::Css(r#"div[aria-haspopup="menu"][role="button"]"#))
        .await
}

async fn get_posts_report_btns(client: &Client) -> Result<Vec<Element>, CmdError> {
    client
        .find_all(Locator::Css(r#"div[aria-expanded="false"][aria-haspopup="menu"][aria-label="Actions for this post"]"#))
        .await
}

async fn report_process(client: &Client, target: &str, menu_btn: &Element) -> Result<(), CmdError> {
    debug!(target: target, "Clicking 'menu' button...");
    perform_click(client, menu_btn).await?;
    delay(None);

    let mut menu_items = client
        .find_all(Locator::Css(r#"div[role=menuitem]"#))
        .await?;
    menu_items.shuffle(&mut rand::thread_rng());
    for item in menu_items {
        let item_text = item.text().await?;
        if item_text.to_lowercase().contains("report") {
            debug!(target: target, "Clicking '{item_text}' button...");
            perform_click(client, &item).await?;
            break;
        }
    }
    delay(None);

    loop {
        debug!(target: target, "Checking for report options...");
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
                    debug!(target: target, "No valid report option, proceeding to submit...");
                    break;
                }
                debug!(target: target, "Found: {filtered_reasons_str:?}");
                // Picking reason
                let chosen_report = filtered_reasons.choose(&mut rand::thread_rng()).unwrap();
                let reason = chosen_report.text().await?;
                info!(target: target, "Choosing reason {reason:?}...");
                match perform_click(client, chosen_report).await {
                    Ok(()) => (),
                    Err(_) => {
                        // Until items are not clickable, proceed to submit
                        break;
                    }
                }
                delay(None);
            }
            Err(_) => break,
        }
    }

    for btn_css in [
        r#"div[role="dialog"] div[aria-label="Submit"][role="button"]"#,
        r#"div[role="dialog"] div[aria-label="Next"][role="button"]"#,
        r#"div[role="dialog"] div[aria-label="Done"][role="button"]"#,
    ] {
        match client.find(Locator::Css(btn_css)).await {
            Ok(btn) => {
                let btn_text = btn.text().await?;
                debug!(target: target, "Clicking {btn_text}");
                perform_click(client, &btn).await?;
                delay(None);
            }
            _ => (),
        }
    }

    Ok(())
}

pub async fn report(client: &Client, target: &str) -> Result<(), CmdError> {
    let account_report_btn = get_account_report_btn(client).await;
    if let Err(e) = account_report_btn {
        warn!(target: target, "User not found for {target}, error: {e}");
        return Ok(());
    }
    report_process(client, target, &account_report_btn?).await?;

    let posts_report_btn = get_posts_report_btns(client).await;
    if let Err(e) = posts_report_btn {
        warn!(target: target, "Found no post to report for {target}, error: {e}");
        return Ok(());
    }
    for menu_btn in posts_report_btn? {
        let report_result = report_process(client, target, &menu_btn).await;
        debug!(target: target, "{report_result:?}");
    }

    Ok(())
}
