"""Collect normalized report events; CLI and transport remain outside this module."""

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from openobserve_quality.domain import (
    DiagnosticCode,
    EventStatus,
    EventType,
    Producer,
    Publication,
    QualityEvent,
    ReportFile,
    create_diagnostic,
)
from openobserve_quality.metadata import MetadataError, read_producer_metadata
from openobserve_quality.report_parser import (
    ParsedMetric,
    ReportParseError,
    parse_cobertura_xml,
    parse_lizard_csv,
    parse_megalinter_json,
)

ReportParser = Callable[[Path, float], ParsedMetric]


@dataclass(frozen=True, slots=True)
class ReportContract:
    """Bind one producer to its fixed artifact directory, name, and parser."""

    producer: Producer
    report_file: ReportFile
    parser: ReportParser


_REPORT_CONTRACTS = (
    ReportContract(
        producer=Producer.MEGALINTER,
        report_file=ReportFile.MEGALINTER_JSON,
        parser=parse_megalinter_json,
    ),
    ReportContract(
        producer=Producer.BACKEND_COVERAGE,
        report_file=ReportFile.COBERTURA_XML,
        parser=parse_cobertura_xml,
    ),
    ReportContract(
        producer=Producer.FRONTEND_COVERAGE,
        report_file=ReportFile.COBERTURA_XML,
        parser=parse_cobertura_xml,
    ),
    ReportContract(
        producer=Producer.LIZARD,
        report_file=ReportFile.LIZARD_CSV,
        parser=parse_lizard_csv,
    ),
)


def collect_publication(report_root: Path, threshold: float) -> Publication:
    """Collect all fixed report contracts into one typed publication body.

    Args:
        report_root: Root containing each producer directory.
        threshold: Lizard CCN threshold; a row must exceed it to be counted.

    Returns:
        Immutable events and typed diagnostics for every observed input problem.

    Raises:
        ValueError: If threshold is negative.
    """
    if threshold < 0.0:
        raise ValueError("threshold must not be negative")
    events: list[QualityEvent] = []
    for contract in _REPORT_CONTRACTS:
        events.extend(_collect_contract_events(report_root, threshold, contract))
    return Publication(events=tuple(events))


def _collect_contract_events(
    report_root: Path, threshold: float, contract: ReportContract
) -> tuple[QualityEvent, ...]:
    """Collect metadata and a report independently so all failures are observable."""
    producer_directory = report_root / contract.producer.value
    report_path = producer_directory / contract.report_file.value
    relative_directory = Path(contract.producer.value)
    events: list[QualityEvent] = []
    events.extend(
        _collect_metadata_events(
            producer_directory,
            contract.producer,
            (relative_directory / "producer.env").as_posix(),
        )
    )
    events.extend(
        _collect_report_events(
            report_path,
            threshold,
            contract,
            (relative_directory / contract.report_file.value).as_posix(),
        )
    )
    return tuple(events)


def _collect_metadata_events(
    producer_directory: Path, producer: Producer, metadata_reference: str
) -> tuple[QualityEvent, ...]:
    """Translate metadata absence, malformed fields, and failed exits into diagnostics."""
    try:
        metadata = read_producer_metadata(producer_directory, producer)
    except FileNotFoundError:
        return (
            create_diagnostic(
                producer,
                DiagnosticCode.MISSING_METADATA,
                metadata_reference,
                "producer.env is required for every producer.",
            ),
        )
    except (MetadataError, OSError, UnicodeDecodeError):
        return (
            create_diagnostic(
                producer,
                DiagnosticCode.MALFORMED_METADATA,
                metadata_reference,
                "producer.env could not be validated.",
            ),
        )
    if metadata.has_failed:
        return (
            create_diagnostic(
                producer,
                DiagnosticCode.PRODUCER_FAILED,
                metadata_reference,
                "producer status is failed or its exit_code is nonzero.",
            ),
        )
    return ()


def _collect_report_events(
    report_path: Path,
    threshold: float,
    contract: ReportContract,
    report_reference: str,
) -> tuple[QualityEvent, ...]:
    """Parse one fixed report and translate boundary errors into diagnostics."""
    if not report_path.is_file():
        return (
            create_diagnostic(
                contract.producer,
                DiagnosticCode.MISSING_REPORT,
                report_reference,
                "required report is missing.",
            ),
        )
    try:
        metric = contract.parser(report_path, threshold)
    except ReportParseError:
        return (
            create_diagnostic(
                contract.producer,
                DiagnosticCode.MALFORMED_REPORT,
                report_reference,
                "report does not conform to its documented format.",
            ),
        )
    return (
        QualityEvent(
            event_type=_event_type_for(contract.producer),
            status=EventStatus.COMPLETED,
            producer=contract.producer,
            report_format=metric.report_format,
            metric_name=metric.metric_name,
            metric_value=metric.metric_value,
            report_path=report_reference,
            message=metric.message,
        ),
    )


def _event_type_for(producer: Producer) -> EventType:
    """Map producer identity to its normalized event family."""
    if producer is Producer.MEGALINTER:
        return EventType.QUALITY_RUN
    if producer in (Producer.BACKEND_COVERAGE, Producer.FRONTEND_COVERAGE):
        return EventType.COVERAGE_RUN
    if producer is Producer.LIZARD:
        return EventType.COMPLEXITY_RUN
    raise ValueError("report producer has no normalized event type")
