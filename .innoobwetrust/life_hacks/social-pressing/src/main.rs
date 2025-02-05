mod constants;
mod driver;
mod fb;
mod instagram;
mod tiktok;
mod utils;

use clap::Parser;
use core::fmt::Debug;
use core::future::Future;
use core::time::Duration;
use fantoccini::cookies::Cookie;
use fantoccini::error::CmdError;
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashSet;
use std::error::Error;
use std::fs;
use std::time::Instant;
use tokio::time::timeout;
use tracing::level_filters::LevelFilter;
use tracing::{debug, error, info, instrument, warn, Level};
use tracing_futures::Instrument;
use tracing_subscriber::{fmt, prelude::*, Registry};
use url::Url;

use crate::driver::login;
use crate::utils::delay;

#[instrument]
fn read_lines(filepath: &std::path::PathBuf) -> Vec<String> {
    // Read the file line by line, and return an iterator of the lines of the file.
    fs::read_to_string(filepath)
        .unwrap()
        .lines()
        .map(|l| l.to_owned())
        .filter(|l| !l.trim().is_empty())
        .collect::<Vec<_>>()
}

async fn report_step<F>(
    reporter: F,
    domain: constants::Domain,
    target: &str,
    comment: &str,
    wait: Duration,
    start: Instant,
    limitation_status: &mut HashSet<constants::Domain>,
    success_lst: &mut Vec<(String, String)>,
    failure_lst: &mut Vec<(String, String, String, String)>,
) -> Result<bool, CmdError>
where
    F: Future<Output = Result<bool, CmdError>>,
{
    if limitation_status.contains(&domain) {
        info!(%domain, %target, %comment, "temporarily limited, skipping");
        failure_lst.push((
            target.to_string(),
            comment.to_string(),
            format!("{} is temporarily limited", domain),
            "".to_string(),
        ));
        return Ok(true);
    }

    info!(%domain, %target, %comment, "Pressing...");

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
            error!(%domain, %target, %comment, error = %e, "Reporting failed");
            failure_lst.push((
                target.to_string(),
                comment.to_string(),
                "Reporting failed with error".to_string(),
                e.to_string(),
            ));
        }
        Err(e) => {
            let wait_str = humantime::format_duration(wait).to_string();
            error!(%domain, %target, %comment, error= %e, allowed_duration = %wait_str, "Reporting timeout");
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

async fn report(report_args: &ReportArgs<'_>) -> Result<(), Box<dyn Error>> {
    let links = &report_args.links;
    let cookies = &report_args.cookies;
    let wait = report_args.wait;
    let time_limit = report_args.time_limit;
    info!("Getting webdriver...");
    let client = driver::get_client(report_args.headful, &report_args.profile_name).await?;
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
                error!(%target, %comment, error = %e, "Login failed before pressing");
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
                error!(%domain, %target, %comment, error = %e, "Failed to navigate");
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
                fb::report(&client, &target).instrument(tracing::info_span!("fb::report")),
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
                instagram::report(&client, &target)
                    .instrument(tracing::info_span!("instagram::report")),
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
                tiktok::report(&client, &target).instrument(tracing::info_span!("tiktok::report")),
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
        info!(elapsed = %elapsed_str);

        if let Some(limit) = time_limit {
            let limit_str = humantime::format_duration(limit);
            let elapsed_total = start.elapsed();
            let elapsed_total_str = humantime::format_duration(elapsed_total);
            if elapsed_total > limit {
                warn!(elapsed = %elapsed_total_str, limit = %limit_str, "time limit exceeded, stopping early...");
                break;
            }
        }
    }
    if !success_lst.is_empty() {
        let success_lst_str = format!("{:?}", success_lst);
        info!(list = %success_lst_str, "Success");
    }
    if !failure_lst.is_empty() {
        let failure_lst_str = format!("{:?}", failure_lst);
        info!(list = %failure_lst_str, "Failure");
    }
    let total = humantime::format_duration(start.elapsed());
    info!(total_elapsed = %total);

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
struct CliArgs {
    /// File contains links to report
    #[arg(short, long, env)]
    file: std::path::PathBuf,

    /// Profile name
    #[arg(short, long, env, default_value = "default-release")]
    profile_name: String,

    /// Cookie json file
    #[arg(short, long, env)]
    cookies: std::path::PathBuf,

    /// Report timeout
    #[arg(short, long, default_value = "10m")]
    wait: String,

    /// Time limit
    #[arg(short, long)]
    time_limit: Option<String>,

    /// Headful
    #[arg(long, env, default_value = "false")]
    headful: bool,

    /// Log file
    #[arg(long, env)]
    logfile: Option<std::path::PathBuf>,

    /// Log level
    #[arg(long, env, value_enum, default_value_t = Level::DEBUG)]
    log_level: Level,
}

#[derive(Debug)]
struct ReportArgs<'a> {
    /// File contains links to report
    links: Vec<String>,

    /// Cookies
    cookies: Vec<Cookie<'a>>,

    /// Profile name
    profile_name: String,

    /// Report timeout
    wait: Duration,

    /// Time limit
    time_limit: Option<Duration>,

    /// Headful
    headful: bool,
}

#[tokio::main]
async fn run(report_args: &ReportArgs) -> Result<(), Box<dyn Error>> {
    let links_str = format!("{:?}", report_args.links);
    let cookies_str = format!("{:?}", report_args.cookies);
    let wait_time_str = humantime::format_duration(report_args.wait);
    let time_limit_str = if let Some(time_limit) = report_args.time_limit {
        humantime::format_duration(time_limit).to_string()
    } else {
        "unlimited".into()
    };
    debug!(links = %links_str, cookies = %cookies_str, wait = %wait_time_str, time_limit = %time_limit_str);

    report(&report_args).await
}

fn main() -> Result<(), Box<dyn Error>> {
    let args = CliArgs::parse();
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
    links.shuffle(&mut rand::rng());

    let cookies_raw_json = fs::read_to_string(cookie_file.to_owned())
        .expect(&format!("failed to read {}", cookie_file.to_str().unwrap()));
    let cookies: Vec<CookieJson> = serde_json::from_str(&cookies_raw_json)?;
    let cookies = cookies
        .iter()
        .map(|c| {
            let mut cookie = Cookie::new(c.name.to_owned(), c.value.to_owned());
            cookie.set_domain(c.domain.to_owned());
            cookie
        })
        .collect::<Vec<Cookie>>();

    if let Some(logfile) = args.logfile {
        let logfile = std::fs::OpenOptions::new()
            .append(true)
            .create(true)
            .open(logfile)
            .unwrap();

        let subscriber = Registry::default()
            .with(
                // stdout layer, to view everything in the console
                fmt::layer().compact().with_ansi(true).with_writer(LevelFilter::from_level(args.log_level)),
            )
            .with(
                // log-error file, to log the errors that arise
                fmt::layer()
                    .json()
                    .with_writer(logfile)
                    .with_filter(LevelFilter::from_level(Level::DEBUG)),
            );
        tracing::subscriber::set_global_default(subscriber).unwrap();
    } else {
        let subscriber = Registry::default().with(
            // stdout layer, to view everything in the console
            fmt::layer().compact().with_ansi(true),
        );
        tracing::subscriber::set_global_default(subscriber).unwrap();
    }

    let report_args = ReportArgs {
        links,
        cookies,
        wait,
        time_limit,
        headful: args.headful,
        profile_name: args.profile_name,
    };

    run(&report_args)
}
