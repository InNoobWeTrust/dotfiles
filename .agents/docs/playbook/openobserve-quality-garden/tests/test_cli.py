"""Tests for the typed quality-publication command."""

from pathlib import Path

from pytest import MonkeyPatch
from typer.testing import CliRunner

from openobserve_quality import cli
from openobserve_quality.config import IngestSettings


_FIXTURE_ROOT = Path(__file__).parent / "fixtures"


def test_dry_run_emits_json_array() -> None:
    """Verify that dry-run output is a serialized JSON array."""
    result = CliRunner().invoke(cli.app, ["--dry-run"])

    assert result.exit_code == 0
    assert result.stdout.startswith("[")
    assert result.stdout.rstrip().endswith("]")


def test_uploads_producer_failures_before_returning_nonzero(
    monkeypatch: MonkeyPatch,
) -> None:
    """Upload normalized producer diagnostics before the requested failure exit."""
    posted_bodies: list[str] = []

    def record_publication(settings: IngestSettings, body: str) -> None:
        """Record the body that would cross the transport boundary."""
        del settings
        posted_bodies.append(body)

    monkeypatch.setattr(cli, "publish_json_array", record_publication)
    result = CliRunner().invoke(
        cli.app,
        [
            "--report-root",
            str(_FIXTURE_ROOT / "failed-producer" / "quality-reports"),
            "--fail-on-producer-failure",
        ],
        env={
            "OPENOBSERVE_INGEST_URL": "https://example.invalid/api/default/default/_json",
            "OPENOBSERVE_INGEST_USER": "test-user",
            "OPENOBSERVE_INGEST_TOKEN": "test-token",
        },
    )

    assert result.exit_code == 1
    assert len(posted_bodies) == 1
    assert "producer_failed:" in posted_bodies[0]
    assert result.stdout.rstrip() == posted_bodies[0]


def test_keeps_default_producer_failure_behavior_without_deferred_exit(
    monkeypatch: MonkeyPatch,
) -> None:
    """Keep the existing no-upload failure behavior unless the option is set."""
    posted_bodies: list[str] = []

    def record_publication(settings: IngestSettings, body: str) -> None:
        """Record an unexpected transport call for this failure mode."""
        del settings
        posted_bodies.append(body)

    monkeypatch.setattr(cli, "publish_json_array", record_publication)
    result = CliRunner().invoke(
        cli.app,
        [
            "--report-root",
            str(_FIXTURE_ROOT / "failed-producer" / "quality-reports"),
        ],
        env={
            "OPENOBSERVE_INGEST_URL": "https://example.invalid/api/default/default/_json",
            "OPENOBSERVE_INGEST_USER": "test-user",
            "OPENOBSERVE_INGEST_TOKEN": "test-token",
        },
    )

    assert result.exit_code == 1
    assert posted_bodies == []
