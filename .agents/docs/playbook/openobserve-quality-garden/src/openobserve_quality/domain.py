"""Model immutable normalized quality events; parsers and transport own I/O."""

from dataclasses import dataclass
from enum import StrEnum
import json
from typing import Final, TypedDict


SCHEMA_VERSION: Final = 1
_DRY_RUN_MESSAGE: Final = "Dry run completed without report, credential, or network reads."


class EventType(StrEnum):
    """Classify a normalized quality event."""

    DRY_RUN = "dry_run"
    QUALITY_RUN = "quality_run"
    COVERAGE_RUN = "coverage_run"
    COMPLEXITY_RUN = "complexity_run"
    DIAGNOSTIC = "diagnostic"


class EventStatus(StrEnum):
    """Describe the terminal status represented by an event."""

    COMPLETED = "completed"
    FAILED = "failed"


class Producer(StrEnum):
    """Name every report producer supported by this example."""

    MEGALINTER = "megalinter"
    BACKEND_COVERAGE = "backend-coverage"
    FRONTEND_COVERAGE = "frontend-coverage"
    LIZARD = "lizard"
    PUBLISHER = "publisher"


class ReportFormat(StrEnum):
    """Name the exact report formats accepted by the normalizer."""

    MEGALINTER_JSON = "megalinter-json"
    COBERTURA_XML = "cobertura-xml"
    LIZARD_CSV = "lizard-csv"
    NONE = "none"


class ReportFile(StrEnum):
    """Name the fixed artifact filename accepted for each report format."""

    MEGALINTER_JSON = "report.json"
    COBERTURA_XML = "coverage.xml"
    LIZARD_CSV = "complexity.csv"


class MetricName(StrEnum):
    """Name the scalar measurement carried by a normalized event."""

    REPORT_DOCUMENT_COUNT = "report_document_count"
    COVERAGE_PERCENT = "coverage_percent"
    COMPLEXITY_ABOVE_THRESHOLD = "complexity_above_threshold"
    DIAGNOSTIC_COUNT = "diagnostic_count"


class DiagnosticCode(StrEnum):
    """Classify an explicit terminal quality-publication diagnostic."""

    MISSING_METADATA = "missing_metadata"
    MALFORMED_METADATA = "malformed_metadata"
    PRODUCER_FAILED = "producer_failed"
    MISSING_REPORT = "missing_report"
    MALFORMED_REPORT = "malformed_report"
    INVALID_CONFIGURATION = "invalid_configuration"
    TRANSPORT_FAILURE = "transport_failure"


class QualityEventPayload(TypedDict):
    """Define the explicit JSON object emitted for every quality event."""

    event_type: str
    status: str
    schema_version: int
    producer: str
    report_format: str
    metric_name: str
    metric_value: float
    report_path: str
    message: str


@dataclass(frozen=True, slots=True)
class QualityEvent:
    """Represent one fully normalized event ready for JSON serialization.

    All string classifications are enums so callers cannot construct a record
    with an unsupported producer, format, metric, status, or event type.
    """

    event_type: EventType
    status: EventStatus
    producer: Producer
    report_format: ReportFormat
    metric_name: MetricName
    metric_value: float
    report_path: str
    message: str
    diagnostic_code: DiagnosticCode | None = None

    def to_json(self) -> QualityEventPayload:
        """Return the exact flat JSON object accepted by the ingest boundary."""
        return {
            "event_type": self.event_type.value,
            "status": self.status.value,
            "schema_version": SCHEMA_VERSION,
            "producer": self.producer.value,
            "report_format": self.report_format.value,
            "metric_name": self.metric_name.value,
            "metric_value": self.metric_value,
            "report_path": self.report_path,
            "message": self.message,
        }


@dataclass(frozen=True, slots=True)
class Publication:
    """Represent the single JSON-array body for one publication attempt."""

    events: tuple[QualityEvent, ...]

    @property
    def has_failures(self) -> bool:
        """Return whether any event records a terminal failed condition."""
        return any(event.status is EventStatus.FAILED for event in self.events)

    @property
    def has_producer_failure(self) -> bool:
        """Return whether a producer reported a nonzero or failed result."""
        return any(
            event.diagnostic_code is DiagnosticCode.PRODUCER_FAILED
            for event in self.events
        )

    def to_json_body(self) -> str:
        """Serialize all events once as the compact OpenObserve JSON array body."""
        return json.dumps(
            [event.to_json() for event in self.events],
            separators=(",", ":"),
            sort_keys=True,
        )

    @classmethod
    def dry_run(cls) -> "Publication":
        """Create the deterministic event used before any external boundary is read."""
        return cls(
            events=(
                QualityEvent(
                    event_type=EventType.DRY_RUN,
                    status=EventStatus.COMPLETED,
                    producer=Producer.PUBLISHER,
                    report_format=ReportFormat.NONE,
                    metric_name=MetricName.REPORT_DOCUMENT_COUNT,
                    metric_value=0.0,
                    report_path="",
                    message=_DRY_RUN_MESSAGE,
                ),
            )
        )


def create_diagnostic(
    producer: Producer,
    code: DiagnosticCode,
    report_path: str,
    message: str,
) -> QualityEvent:
    """Create one failed typed diagnostic for a report or publication boundary."""
    return QualityEvent(
        event_type=EventType.DIAGNOSTIC,
        status=EventStatus.FAILED,
        producer=producer,
        report_format=ReportFormat.NONE,
        metric_name=MetricName.DIAGNOSTIC_COUNT,
        metric_value=1.0,
        report_path=report_path,
        message=f"{code.value}: {message}",
        diagnostic_code=code,
    )
