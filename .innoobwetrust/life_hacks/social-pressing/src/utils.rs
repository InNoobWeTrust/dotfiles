use core::time::Duration;
use std::thread;

use tracing::{debug, instrument};

pub(crate) fn rand_delay_duration() -> Duration {
    let millis = (rand::random::<u64>() % 3 + 2) * 1000 + (rand::random::<u64>() % 1000 + 1); // Max 5s
    let millis = Duration::from_millis(millis as u64);

    millis
}

#[instrument]
pub(crate) fn delay(duration: Option<Duration>) {
    let duration = duration.unwrap_or_else(|| rand_delay_duration());
    let duration_str = humantime::format_duration(duration);
    debug!("Sleeping for {duration_str}...");
    thread::sleep(duration);
}
