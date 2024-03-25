mod driver;
mod fb;
mod tiktok;
mod utils;

use anyhow::{Error, Result};
use core::time::Duration;
use log::error;
use log::info;
use rand::seq::SliceRandom;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::io::{self, BufRead, BufReader};
use std::time::Instant;

use crate::driver::login;
use crate::utils::delay;

fn read_lines(filename: &str) -> io::Lines<BufReader<fs::File>> {
    // Open the file in read-only mode.
    let file = fs::File::open(filename).unwrap();
    // Read the file line by line, and return an iterator of the lines of the file.
    io::BufReader::new(file).lines()
}

async fn report(link_file: &str, cookie_file: &str) -> Result<(), Error> {
    let mut links: Vec<_> = read_lines(link_file)
        .map(|l| l.unwrap().trim().to_owned())
        .collect::<Vec<_>>();
    links.shuffle(&mut rand::thread_rng());
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
        if !["https://www.facebook.com/", "https://www.tiktok.com/"]
            .iter()
            .any(|domain| target.starts_with(domain))
        {
            continue;
        }

        match login(&client, &cookie_file, &target).await {
            Ok(_) => (),
            Err(e) => {
                error!(target: "login", "Login failed before pressing {target}, error: {e:?}");
                continue;
            }
        }

        if target.starts_with("https://www.facebook.com/") {
            if limitation_status["fb"] {
                info!("Facebook is temporarily limited, skipping {target}");
                continue;
            }

            info!(target: "facebook", "Pressing on facebook for {target}...");

            client.goto(&target).await?;
            delay(None);

            match fb::report(&client, &target).await {
                Ok(is_temporary_limited) => {
                    if is_temporary_limited {
                        limitation_status.insert("fb", true);
                    }
                    // Ensure some long enough delays between targets
                    delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                }
                Err(e) => {
                    error!(target: "fb_report", "Reporting failed for {target}, error: {e:?}");
                }
            }
        } else if target.starts_with("https://www.tiktok.com/") {
            info!(target: "tiktok", "Pressing on tiktok for {target}...");

            client.goto(&target).await?;
            delay(None);

            // Randomly report n times, max 3 times
            for _ in 0..=(rand::random::<usize>() % 3) {
                match tiktok::report(&client, &target).await {
                    Ok(_) => {
                        // Ensure some long enough delays between targets
                        delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                    }
                    Err(e) => {
                        error!(target: "tiktok_report", "Reporting failed for {target}, error: {e:?}");
                    }
                }
            }
        }
    }
    let total = humantime::format_duration(start.elapsed());
    info!(target: "main", "Finished in {total}");

    client.close().await?;

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();
    let link_file = env::args()
        .nth(1)
        .expect("usage: social-pressing <links_file>");
    let cookie_file = env::args().nth(2).expect("no cookies file provided");

    report(&link_file, &cookie_file).await
}
