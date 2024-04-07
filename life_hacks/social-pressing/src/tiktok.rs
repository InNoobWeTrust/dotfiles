use core::time::Duration;
use fantoccini::{error::CmdError, Client, Locator};
use futures::future;
use log::{debug, info, warn};
use rand::seq::SliceRandom;

use crate::driver::perform_click;
use crate::utils::delay;

pub async fn report(client: &Client, target: &str) -> Result<(), CmdError> {
    client.goto(target).await?;
    delay(Some(Duration::from_secs(2)));

    if let Ok(_) = client.find(Locator::Id(r#"login-modal"#)).await {
        debug!(target: target, "Dismissing login overlay...");
        // try to remove the login overlay
        client
            .execute(
                "document.getElementById('login-modal')?.parentElement?.parentElement?.parentElement?.remove()",
                Vec::new(),
            )
            .await?;
    }
    if let Ok(_) = client.find(Locator::Id(r#"tiktok-verify-ele"#)).await {
        warn!(target: target, "Get caught by captcha. Be careful!");
        // try to remove the captcha solver
        client
            .execute(
                "document.getElementById('tiktok-verify-ele')?.remove()",
                Vec::new(),
            )
            .await?;
    }
    if let Ok(_) = client.find(Locator::Id(r#"#app-header"#)).await {
        debug!(target: target, "Dismissing header overlay...");
        // try to remove the header overlay
        client
            .execute(
                "document.getElementById('app-header')?.remove()",
                Vec::new(),
            )
            .await?;
    }

    let more_btn = client
        .find(Locator::Css(
            r#"div[role="button"][aria-label="Actions"][tabindex="0"][data-e2e="user-more"]"#,
        ))
        .await;
    if let Err(_) = more_btn {
        warn!(target: target, "User not found, skipping...");
        return Ok(());
    }
    debug!(target: target, "Clicking 'more' button...");
    perform_click(client, &more_btn?).await?;
    delay(None);

    let report_btn = client
        .find(Locator::Css(
            r#"div[data-e2e="user-report"] > div[role="button"][aria-label="Report"][tabindex="0"]"#,
        )).await?;
    debug!(target: target, "Clicking 'report' button...");
    report_btn.click().await?;
    delay(None);

    loop {
        debug!(target: target, "Checking for report options...");
        match client
            .find_all(Locator::Css(r#"form[data-e2e="report-form"] > div:last-child > label[data-e2e="report-card-reason"] > div:first-child"#))
            .await {
            Ok(report_types) =>  {
                let reason_str = future::join_all(report_types.clone().iter().map(|r| r.text())).await.into_iter().map(|r| r.unwrap()).collect::<Vec<_>>();
                debug!(target: target, "Found: {reason_str:?}");
                if report_types.len() == 0 {
                    debug!(target: target, "No report option, proceeding to submit...");
                    break;
                }
                // Picking reason
                loop {
                    let chosen_report = report_types.choose(&mut rand::thread_rng()).unwrap();
                    let reason = chosen_report.text().await?;
                    if [
                        "Counterfeits and intellectual property",
                        "Pretending to Be Someone",
                    ].iter().any(|r| reason.trim().contains(r)) {
                        continue;
                    }
                    info!(target: target, "Choosing reason {reason:?}...");
                    perform_click(client, &chosen_report).await?;
                    delay(None);
                    break;
                }
            },
            Err(_) => break,
        }
    }
    debug!(target: target, "Submitting...");
    let submit_btn = client
        .find(Locator::Css(
            r#"form[data-e2e="report-form"] > div:last-child > div:last-child > button"#,
        ))
        .await?;
    perform_click(client, &submit_btn).await?;
    delay(None);
    debug!(target: target, "Finishing...");
    let finish_btn = client
        .find(Locator::Css(
            r#"div[data-e2e="report-form"] > div > button:last-child"#,
        ))
        .await?;
    perform_click(client, &finish_btn).await?;
    delay(None);

    Ok(())
}
