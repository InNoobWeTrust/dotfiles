"""Contract tests for typed report collection and dry-run behavior."""

from pathlib import Path

from typer.testing import CliRunner

from openobserve_quality.cli import app
from openobserve_quality.domain import EventStatus, EventType, MetricName
from openobserve_quality.publisher import collect_publication
from openobserve_quality.report_parser import parse_lizard_csv


_FIXTURE_ROOT = Path(__file__).parent / "fixtures"


def test_collects_successful_reports() -> None:
    """Collect one normalized metric event for every successful report."""
    publication = collect_publication(
        _FIXTURE_ROOT / "success" / "quality-reports", threshold=10.0
    )

    assert not publication.has_failures
    assert len(publication.events) == 4
    assert {event.event_type for event in publication.events} == {
        EventType.QUALITY_RUN,
        EventType.COVERAGE_RUN,
        EventType.COMPLEXITY_RUN,
    }


def test_marks_failed_producer_as_failed() -> None:
    """Treat a nonzero producer exit code as a failed diagnostic."""
    publication = collect_publication(
        _FIXTURE_ROOT / "failed-producer" / "quality-reports", threshold=10.0
    )

    assert publication.has_failures
    assert any(
        event.event_type is EventType.DIAGNOSTIC
        and event.status is EventStatus.FAILED
        and event.message.startswith("producer_failed:")
        for event in publication.events
    )


def test_emits_diagnostics_for_missing_and_malformed_reports() -> None:
    """Emit typed diagnostics for absent and syntactically invalid inputs."""
    missing_publication = collect_publication(
        _FIXTURE_ROOT / "missing" / "quality-reports", threshold=10.0
    )
    malformed_publication = collect_publication(
        _FIXTURE_ROOT / "malformed" / "quality-reports", threshold=10.0
    )

    assert missing_publication.has_failures
    assert malformed_publication.has_failures
    assert any(
        event.event_type is EventType.DIAGNOSTIC
        for event in missing_publication.events
    )
    assert any(
        event.event_type is EventType.DIAGNOSTIC
        for event in malformed_publication.events
    )


def test_counts_lizard_rows_above_threshold() -> None:
    """Count only Lizard functions whose CCN exceeds the chosen threshold."""
    publication = collect_publication(
        _FIXTURE_ROOT / "success" / "quality-reports", threshold=10.0
    )

    complexity_event = next(
        event
        for event in publication.events
        if event.metric_name is MetricName.COMPLEXITY_ABOVE_THRESHOLD
    )
    assert complexity_event.metric_value == 1.0


def test_parses_pinned_lizard_verbose_csv_with_quoted_fields() -> None:
    """Accept the start/end header and quoted fields from Lizard 1.23.0."""
    metric = parse_lizard_csv(
        _FIXTURE_ROOT / "success" / "quality-reports" / "lizard" / "complexity.csv",
        threshold=10.0,
    )

    assert metric.metric_name is MetricName.COMPLEXITY_ABOVE_THRESHOLD
    assert metric.metric_value == 1.0


def test_builds_one_json_array_body() -> None:
    """Serialize every collected event as one JSON array request body."""
    publication = collect_publication(
        _FIXTURE_ROOT / "success" / "quality-reports", threshold=10.0
    )

    body = publication.to_json_body()

    assert body.startswith("[")
    assert body.endswith("]")
    assert body.count('"event_type"') == len(publication.events)


def test_dry_run_needs_no_reports_or_credentials() -> None:
    """Emit the deterministic dry-run body without external reads or transport."""
    result = CliRunner().invoke(
        app,
        ["--dry-run", "--report-root", "not-a-real-report-root"],
        env={},
    )

    assert result.exit_code == 0
    assert result.stdout.startswith("[")
    assert result.stdout.rstrip().endswith("]")
