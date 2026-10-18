use chrono::Utc;
use core::error::Error;
use core::time::Duration;
use fantoccini::{
    actions::{InputSource, MouseActions, PointerAction},
    elements::Element,
    error::CmdError,
    Client, ClientBuilder,
};
use rand::rngs::SmallRng;
use rand::{Rng, SeedableRng};
use tracing::{debug, instrument, warn};

use std::future::Future;

// Attach endpoints are fixed inside the agent computer, not host-published ports.
const DEBUGGER_PORT: u16 = 9222;

/// Connect to an already-running WebDriver server and attach to its browser.
/// The session persists on drop; neither the browser nor the server is stopped.
#[instrument]
pub async fn connect(webdriver_url: &str) -> Result<Client, Box<dyn Error + Sync + Send>> {
    let capabilities = serde_json::Map::from_iter([
        ("browserName".to_string(), serde_json::json!("chrome")),
        (
            "goog:chromeOptions".to_string(),
            serde_json::json!({
                // Address of the already-running Chromium as seen by the server.
                "debuggerAddress": format!("127.0.0.1:{DEBUGGER_PORT}"),
            }),
        ),
        (
            "timeouts".to_string(),
            serde_json::json!({
                "pageLoad": 10_000,
                "implicit": 5_000,
                "script": 120_000,
            }),
        ),
    ]);
    let client = ClientBuilder::native()
        .capabilities(capabilities)
        .connect(webdriver_url)
        .await?;

    // The attached browser belongs to the user: do not send DELETE /session on drop.
    client.persist().await?;

    // Window commands are only best-effort in attach mode.
    if let Err(e) = client.set_window_size(1280, 1024).await {
        warn!(error = %e, "could not resize the browser window; continuing");
    }

    Ok(client)
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
}
