use chrono::Utc;
use core::error::Error;
use core::time::Duration;
use fantoccini::{
    actions::{InputSource, MouseActions, PointerAction},
    cookies::Cookie,
    elements::Element,
    error::CmdError,
    Client, ClientBuilder,
};
use rand::rngs::SmallRng;
use rand::{Rng, SeedableRng};
use tracing::{debug, instrument, warn};

use std::{collections::HashSet, fmt::Debug, future::Future, path::PathBuf};
use std::{
    fs::File,
    process::{Child, Command, Stdio},
};

#[cfg(unix)]
use std::os::unix::process::CommandExt;

use std::{ops::Deref, path::Path};

#[cfg(unix)]
extern "C" {
    // Minimal C bindings used to create a new session (setsid) and to send
    // signals to a process group (kill with a negative pid). This avoids
    // adding an external dependency just for a couple of libc calls.
    fn setsid() -> i32;
    fn kill(pid: i32, sig: i32) -> i32;
}

#[cfg(unix)]
const SIGTERM: i32 = 15;
#[cfg(unix)]
const SIGKILL: i32 = 9;

use crate::constants::Domain;

#[derive(Debug)]
pub(crate) struct Subprocess(Child);

impl Deref for Subprocess {
    type Target = Child;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Drop for Subprocess {
    fn drop(&mut self) {
        // If the child has already exited, try_wait will reap it for us.
        match self.0.try_wait() {
            Ok(Some(status)) => {
                debug!(%status, "subprocess already exited (reaped)");
                return;
            }
            Ok(None) => {
                debug!(
                    pid = self.0.id(),
                    "subprocess still running; proceeding to terminate"
                );
            }
            Err(e) => {
                warn!(error = %e, "error while checking subprocess status; will attempt to kill");
            }
        }

        // Try graceful termination of the whole process group on Unix first.
        // This helps ensure browsers (child processes spawned by the driver)
        // are also terminated.
        #[cfg(unix)]
        {
            let pid = self.0.id() as i32;
            debug!(%pid, "sending SIGTERM to process group");
            // send SIGTERM to the process group (-pid); check return value (best-effort)
            unsafe {
                let r = kill(-pid, SIGTERM);
                if r != 0 {
                    warn!(%pid, ret = r, "failed to send SIGTERM to group (best-effort)");
                }
            }
        }

        // Also attempt to politely terminate the child itself (cross-platform).
        if let Err(e) = self.0.kill() {
            debug!(error = %e, "failed to send kill() to subprocess (might have exited)");
        } else {
            debug!(pid = self.0.id(), "sent kill() to subprocess (best-effort)");
        }

        // Poll for exit for a short while (non-blocking).
        for _ in 0..20 {
            match self.0.try_wait() {
                Ok(Some(status)) => {
                    debug!(%status, "subprocess exited after termination signal");
                    return;
                }
                Ok(None) => {
                    // still running, keep waiting
                }
                Err(e) => {
                    warn!(error = %e, "error while polling subprocess; continuing");
                }
            }
            std::thread::sleep(Duration::from_millis(100));
        }

        // Escalate: force-kill the child process itself (best-effort).
        debug!(pid = self.0.id(), "escalating: sending SIGKILL / kill()");
        #[cfg(unix)]
        {
            let pid = self.0.id() as i32;
            unsafe {
                let r = kill(-pid, SIGKILL);
                if r != 0 {
                    warn!(%pid, ret = r, "failed to send SIGKILL to group (best-effort)");
                }
            }
        }

        if let Err(e) = self.0.kill() {
            warn!(error = %e, "failed to force-kill child with kill()");
        }

        // Final attempt: block until we can reap the child so it doesn't remain a zombie.
        match self.0.wait() {
            Ok(status) => {
                debug!(%status, "subprocess reaped successfully in Drop");
            }
            Err(e) => {
                warn!(error = %e, "final wait to reap subprocess failed");
            }
        }
    }
}

impl Subprocess {
    pub fn new(
        cmd: &str,
        args: &Vec<String>,
        logfile: Option<PathBuf>,
    ) -> Result<Self, std::io::Error> {
        let (pipe_out, pipe_err) = match logfile {
            Some(p) => {
                let out = File::create(p.clone()).unwrap();
                let err = File::create(p).unwrap();
                (Stdio::from(out), Stdio::from(err))
            }
            None => (Stdio::inherit(), Stdio::inherit()),
        };
        let mut cmd_builder = Command::new(cmd);
        cmd_builder
            .args(args)
            .stdin(Stdio::null())
            .stdout(pipe_out)
            .stderr(pipe_err);

        // On Unix create a new session (process group) so driver and any browsers
        // it spawns belong to a distinct group. This makes it possible to signal
        // the whole group during cleanup (see Drop above).
        #[cfg(unix)]
        {
            // SAFETY: `pre_exec` is unsafe because it runs in the child process
            // before exec. We only call `setsid()` which is async-signal-safe and
            // therefore appropriate here.
            unsafe {
                cmd_builder.pre_exec(|| {
                    setsid();
                    Ok(())
                });
            }
        }

        let child = cmd_builder.spawn()?;
        Ok(Subprocess(child))
    }
}

pub trait WebDriver {
    fn get_port(&self) -> usize;
    fn create_client(
        &self,
        headful: bool,
    ) -> impl Future<Output = Result<Client, Box<dyn Error + Sync + Send>>>;
}

#[derive(Debug)]
pub struct GeckoDriver {
    #[allow(dead_code)]
    proc: Subprocess,
    port: usize,
}

impl Default for GeckoDriver {
    fn default() -> Self {
        let mut rng = SmallRng::seed_from_u64(Utc::now().timestamp_micros() as u64);
        let port = rng.random_range(4445..=7999);
        let proc = Subprocess::new(
            "geckodriver",
            &vec![
                "-p".to_string(),
                port.to_string(),
                "--log".to_string(),
                "fatal".to_string(),
            ],
            None,
        )
        .expect("Failed to start geckodriver");
        debug!(%port, "Starting geckodriver...");
        // Sleep for 3 seconds, waiting webdriver
        std::thread::sleep(Duration::from_secs(3));
        debug!(%port, "geckodriver is listening...");
        Self { proc, port }
    }
}

impl GeckoDriver {
    pub fn default_with_log(logfile: &Path) -> Result<Self, std::io::Error> {
        let mut rng = SmallRng::seed_from_u64(Utc::now().timestamp_micros() as u64);
        let port = rng.random_range(4445..=7999);
        let proc = Subprocess::new(
            "geckodriver",
            &vec![
                "-p".to_string(),
                port.to_string(),
                "--log".to_string(),
                "fatal".to_string(),
            ],
            Some(logfile.to_path_buf()),
        )?;

        debug!(%port, "Starting geckodriver...");
        // Sleep for 3 seconds, waiting webdriver
        std::thread::sleep(Duration::from_secs(3));
        debug!(%port, "geckodriver is listening...");

        Ok(Self { proc, port })
    }

    pub fn new(port: usize, logfile: &Path) -> Result<Self, std::io::Error> {
        let proc = Subprocess::new(
            "geckodriver",
            &vec![
                "-p".to_string(),
                port.to_string(),
                "--log".to_string(),
                "fatal".to_string(),
            ],
            Some(logfile.to_path_buf()),
        )?;

        debug!(%port, "Starting geckodriver...");
        // Sleep for 3 seconds, waiting webdriver
        std::thread::sleep(Duration::from_secs(3));
        debug!(%port, "geckodriver is listening...");

        Ok(Self { proc, port })
    }
}

impl WebDriver for GeckoDriver {
    fn get_port(&self) -> usize {
        self.port
    }

    #[instrument]
    async fn create_client(&self, headful: bool) -> Result<Client, Box<dyn Error + Sync + Send>> {
        let browser_args = [
            "--enable-automation".into(),
            "False".into(),
            "--disable-blink-features".into(),
            "AutomationControlled".into(),
            if headful {
                "".into()
            } else {
                "--headless".into()
            },
        ]
        .into_iter()
        .filter(|s: &String| !s.is_empty())
        .collect::<Vec<String>>();

        let capabilities = serde_json::json!({
            "browserName": "firefox",
            "setWindowRect": true,
            "moz:firefoxOptions": {
            "prefs": {
            "intl.accept_languages": "en-GB"
        },
            "args": browser_args,
        },
            "timeouts": {
            "pageLoad": 10_000,
            "implicit": 5_000,
            "script": 120_000,
        }
        });

        let port = self.get_port();

        let capabilities = capabilities.as_object().unwrap().to_owned();
        let client = ClientBuilder::native()
            .capabilities(capabilities)
            .connect(&format!("http://localhost:{port}"))
            .await?;
        client.set_window_size(1280, 1024).await?;
        Ok(client)
    }
}

fn rand_delay_duration() -> Duration {
    let mut rng = SmallRng::seed_from_u64(Utc::now().timestamp_micros() as u64);
    let millis = (rng.random::<u64>() % 3 + 2) * 1000 + (rng.random::<u64>() % 1000 + 1); // Max 5s
    Duration::from_millis(millis)
}

fn delay(duration: Option<Duration>) {
    let duration = duration.unwrap_or_else(rand_delay_duration);
    let duration_str = humantime::format_duration(duration);
    debug!("Sleeping for {duration_str}...");
    std::thread::sleep(duration);
}

pub trait ClientActionExt {
    fn mouse_move_to_element(&self, el: &Element) -> impl Future<Output = Result<(), CmdError>>;
    fn perform_click(&self, el: &Element) -> impl Future<Output = Result<(), CmdError>>;
    fn mouse_scroll(
        &self,
        x_offset: isize,
        y_offset: isize,
    ) -> impl Future<Output = Result<(), CmdError>>;
    fn login(
        &self,
        cookies: &[Cookie<'_>],
        target: &str,
        login_status: &mut HashSet<Domain>,
    ) -> impl Future<Output = Result<Option<Domain>, CmdError>>;
}

impl ClientActionExt for Client {
    async fn mouse_move_to_element(&self, el: &Element) -> Result<(), CmdError> {
        let mouse_move_to_element =
            MouseActions::new("mouse".into()).then(PointerAction::MoveToElement {
                element: el.clone(),
                duration: Some(rand_delay_duration()),
                x: 0.,
                y: 0.,
            });
        if let Err(e) = self.perform_actions(mouse_move_to_element).await {
            warn!(element = %e, "failed to move to element");
        }

        delay(Some(Duration::from_millis(250)));

        Ok(())
    }

    async fn perform_click(&self, el: &Element) -> Result<(), CmdError> {
        //el.click().await?;
        self.execute("arguments[0].click()", vec![serde_json::to_value(el)?])
            .await?;

        Ok(())
    }

    async fn mouse_scroll(&self, x_offset: isize, y_offset: isize) -> Result<(), CmdError> {
        self.execute(
            "scrollBy(arguments[0], arguments[1]);",
            vec![
                serde_json::to_value(x_offset)?,
                serde_json::to_value(y_offset)?,
            ],
        )
        .await?;
        delay(Some(Duration::from_secs(2)));

        Ok(())
    }

    #[instrument]
    async fn login(
        &self,
        cookies: &[Cookie<'_>],
        target: &str,
        login_status: &mut HashSet<Domain>,
    ) -> Result<Option<Domain>, CmdError> {
        let domain: Option<Domain>;
        let mut first_login = false;
        if target.starts_with("https://www.facebook.com/") {
            domain = Some(Domain::Facebook);
            first_login = login_status.insert(Domain::Facebook);
            if first_login {
                self.goto("https://www.facebook.com/login/").await?;
            }
        } else if target.starts_with("https://www.instagram.com/") {
            domain = Some(Domain::Instagram);
            first_login = login_status.insert(Domain::Instagram);
            if first_login {
                self.goto("https://www.instagram.com").await?;
            }
        } else if target.starts_with("https://www.tiktok.com/")
            && !login_status.contains(&Domain::TikTok)
        {
            domain = Some(Domain::TikTok);
            first_login = login_status.insert(Domain::TikTok);
            if first_login {
                self.goto("https://www.tiktok.com/explore").await?;
            }
        } else {
            domain = None;
        }

        if first_login && domain.is_some() {
            let d = domain.unwrap().to_string();
            // Normalize target host without leading dot, e.g. ".facebook.com" -> "facebook.com"
            let target_host = d.trim_start_matches('.').to_string();

            // Match cookies more robustly:
            // - trim any leading '.' from cookie domain
            // - accept exact matches like "facebook.com" and also subdomains like "www.facebook.com"
            let filtered_cookies: Vec<_> = cookies
                .iter()
                .cloned()
                .filter(|c| {
                    c.domain()
                        .map(|cd| cd.trim_start_matches('.').ends_with(&target_host))
                        .unwrap_or(false)
                })
                .collect();
            for cookie in filtered_cookies {
                self.add_cookie(cookie.into_owned()).await?;
            }

            self.goto(target).await?;
        }

        Ok(domain)
    }
}
