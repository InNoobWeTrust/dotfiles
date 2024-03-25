use std::fs;

use core::time::Duration;
use fantoccini::{
    actions::{InputSource, MouseActions, PointerAction},
    cookies::Cookie,
    elements::Element,
    error::{CmdError, NewSessionError},
    Client, ClientBuilder,
};
use log::error;
use serde::Deserialize;

use crate::utils::{delay, rand_delay_duration};

pub async fn get_client() -> Result<Client, NewSessionError> {
    let capabilities = serde_json::json!({
        "browserName": "firefox",
        "moz:firefoxOptions": {
            "prefs": {
                "intl.accept_languages": "en-GB"
            },
            "args": [
                "-headless",
                "--enable-automation=False",
                "--disable-blink-features=AutomationControlled"
            ]
        },
        "timeouts": {
            "pageLoad": 10_000,
            "implicit": 5_000,
            "script": 120_000,
        }
    });

    let capabilities = capabilities.as_object().unwrap().to_owned();
    let client = ClientBuilder::native()
        .capabilities(capabilities)
        .connect("http://localhost:4444")
        .await?;

    Ok(client)
}

#[derive(Deserialize)]
struct CookieJson {
    name: String,
    value: String,
    domain: String,
}

pub async fn login(
    client: &Client,
    cookie_file: &str,
    target: &str,
) -> Result<&'static str, CmdError> {
    let domain: &str;
    if target.starts_with("https://www.facebook.com/") {
        client.goto("https://www.facebook.com/login/").await?;
        domain = ".facebook.com";
    } else {
        client.goto("https://www.tiktok.com/explore").await?;
        domain = ".tiktok.com";
    }

    let cookies_raw_json =
        fs::read_to_string(cookie_file).expect(&format!("failed to read {}", cookie_file));
    let cookies: Vec<CookieJson> = serde_json::from_str(&cookies_raw_json)?;
    for cookie in cookies {
        if cookie.domain != domain {
            continue;
        }
        client
            .add_cookie(Cookie::new(cookie.name, cookie.value))
            .await?;
    }

    Ok(domain)
}

pub async fn perform_click(client: &Client, el: &Element) -> Result<(), CmdError> {
    let mouse_move_to_element =
        MouseActions::new("mouse".into()).then(PointerAction::MoveToElement {
            element: el.clone(),
            duration: Some(rand_delay_duration()),
            x: 0,
            y: 0,
        });
    if let Err(e) = client.perform_actions(mouse_move_to_element).await {
        error!("failed to move to element: {}", e);
    }
    delay(Some(Duration::from_millis(250)));
    el.click().await?;

    Ok(())
}
