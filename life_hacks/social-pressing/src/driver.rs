use core::time::Duration;
use fantoccini::{
    actions::{InputSource, MouseActions, PointerAction},
    cookies::Cookie,
    elements::Element,
    error::CmdError,
    Client, ClientBuilder,
};
use log::warn;

use std::{collections::HashSet, env, error::Error};

use crate::{
    constants::Domain,
    utils::{delay, rand_delay_duration},
};

pub async fn get_client() -> Result<Client, Box<dyn Error>> {
    let is_headless = !env::var("HEADFUL").is_ok();
    let capabilities = serde_json::json!({
        "browserName": "firefox",
        "setWindowRect": true,
        "moz:firefoxOptions": {
            "prefs": {
                "intl.accept_languages": "en-GB"
            },
            "args": [
                if is_headless { "--headless" } else { "" },
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
    client.set_window_size(1024, 3840).await?;

    Ok(client)
}

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

pub async fn mouse_move_to_element(client: &Client, el: &Element) -> Result<(), CmdError> {
    let mouse_move_to_element =
        MouseActions::new("mouse".into()).then(PointerAction::MoveToElement {
            element: el.clone(),
            duration: Some(rand_delay_duration()),
            x: 0,
            y: 0,
        });
    if let Err(e) = client.perform_actions(mouse_move_to_element).await {
        warn!("failed to move to element: {e}");
    }

    delay(Some(Duration::from_millis(250)));

    Ok(())
}

pub async fn perform_click(client: &Client, el: &Element) -> Result<(), CmdError> {
    //el.click().await?;
    client
        .execute("arguments[0].click()", vec![serde_json::to_value(el)?])
        .await?;

    Ok(())
}

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
