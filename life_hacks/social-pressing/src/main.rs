mod driver;
mod fb;
mod tiktok;
mod utils;

use core::time::Duration;
use fantoccini::cookies::Cookie;
use log::{error, info, warn};
use rand::seq::SliceRandom;
use serde::Deserialize;
use std::collections::HashMap;
use std::env;
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

async fn report(links: &[String], cookies: &[Cookie<'_>]) -> Result<(), Box<dyn Error>> {
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
    for target in links {
        let mut parts = target.trim().split_whitespace();
        let target = parts.next().unwrap_or_else(|| "");
        let comment = parts.collect::<Vec<_>>().join(" ");

        let url = Url::parse(target).unwrap_or(Url::parse("https://example.com").unwrap());
        let host_str = url.host_str().unwrap_or_default();

        if ![
            "www.facebook.com",
            "facebook.com",
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
                continue;
            }
        }
        match client.goto(&target).await {
            Ok(_) => {
                delay(None);
            }
            Err(e) => {
                error!(target: "goto", "Failed to go to {target} <{comment}>, error: {e:?}");
                continue;
            }
        }

        let pressing_start = Instant::now();
        match &*host_str {
            "www.facebook.com" | "facebook.com" => {
                if limitation_status["fb"] {
                    info!("Facebook is temporarily limited, skipping {target} <{comment}>");
                    continue;
                }

                info!(target: "facebook", "Pressing on facebook for {target} <{comment}>...");

                match fb::report(&client, &target).await {
                    Ok(is_temporary_limited) => {
                        if is_temporary_limited {
                            limitation_status.insert("fb", true);
                        }
                        // Ensure some long enough delays between targets
                        delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                    }
                    Err(e) => {
                        error!(target: "fb_report", "Reporting failed for {target} <{comment}>, error: {e:?}");
                    }
                }
            }
            "www.tiktok.com" | "tiktok.com" => {
                info!(target: "tiktok", "Pressing on tiktok for {target} <{comment}>...");

                // Randomly report n times, max 3 times
                for _ in 0..=(rand::random::<usize>() % 3) {
                    match tiktok::report(&client, &target).await {
                        Ok(_) => {
                            // Ensure some long enough delays between targets
                            delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                        }
                        Err(e) => {
                            error!(target: "tiktok_report", "Reporting failed for {target} <{comment}>, error: {e:?}");
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

        let elapsed_total = start.elapsed();
        if elapsed_total > Duration::from_secs(2 * 3600) {
            warn!(target: "report", "{elapsed_str} exceeded 2 hours, stopping early...");
            break;
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

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();
    let link_file = env::args()
        .nth(1)
        .expect("usage: social-pressing <links_file>");
    let cookie_file = env::args().nth(2).expect("no cookies file provided");

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

    report(&links, &cookies).await
}
