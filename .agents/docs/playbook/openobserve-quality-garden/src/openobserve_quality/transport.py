"""Submit one JSON array over sanitized urllib transport; no report parsing lives here."""

import base64
from typing import Final
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from openobserve_quality.config import IngestSettings

_CONTENT_TYPE: Final = "application/json"
_REQUEST_TIMEOUT_SECONDS: Final = 15.0


class TransportError(RuntimeError):
    """Identify a failed HTTP publication without leaking request credentials."""


def publish_json_array(settings: IngestSettings, body: str) -> None:
    """POST one serialized JSON array to the configured OpenObserve endpoint.

    Args:
        settings: Validated endpoint and credentials read at the CLI boundary.
        body: The already-built JSON array body to send exactly once.

    Raises:
        TransportError: If the request cannot complete or is not a 2xx response.
    """
    credentials = f"{settings.openobserve_ingest_user}:{settings.openobserve_ingest_token}".encode()
    authorization = base64.b64encode(credentials).decode("ascii")
    request = Request(
        settings.openobserve_ingest_url,
        data=body.encode("utf-8"),
        headers={
            "Authorization": f"Basic {authorization}",
            "Content-Type": _CONTENT_TYPE,
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=_REQUEST_TIMEOUT_SECONDS) as response:
            status_code = response.getcode()
    except HTTPError as error:
        raise TransportError(f"OpenObserve responded with HTTP {error.code}") from error
    except URLError as error:
        raise TransportError("OpenObserve request could not be completed") from error
    except OSError as error:
        raise TransportError("OpenObserve transport failed") from error
    if status_code is None or not 200 <= status_code < 300:
        raise TransportError("OpenObserve returned a non-success response")
