use core::error::Error;
use dotenv::dotenv;
use udemy_devourer::crawler::crawl;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();
    pretty_env_logger::init();
    log::info!("Crawling...");

    let links = crawl().await?;

    Ok(())
}
