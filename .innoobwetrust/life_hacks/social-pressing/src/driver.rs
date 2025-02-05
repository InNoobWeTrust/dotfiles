use core::error::Error;
use core::time::Duration;
use fantoccini::{
    actions::{InputSource, MouseActions, PointerAction},
    cookies::Cookie,
    elements::Element,
    error::CmdError,
    Client, ClientBuilder,
};
use tracing::{debug, instrument, warn};

use std::collections::HashSet;
use std::ops::Deref;
use std::process::{Child, Command, Stdio};

use crate::{
    constants::Domain,
    utils::{delay, rand_delay_duration},
};

pub(crate) struct Subprocess(Child);

impl Deref for Subprocess {
    type Target = Child;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Drop for Subprocess {
    fn drop(&mut self) {
        for _ in 0..3 {
            if self.0.kill().is_ok() {
                return;
            }
            std::thread::sleep(Duration::from_secs(5));
        }
    }
}

impl Subprocess {
    pub fn new(cmd: &str, args: &Vec<String>) -> Result<Self, Box<dyn Error>> {
        let child = Command::new(cmd)
            .args(args)
            .stdin(Stdio::null())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()?;
        Ok(Subprocess(child))
    }
}

pub(crate) trait Driver {
    fn get_port(&self) -> usize;
}

struct GeckoDriver {
    #[allow(dead_code)]
    proc: Subprocess,
    port: usize,
}

impl GeckoDriver {
    pub fn new(port: usize) -> Result<Self, Box<dyn Error>> {
        let proc = Subprocess::new("geckodriver", &vec!["-p".to_string(), port.to_string()])?;

        debug!(%port, "starting geckodriver...");
        // Sleep for 3 seconds, waiting webdriver
        std::thread::sleep(Duration::from_secs(3));
        debug!(%port, "geckodriver is listening...");

        Ok(Self { proc, port })
    }
}

impl Driver for GeckoDriver {
    fn get_port(&self) -> usize {
        self.port
    }
}

#[instrument]
pub async fn get_client(
    headful: bool,
    standalone: bool,
    retries: &Option<usize>,
) -> Result<(Client, Option<Box<dyn Driver>>), Box<dyn Error>> {
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

    if standalone {
        let mut driver_or_err = GeckoDriver::new(rand::random_range(4445..=7999));
        if driver_or_err.is_err() {
            if retries.is_none() {
                return Err(driver_or_err.err().unwrap());
            }

            for _ in 0..retries.unwrap() {
                driver_or_err = GeckoDriver::new(rand::random_range(4445..=7999));

                if driver_or_err.is_ok() {
                    break;
                }
            }
        }

        let driver = driver_or_err?;
        let port = driver.get_port();

        let capabilities = capabilities.as_object().unwrap().to_owned();
        let client = ClientBuilder::native()
            .capabilities(capabilities)
            .connect(&format!("http://localhost:{port}"))
            .await?;
        client.set_window_size(1024, 3840).await?;
        Ok((client, Some(Box::new(driver))))
    } else {
        let capabilities = capabilities.as_object().unwrap().to_owned();
        let client = ClientBuilder::native()
            .capabilities(capabilities)
            .connect(&format!("http://localhost:4444"))
            .await?;
        client.set_window_size(1024, 3840).await?;
        Ok((client, None))
    }
}

#[instrument]
pub async fn login(
    client: &Client,
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
            client.goto("https://www.facebook.com/login/").await?;
        }
    } else if target.starts_with("https://www.instagram.com/") {
        domain = Some(Domain::Instagram);
        first_login = login_status.insert(Domain::Instagram);
        if first_login {
            client.goto("https://www.instagram.com").await?;
        }
    } else if target.starts_with("https://www.tiktok.com/")
        && !login_status.contains(&Domain::TikTok)
    {
        domain = Some(Domain::TikTok);
        first_login = login_status.insert(Domain::TikTok);
        if first_login {
            client.goto("https://www.tiktok.com/explore").await?;
        }
    } else {
        domain = None;
    }

    if first_login && domain.is_some() {
        let d = domain.unwrap().to_string();
        for cookie in cookies
            .iter()
            .filter(|c| c.domain().unwrap_or_default() == d)
        {
            client.add_cookie(cookie.clone().into_owned()).await?;
        }
    }

    Ok(domain)
}

#[instrument]
pub async fn mouse_move_to_element(client: &Client, el: &Element) -> Result<(), CmdError> {
    let mouse_move_to_element =
        MouseActions::new("mouse".into()).then(PointerAction::MoveToElement {
            element: el.clone(),
            duration: Some(rand_delay_duration()),
            x: 0,
            y: 0,
        });
    if let Err(e) = client.perform_actions(mouse_move_to_element).await {
        warn!(element = %e, "failed to move to element");
    }

    delay(Some(Duration::from_millis(250)));

    Ok(())
}

#[instrument]
pub async fn perform_click(client: &Client, el: &Element) -> Result<(), CmdError> {
    //el.click().await?;
    client
        .execute("arguments[0].click()", vec![serde_json::to_value(el)?])
        .await?;

    Ok(())
}

#[instrument]
pub async fn mouse_scroll(
    client: &Client,
    x_offset: isize,
    y_offset: isize,
) -> Result<(), CmdError> {
    client
        .execute(
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
