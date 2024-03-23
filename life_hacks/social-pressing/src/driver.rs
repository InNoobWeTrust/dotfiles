use fantoccini::{error::NewSessionError, Client, ClientBuilder};

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
