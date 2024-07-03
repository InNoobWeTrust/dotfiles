mod constants;
mod driver;
mod fb;
mod instagram;
mod tiktok;
mod utils;

use clap::Parser;
use core::future::Future;
use core::time::Duration;
use fantoccini::cookies::Cookie;
use fantoccini::error::CmdError;
use log::{debug, error, info, warn};
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashSet;
use std::error::Error;
use std::fs;
use std::io::{self, BufRead};
use std::time::Instant;
use tokio::time::timeout;
use url::Url;

use crate::driver::login;
use crate::utils::delay;

fn read_lines(filename: &str) -> Vec<String> {
    // Open the file in read-only mode.
    let file = fs::File::open(filename).unwrap();
    // Read the file line by line, and return an iterator of the lines of the file.
    io::BufReader::new(file)
        .lines()
        .filter(|l| l.is_ok())
        .map(|l| l.unwrap().to_owned())
        .filter(|l| !l.trim().is_empty())
        .collect::<Vec<_>>()
}

async fn report_step(
    reporter: impl Future<Output = Result<bool, CmdError>>,
    domain: constants::Domain,
    target: &str,
    comment: &str,
    wait: Duration,
    start: Instant,
    limitation_status: &mut HashSet<constants::Domain>,
    success_lst: &mut Vec<(String, String)>,
    failure_lst: &mut Vec<(String, String, String, String)>,
) -> Result<bool, CmdError> {
    if limitation_status.contains(&domain) {
        info!("{domain} is temporarily limited, skipping {target} <{comment}>");
        failure_lst.push((
            target.to_string(),
            comment.to_string(),
            format!("{} is temporarily limited", domain),
            "".to_string(),
        ));
        return Ok(true);
    }

    info!(target: domain.to_string().as_str(), "Pressing on {domain} for {target} <{comment}>...");

    match timeout(wait, reporter).await {
        Ok(Ok(is_temporary_limited)) => {
            if is_temporary_limited {
                limitation_status.insert(domain);
            }
            success_lst.push((target.to_string(), comment.to_string()));
            // Ensure some long enough delays between targets
            delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
        }
        Ok(Err(e)) => {
            error!(target: domain.to_string().as_str(), "Reporting failed for {target} <{comment}>, error: {e:?}");
            failure_lst.push((
                target.to_string(),
                comment.to_string(),
                "Reporting failed with error".to_string(),
                e.to_string(),
            ));
        }
        Err(e) => {
            error!(target: domain.to_string().as_str(), "Reporting timeout for {target} <{comment}>, error: {e:?}");
            failure_lst.push((
                target.to_string(),
                comment.to_string(),
                "Reporting timeout".to_string(),
                e.to_string(),
            ));
        }
    }

    Ok(false)
}

async fn report(
    links: &[String],
    cookies: &[Cookie<'_>],
    wait: Duration,
    time_limit: &Option<Duration>,
) -> Result<(), Box<dyn Error>> {
    info!("Getting webdriver...");
    let client = driver::get_client().await?;
    info!("Starting...");
    let start = Instant::now();
    let mut login_status = HashSet::<constants::Domain>::new();
    let mut limitation_status = HashSet::<constants::Domain>::new();
    let mut success_lst = Vec::new();
    let mut failure_lst = Vec::new();

    for target in links {
        let mut parts = target.trim().split_whitespace();
        let target = parts.next().unwrap_or_else(|| "");
        let comment = parts.collect::<Vec<_>>().join(" ");
        let comment = comment.as_str();

        let domain: constants::Domain;
        match login(&client, &cookies, &target, &mut login_status).await {
            Ok(None) => continue,
            Ok(Some(d)) => {
                domain = d;
            }
            Err(e) => {
                error!(target: "login", "Login failed before pressing {target} <{comment}>, error: {e:?}");
                failure_lst.push((
                    target.to_string(),
                    comment.to_string(),
                    "Login failed with error".to_string(),
                    e.to_string(),
                ));
                continue;
            }
        }
        match client.goto(&target).await {
            Ok(_) => {
                delay(None);
            }
            Err(e) => {
                error!(target: domain.to_string().as_str(), "Failed to go to {target} <{comment}>, error: {e:?}");
                failure_lst.push((
                    target.to_string(),
                    comment.to_string(),
                    "Go to links failed with error".to_string(),
                    e.to_string(),
                ));
                continue;
            }
        }

        let pressing_start = Instant::now();
        match domain {
            constants::Domain::Facebook => match report_step(
                fb::report(&client, &target),
                domain,
                target,
                comment,
                wait,
                start,
                &mut limitation_status,
                &mut success_lst,
                &mut failure_lst,
            )
            .await
            {
                Ok(true) => continue,
                _ => (),
            },

            constants::Domain::Instagram => match report_step(
                instagram::report(&client, &target),
                domain,
                target,
                comment,
                wait,
                start,
                &mut limitation_status,
                &mut success_lst,
                &mut failure_lst,
            )
            .await
            {
                Ok(true) => continue,
                _ => (),
            },

            constants::Domain::TikTok => match report_step(
                tiktok::report(&client, &target),
                domain,
                target,
                comment,
                wait,
                start,
                &mut limitation_status,
                &mut success_lst,
                &mut failure_lst,
            )
            .await
            {
                Ok(true) => continue,
                _ => (),
            },
        };

        let elapsed = pressing_start.elapsed();
        let elapsed_str = humantime::format_duration(elapsed);
        info!(target: "report", "Took: {elapsed_str}");

        if let Some(limit) = time_limit {
            let limit_str = humantime::format_duration(*limit);
            let elapsed_total = start.elapsed();
            let elapsed_total_str = humantime::format_duration(elapsed_total);
            if elapsed_total > *limit {
                warn!(target: "report", "<{elapsed_total_str}> exceeded <{limit_str}>, stopping early...");
                break;
            }
        }
    }
    if !success_lst.is_empty() {
        info!("Success:");
        for (target, comment) in &success_lst {
            info!("  - {target} <{comment}>");
        }
    }
    if !failure_lst.is_empty() {
        info!("Failure:");
        for (target, comment, reason, detail) in &failure_lst {
            info!("  - {target} <{comment}>: {reason}: {detail}");
        }
    }
    let total = humantime::format_duration(start.elapsed());
    info!(target: "report", "Finished in {total}");

    client.close().await?;

    Ok(())
}

#[derive(Deserialize)]
struct CookieJson {
    name: String,
    value: String,
    domain: String,
}

#[derive(Parser, Debug)]
#[command(version, about = "All-in-one reporting tool for social networks", long_about = None)]
struct Args {
    /// File contains links to report
    #[arg(short, long)]
    file: String,

    /// Cookie json file
    #[arg(short, long)]
    cookies: String,

    /// Report timeout
    #[arg(short, long, default_value = "10m")]
    wait: String,

    /// Time limit
    #[arg(short, long)]
    time_limit: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();
    let args = Args::parse();
    let link_file = args.file;
    let cookie_file = args.cookies;
    let wait = humantime::parse_duration(&args.wait)?;
    let time_limit = args
        .time_limit
        .map(|s| humantime::parse_duration(&s).ok())
        .flatten();

    let mut links = read_lines(&link_file)
        .into_iter()
        .filter(|l| Url::parse(l).is_ok())
        .collect::<Vec<_>>();
    links.shuffle(&mut rand::thread_rng());

    let cookies_raw_json = fs::read_to_string(cookie_file.to_owned())
        .expect(&format!("failed to read {}", cookie_file));
    let cookies: Vec<CookieJson> = serde_json::from_str(&cookies_raw_json)?;
    let cookies = cookies
        .iter()
        .map(|c| {
            let mut cookie = Cookie::new(c.name.to_owned(), c.value.to_owned());
            cookie.set_domain(c.domain.to_owned());
            cookie
        })
        .collect::<Vec<Cookie>>();

    debug!("Targets: {links:#?}");
    debug!("Cookies: {cookies:#?}");
    debug!("Wait time: {wait:#?}");
    debug!("Time limit: {time_limit:#?}");

    report(&links, &cookies, wait, &time_limit).await
}
