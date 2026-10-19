//! One browser must have only one active WebDriver client at a time.
//! This run lock uses advisory flock semantics, interoperating with shell `flock`.
//! The file lives under the XDG runtime directory so it disappears with the
//! session, or under the temporary directory when XDG_RUNTIME_DIR is unset/empty.

use std::fs::{File, OpenOptions, TryLockError};
use std::io;
use std::path::PathBuf;
use std::thread;
use std::time::{Duration, Instant};
use tracing::{info, warn};

/// Owns the exclusive run lock; dropping this guard releases it.
pub struct RunLock {
    file: File,
}

/// Contention is a normal skip outcome, distinct from an IO failure.
pub enum LockOutcome {
    Acquired(RunLock),
    Busy,
}

impl RunLock {
    /// Try immediately, then poll at most every five seconds for up to `wait`.
    /// A zero duration makes just one non-blocking attempt.
    pub fn acquire(wait: Duration) -> io::Result<LockOutcome> {
        let path = std::env::var_os("XDG_RUNTIME_DIR")
            .filter(|value| !value.is_empty())
            .map(PathBuf::from)
            .unwrap_or_else(std::env::temp_dir)
            .join("social-pressing.lock");
        let file = OpenOptions::new()
            .create(true)
            .read(true)
            .write(true)
            .open(&path)?;
        let start = Instant::now();
        let mut waiting = false;

        loop {
            match file.try_lock() {
                Ok(()) => return Ok(LockOutcome::Acquired(Self { file })),
                Err(TryLockError::Error(error)) => return Err(error),
                Err(TryLockError::WouldBlock) => {}
            }

            let remaining = wait.saturating_sub(start.elapsed());
            if remaining.is_zero() {
                return Ok(LockOutcome::Busy);
            }
            if !waiting {
                info!(path = %path.display(), "Another run holds the lock; waiting...");
                waiting = true;
            }
            thread::sleep(remaining.min(Duration::from_secs(5)));
        }
    }
}

impl Drop for RunLock {
    fn drop(&mut self) {
        if let Err(error) = self.file.unlock() {
            warn!(%error, "Failed to unlock run lock; closing the file releases it");
        }
    }
}
