use fantoccini::actions::InputSource;
use fantoccini::error::CmdError;
use fantoccini::{actions, Client, ClientBuilder, Locator};
use futures::future;
use log::{debug, info, warn};
use rand::seq::SliceRandom;
use std::io::{self, BufRead, BufReader};
use std::{env, fs, thread, time};

fn read_lines(filename: String) -> io::Lines<BufReader<fs::File>> {
    // Open the file in read-only mode.
    let file = fs::File::open(filename).unwrap();
    // Read the file line by line, and return an iterator of the lines of the file.
    io::BufReader::new(file).lines()
}

fn rand() -> u32 {
    time::SystemTime::now()
        .duration_since(time::UNIX_EPOCH)
        .unwrap()
        .subsec_nanos()
}

fn rand_delay_duration() -> time::Duration {
    let millis = (rand() / 1000 % 4 + 1) * 1000 + (rand() / 100 % 1000 + 1); // Max 5s
    let millis = time::Duration::from_millis(millis as u64);
    millis
}

fn delay(duration: Option<time::Duration>) {
    let duration = duration.unwrap_or_else(|| rand_delay_duration());
    let duration_str = human_duration::human_duration(&duration);
    debug!("Sleeping for {duration_str}...");
    thread::sleep(duration);
}

async fn get_client() -> Result<Client, CmdError> {
    let capabilities = serde_json::json!({
        "browserName": "firefox",
        "moz:firefoxOptions": {
            "prefs": {
                "intl.accept_languages": "en-GB"
            },
            "args": [
                "-headless",
                "--enable-automation=False",
                "--disable-blink-features=AutomationControlled"
            ]
        },
        "timeouts": {
            "pageLoad": 10_000,
            "implicit": 5_000,
            "script": 120_000,
        }
    });

    let capabilities = capabilities.as_object().unwrap().to_owned();
    let client = ClientBuilder::native()
        .capabilities(capabilities)
        .connect("http://localhost:4444")
        .await
        .expect("failed to connect to WebDriver");
    Ok(client)
}

async fn report(client: &Client, target: &str) -> Result<(), CmdError> {
    info!(target: target, "Reporting {target}...");
    client.goto(target).await?;
    delay(None);

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

    let more_btn = client
        .find(Locator::Css(
            r#"div[role="button"][aria-label="Actions"][tabindex="0"][data-e2e="user-more"]"#,
        ))
        .await;
    if let Err(_) = more_btn {
        warn!(target: target, "User not found, skipping...");
        return Ok(());
    }
    let mouse_move_to_more =
        actions::MouseActions::new("mouse".into()).then(actions::PointerAction::MoveToElement {
            element: more_btn?,
            duration: Some(rand_delay_duration()),
            x: 0,
            y: 0,
        });
    debug!(target: target, "Clicking 'more' button...");
    client.perform_actions(mouse_move_to_more).await?;
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
                    if vec![
                        "Counterfeits and intellectual property",
                        "Pretending to Be Someone",
                    ].iter().any(|r| reason.trim().contains(r)) {
                        continue;
                    }
                    info!(target: target, "Choosing reason {reason:?}...");
                    chosen_report.click().await?;
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
    submit_btn.click().await?;
    delay(None);
    debug!(target: target, "Finishing...");
    let finish_btn = client
        .find(Locator::Css(
            r#"div[data-e2e="report-form"] > div > button:last-child"#,
        ))
        .await?;
    finish_btn.click().await?;
    delay(None);

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), CmdError> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();

    let link_file = env::args().nth(1).expect("no link file provided");

    let client = get_client().await?;
    //login(&client, cookies).await?;
    let mut lines: Vec<_> = read_lines(link_file)
        .map(|l| l.unwrap())
        .collect::<Vec<_>>();
    lines.shuffle(&mut rand::thread_rng());
    let start = time::Instant::now();
    info!(target: "main", "Starting...");
    for target in lines {
        if target.trim().starts_with("https://www.tiktok.com/") {
            // Randomly report n times, max 3 times
            for _ in 0..=(rand() / 1_000 % 3) {
                match report(&client, target.trim()).await {
                    Ok(_) => {
                        // Ensure some long enough delays between targets
                        delay(Some(time::Duration::from_secs(
                            start.elapsed().as_secs() % 30,
                        )));
                    }
                    Err(e) => {
                        warn!(target: "main", "Reporting failed for {target}, error: {e:?}");
                    }
                }
            }
        }
    }
    let end = time::Instant::now();
    let total = end - start;
    let total = human_duration::human_duration(&total);
    info!(target: "main", "Finished in {total}");

    client.close().await
}
