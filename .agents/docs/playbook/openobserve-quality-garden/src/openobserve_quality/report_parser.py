"""Parse only MegaLinter JSON, Cobertura XML, and documented Lizard CSV reports."""

import csv
import math
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree

from openobserve_quality.domain import MetricName, ReportFormat
from openobserve_quality.json_document import JsonDocumentError, parse_json_document


class ReportParseError(ValueError):
    """Identify an unsupported or malformed report without copying raw contents."""


@dataclass(frozen=True, slots=True)
class ParsedMetric:
    """Represent one scalar measurement parsed from an exact report format."""

    report_format: ReportFormat
    metric_name: MetricName
    metric_value: float
    message: str


@dataclass(frozen=True, slots=True)
class _LizardColumnIndexes:
    """Store validated Lizard CSV column positions by their documented names."""

    ccn: int
    nloc: int


def parse_megalinter_json(report_path: Path, threshold: float) -> ParsedMetric:
    """Validate an opaque MegaLinter JSON document and record its presence.

    MegaLinter's JSON schema is version-specific. This parser deliberately
    validates a JSON root map but does not infer linter finding fields.
    """
    del threshold
    try:
        document = parse_json_document(report_path.read_text(encoding="utf-8"))
    except (JsonDocumentError, OSError, UnicodeDecodeError) as error:
        raise ReportParseError("invalid MegaLinter JSON") from error
    if not isinstance(document, dict):
        raise ReportParseError("MegaLinter JSON root must be a map")
    return ParsedMetric(
        report_format=ReportFormat.MEGALINTER_JSON,
        metric_name=MetricName.REPORT_DOCUMENT_COUNT,
        metric_value=1.0,
        message="Validated opaque MegaLinter JSON document.",
    )


def parse_cobertura_xml(report_path: Path, threshold: float) -> ParsedMetric:
    """Parse the Cobertura root line-rate into a percentage metric."""
    del threshold
    try:
        root = ElementTree.parse(report_path).getroot()
    except (ElementTree.ParseError, OSError) as error:
        raise ReportParseError("invalid Cobertura XML") from error
    if root.tag != "coverage":
        raise ReportParseError("Cobertura root element must be coverage")
    line_rate = root.attrib.get("line-rate")
    if line_rate is None:
        raise ReportParseError("Cobertura coverage element needs line-rate")
    try:
        coverage_fraction = float(line_rate)
    except ValueError as error:
        raise ReportParseError("Cobertura line-rate must be numeric") from error
    if not math.isfinite(coverage_fraction) or not 0.0 <= coverage_fraction <= 1.0:
        raise ReportParseError("Cobertura line-rate must be within zero and one")
    return ParsedMetric(
        report_format=ReportFormat.COBERTURA_XML,
        metric_name=MetricName.COVERAGE_PERCENT,
        metric_value=coverage_fraction * 100.0,
        message="Parsed Cobertura line-rate as a percentage.",
    )


def parse_lizard_csv(report_path: Path, threshold: float) -> ParsedMetric:
    """Count documented Lizard CSV function rows whose CCN exceeds threshold."""
    try:
        with report_path.open(encoding="utf-8", newline="") as report_file:
            rows = csv.reader(report_file)
            header = next(rows, None)
            if header is None:
                raise ReportParseError("Lizard CSV is empty")
            column_indexes = _lizard_column_indexes(header)
            count = _count_complex_functions(rows, column_indexes, threshold)
    except (csv.Error, OSError, UnicodeDecodeError) as error:
        raise ReportParseError("invalid Lizard CSV") from error
    return ParsedMetric(
        report_format=ReportFormat.LIZARD_CSV,
        metric_name=MetricName.COMPLEXITY_ABOVE_THRESHOLD,
        metric_value=float(count),
        message="Counted Lizard CSV rows with CCN above the configured threshold.",
    )


def _lizard_column_indexes(header: list[str]) -> _LizardColumnIndexes:
    """Locate the exact documented CCN and NLOC Lizard CSV columns."""
    try:
        return _LizardColumnIndexes(ccn=header.index("CCN"), nloc=header.index("NLOC"))
    except ValueError as error:
        raise ReportParseError("Lizard CSV requires CCN and NLOC columns") from error


def _count_complex_functions(
    rows: Iterable[list[str]], column_indexes: _LizardColumnIndexes, threshold: float
) -> int:
    """Validate Lizard function scalars and count rows exceeding the threshold."""
    count = 0
    required_index = max(column_indexes.ccn, column_indexes.nloc)
    for line_number, row in enumerate(rows, start=2):
        if len(row) <= required_index:
            raise ReportParseError(f"Lizard CSV row {line_number} is incomplete")
        try:
            ccn = float(row[column_indexes.ccn])
            nloc = int(row[column_indexes.nloc])
        except ValueError as error:
            raise ReportParseError(f"Lizard CSV row {line_number} has invalid scalars") from error
        if not math.isfinite(ccn) or ccn < 0.0 or nloc < 0:
            raise ReportParseError(f"Lizard CSV row {line_number} has invalid ranges")
        if ccn > threshold:
            count += 1
    return count
