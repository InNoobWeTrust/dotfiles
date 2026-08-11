"""Read the three permitted ingest settings and sanitize their endpoint boundary."""

from urllib.parse import urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings


class ConfigurationError(ValueError):
    """Identify invalid settings without including credential or URL values."""


class IngestSettings(BaseSettings):
    """Represent validated OpenObserve ingest credentials and a safe endpoint."""

    # Setter using _sanitize_ingest_url to ensure it is a credential-free HTTPS endpoint
    openobserve_ingest_url: str
    openobserve_ingest_user: str
    openobserve_ingest_token: str

    @field_validator("openobserve_ingest_url", mode="before")
    def validate_ingest_url(cls, value: str) -> str:
        """Ensure the ingest URL is a credential-free HTTPS endpoint."""
        """Accept only a credential-free HTTPS OpenObserve JSON ingestion endpoint."""
        try:
            parsed_url = urlsplit(value)
            port = parsed_url.port
        except ValueError as error:
            raise ConfigurationError("OpenObserve ingest URL is invalid") from error
        if (
            parsed_url.scheme != "https"
            or parsed_url.hostname is None
            or parsed_url.username is not None
            or parsed_url.password is not None
            or parsed_url.query
            or parsed_url.fragment
            or not parsed_url.path.endswith("/_json")
        ):
            raise ConfigurationError(
                "OpenObserve ingest URL must be a clean HTTPS _json endpoint"
            )
        host = parsed_url.hostname if port is None else f"{parsed_url.hostname}:{port}"
        return urlunsplit((parsed_url.scheme, host, parsed_url.path, "", ""))
