"""Wire the Typer options to typed report collection and optional publication."""

from pathlib import Path
from typing import Annotated, NoReturn

import typer

from openobserve_quality.config import ConfigurationError, IngestSettings
from openobserve_quality.domain import (
    DiagnosticCode,
    Producer,
    Publication,
    create_diagnostic,
)
from openobserve_quality.publisher import collect_publication
from openobserve_quality.transport import TransportError, publish_json_array

_DEFAULT_REPORT_ROOT = Path("quality-reports")
_DEFAULT_COMPLEXITY_THRESHOLD = 15.0

app = typer.Typer(add_completion=False, no_args_is_help=False)


@app.callback(invoke_without_command=True)
def publish_quality(
    report_root: Annotated[
        Path,
        typer.Option("--report-root", help="Directory containing producer report folders."),
    ] = _DEFAULT_REPORT_ROOT,
    threshold: Annotated[
        float,
        typer.Option(
            "--threshold",
            min=0.0,
            help="Count Lizard functions whose CCN is greater than this value.",
        ),
    ] = _DEFAULT_COMPLEXITY_THRESHOLD,
    dry_run: Annotated[
        bool,
        typer.Option(
            "--dry-run",
            help="Emit a deterministic body without reading reports or credentials.",
        ),
    ] = False,
    fail_on_producer_failure: Annotated[
        bool,
        typer.Option(
            "--fail-on-producer-failure",
            help="Publish producer-failure diagnostics before returning a nonzero status.",
        ),
    ] = False,
) -> None:
    """Build and optionally publish one normalized OpenObserve JSON array.

    Dry-run returns before any report, credential, or network access. In normal
    mode, report failures become typed diagnostics. The explicit producer-failure
    option defers that failure exit until after sanitized urllib publication.
    """
    if dry_run:
        typer.echo(Publication.dry_run().to_json_body())
        return

    publication = collect_publication(report_root, threshold)
    body = publication.to_json_body()
    should_defer_producer_failure = (
        fail_on_producer_failure and publication.has_producer_failure
    )
    if publication.has_failures and not should_defer_producer_failure:
        typer.echo(body)
        raise typer.Exit(code=1)

    try:
        settings = IngestSettings()
    except ConfigurationError:
        _emit_failure(DiagnosticCode.INVALID_CONFIGURATION, "ingest settings are invalid")
    try:
        publish_json_array(settings, body)
    except TransportError:
        _emit_failure(DiagnosticCode.TRANSPORT_FAILURE, "OpenObserve publication failed")
    typer.echo(body)
    if should_defer_producer_failure:
        raise typer.Exit(code=1)


def _emit_failure(code: DiagnosticCode, message: str) -> NoReturn:
    """Emit one typed publisher diagnostic and stop with a failed process status."""
    failure = Publication(
        events=(create_diagnostic(Producer.PUBLISHER, code, "", message),)
    )
    typer.echo(failure.to_json_body())
    raise typer.Exit(code=1)


def main() -> None:
    """Run the Typer application entry point."""
    app()
