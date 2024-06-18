mod driver;
mod fb;
mod instagram;
mod tiktok;
mod utils;

use clap::Parser;
use core::time::Duration;
use fantoccini::cookies::Cookie;
use log::{error, info, warn};
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashMap;
use std::error::Error;
use std::fs;
use std::io::{self, BufRead, BufReader};
use std::time::Instant;
use url::Url;

use crate::driver::login;
use crate::utils::delay;

fn read_lines(filename: &str) -> io::Lines<BufReader<fs::File>> {
    // Open the file in read-only mode.
    let file = fs::File::open(filename).unwrap();
    // Read the file line by line, and return an iterator of the lines of the file.
    io::BufReader::new(file).lines()
}

async fn report(
    links: &[String],
    cookies: &[Cookie<'_>],
    time_limit: &Option<Duration>,
) -> Result<(), Box<dyn Error>> {
    info!("Getting webdriver...");
    let client = driver::get_client().await?;
    info!("Starting...");
    let start = Instant::now();
    let mut limitation_status = HashMap::from([
        ("fb", false),
        ("tiktok", false),
        ("instagram", false),
        ("linkedin", false),
        ("twitter", false),
        ("pinterest", false),
        ("reddit", false),
        ("tumblr", false),
        ("vk", false),
    ]);
    let mut success_lst = Vec::new();
    let mut failure_lst = Vec::new();

    for target in links {
        let mut parts = target.trim().split_whitespace();
        let target = parts.next().unwrap_or_else(|| "");
        let comment = parts.collect::<Vec<_>>().join(" ");

        let url = Url::parse(target).unwrap_or(Url::parse("https://example.com").unwrap());
        let host_str = url.host_str().unwrap_or_default();

        if ![
            "www.facebook.com",
            "facebook.com",
            "www.instagram.com",
            "instagram.com",
            "www.linkedin.com",
            "linkedin.com",
            "www.twitter.com",
            "twitter.com",
            "www.pinterest.com",
            "pinterest.com",
            "www.reddit.com",
            "reddit.com",
            "www.tumblr.com",
            "tumblr.com",
            "www.vk.com",
            "vk.com",
            "www.tiktok.com",
            "tiktok.com",
        ]
        .contains(&host_str)
        {
            continue;
        }

        match login(&client, &cookies, &target).await {
            Ok(_) => (),
            Err(e) => {
                error!(target: "login", "Login failed before pressing {target} <{comment}>, error: {e:?}");
                failure_lst.push((
                    target.to_string(),
                    comment.to_string(),
                    "Login failed with error",
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
                error!(target: "goto", "Failed to go to {target} <{comment}>, error: {e:?}");
                failure_lst.push((
                    target.to_string(),
                    comment.to_string(),
                    "Go to links failed with error",
                    e.to_string(),
                ));
                continue;
            }
        }

        let pressing_start = Instant::now();
        match &*host_str {
            "www.facebook.com" | "facebook.com" => {
                if limitation_status["fb"] {
                    info!("Facebook is temporarily limited, skipping {target} <{comment}>");
                    failure_lst.push((
                        target.to_string(),
                        comment.to_string(),
                        "FB is temporarily limited",
                        "".to_string(),
                    ));
                    continue;
                }

                info!(target: "facebook", "Pressing on facebook for {target} <{comment}>...");

                match fb::report(&client, &target).await {
                    Ok(is_temporary_limited) => {
                        if is_temporary_limited {
                            limitation_status.insert("fb", true);
                        }
                        success_lst.push((target.to_string(), comment.to_string()));
                        // Ensure some long enough delays between targets
                        delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                    }
                    Err(e) => {
                        error!(target: "fb_report", "Reporting failed for {target} <{comment}>, error: {e:?}");
                        failure_lst.push((
                            target.to_string(),
                            comment.to_string(),
                            "Reporting failed with error",
                            e.to_string(),
                        ));
                    }
                }
            }
            "www.instagram.com" | "instagram.com" => {
                if limitation_status["instagram"] {
                    info!("Instagram is temporarily limited, skipping {target} <{comment}>");
                    failure_lst.push((
                        target.to_string(),
                        comment.to_string(),
                        "Instagram is temporarily limited",
                        "".to_string(),
                    ));
                    continue;
                }

                info!(target: "instagram", "Pressing on instagram for {target} <{comment}>...");

                match instagram::report(&client, &target).await {
                    Ok(is_temporary_limited) => {
                        if is_temporary_limited {
                            limitation_status.insert("instagram", true);
                        }
                        success_lst.push((target.to_string(), comment.to_string()));
                        // Ensure some long enough delays between targets
                        delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                    }
                    Err(e) => {
                        error!(target: "instagram_report", "Reporting failed for {target} <{comment}>, error: {e:?}");
                        failure_lst.push((
                            target.to_string(),
                            comment.to_string(),
                            "Reporting failed with error",
                            e.to_string(),
                        ));
                    }
                }
            }
            "www.tiktok.com" | "tiktok.com" => {
                info!(target: "tiktok", "Pressing on tiktok for {target} <{comment}>...");

                // Randomly report n times, max 3 times
                for _ in 0..=(rand::random::<usize>() % 3) {
                    match tiktok::report(&client, &target).await {
                        Ok(_) => {
                            success_lst.push((target.to_string(), comment.to_string()));
                            // Ensure some long enough delays between targets
                            delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                        }
                        Err(e) => {
                            error!(target: "tiktok_report", "Reporting failed for {target} <{comment}>, error: {e:?}");
                            failure_lst.push((
                                target.to_string(),
                                comment.to_string(),
                                "Reporting failed with error",
                                e.to_string(),
                            ));
                        }
                    }
                }
            }
            _ => {
                warn!(target: "report", "Unrecognized url for {target} <{comment}>. Skipping...");
            }
        }
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
    let time_limit = args
        .time_limit
        .map(|s| humantime::parse_duration(&s).ok())
        .flatten();

    let mut links = read_lines(&link_file)
        .map(|l| l.unwrap().trim().to_owned())
        .filter(|l| !l.is_empty())
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

    report(&links, &cookies, &time_limit).await
}
