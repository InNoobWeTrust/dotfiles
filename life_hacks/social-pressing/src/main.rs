mod driver;
mod tiktok;
mod utils;

use anyhow::{Error, Result};
use core::time::Duration;
use log::info;
use log::warn;
use rand::seq::SliceRandom;
use std::env;
use std::fs;
use std::io::{self, BufRead, BufReader};
use std::time::Instant;

use crate::utils::delay;

fn read_lines(filename: String) -> io::Lines<BufReader<fs::File>> {
    // Open the file in read-only mode.
    let file = fs::File::open(filename).unwrap();
    // Read the file line by line, and return an iterator of the lines of the file.
    io::BufReader::new(file).lines()
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug")).init();
    let link_file = env::args()
        .nth(1)
        .expect("usage: social-pressing <links_file>");
    let mut links: Vec<_> = read_lines(link_file.to_owned())
        .map(|l| l.unwrap().trim().to_owned())
        .collect::<Vec<_>>();
    links.shuffle(&mut rand::thread_rng());
    info!("Getting webdriver...");
    let client = driver::get_client().await?;
    info!("Starting...");
    let start = Instant::now();
    for target in links {
        if target.starts_with("https://www.tiktok.com/") {
            info!(target: "tiktok", "Pressing on tiktok for {target}...");
            // Randomly report n times, max 3 times
            for _ in 0..=(rand::random::<usize>() % 3) {
                match tiktok::report(&client, &target).await {
                    Ok(_) => {
                        // Ensure some long enough delays between targets
                        delay(Some(Duration::from_secs(start.elapsed().as_secs() % 30)));
                    }
                    Err(e) => {
                        warn!(target: "main", "Reporting failed for {target}, error: {e:?}");
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
