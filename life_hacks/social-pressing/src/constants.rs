use core::fmt;

#[derive(PartialEq, Eq, Hash, Clone, Copy)]
pub enum Domain {
    Facebook,
    TikTok,
    Instagram,
}

impl fmt::Display for Domain {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Domain::Facebook => write!(f, ".facebook.com"),
            Domain::TikTok => write!(f, ".tiktok.com"),
            Domain::Instagram => write!(f, ".instagram.com"),
        }
    }
}
