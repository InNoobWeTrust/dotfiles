use core::error::Error;
use grammers_client::{session::Session, Client, Config};
use grammers_tl_types::enums::{Dialog::Dialog, MessageEntity};
use regex::Regex;
use std::env;
use std::io::stdin;

const URL_REGEX: &str = r#"(?P<url>https?://[^\s]+)"#;

fn channels() -> Vec<String> {
    [
        "udemy2020",
        "freeprogrammingcourses",
        "discudemy_com",
        "real_discount",
        "udemy_learning_courses",
        "Udemy4U",
    ]
    .iter()
    .map(|s| s.to_string())
    .collect::<Vec<_>>()
}

pub async fn crawl() -> Result<Vec<String>, Box<dyn Error>> {
    let client = Client::connect(Config {
        session: Session::load_file_or_create(".session").unwrap(),
        api_id: env::var("API_ID").unwrap().parse::<i32>().unwrap(),
        api_hash: env::var("API_HASH").unwrap(),
        params: Default::default(),
    })
    .await?;

    if !client.is_authorized().await? {
        println!("Login code: ");
        let token = client
            .request_login_code(&env::var("PHONE").unwrap())
            .await?;
        let mut code = String::new();
        stdin().read_line(&mut code).unwrap();
        client.sign_in(&token, &code).await?;

        client.session().save_to_file(".session").unwrap();
    }

    let mut dialogs = client.iter_dialogs();
    let mut links: Vec<String> = Vec::new();
    while let Some(dialog) = dialogs.next().await? {
        let chat = dialog.chat();
        if !channels().contains(&chat.username().unwrap_or_default().to_string()) {
            continue;
        }
        let mut unread = 0usize;
        if let Dialog(raw) = dialog.raw.clone() {
            unread = raw.unread_count as usize;
        }
        let mut messages = client.iter_messages(chat).limit(unread);

        while let Some(message) = messages.next().await? {
            let txt = message.text();
            let regex = Regex::new(URL_REGEX).unwrap();
            let mut extracted = regex
                .find_iter(txt)
                .map(|m| m.as_str().to_string())
                .collect::<Vec<_>>();
            links.append(&mut extracted);

            if let Some(entities) = message.raw.clone().entities {
                let mut urls = entities
                    .iter()
                    .filter_map(|e| match e {
                        MessageEntity::TextUrl(url) => Some(url.clone().url),
                        _ => None,
                    })
                    .collect::<Vec<_>>();
                links.append(&mut urls);
            }
        }
    }

    log::debug!("Links: {links:?}");
    log::info!("Total links: {}", links.len());

    Ok(links)
}
