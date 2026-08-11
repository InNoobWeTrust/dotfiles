"""Parse producer.env metadata; this module does not inspect report contents."""

from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path

from openobserve_quality.domain import Producer


class ProducerStatus(StrEnum):
    """Describe the producer's own terminal status written by its action."""

    PASSED = "passed"
    FAILED = "failed"


class MetadataField(StrEnum):
    """Name the only fields allowed in a producer.env record."""

    PRODUCER = "producer"
    STATUS = "status"
    EXIT_CODE = "exit_code"
    JOB_ID = "job_id"
    JOB_NAME = "job_name"
    JOB_URL = "job_url"


class MetadataError(ValueError):
    """Identify malformed producer metadata without exposing its contents."""


@dataclass(frozen=True, slots=True)
class ProducerMetadata:
    """Represent validated metadata supplied by one quality producer action."""

    producer: Producer
    status: ProducerStatus
    exit_code: int
    job_id: str
    job_name: str
    job_url: str

    @property
    def has_failed(self) -> bool:
        """Return true when status is failed or the producer exited nonzero."""
        return self.status is ProducerStatus.FAILED or self.exit_code != 0


def read_producer_metadata(
    producer_directory: Path, expected_producer: Producer
) -> ProducerMetadata:
    """Read one strict producer.env file for the declared producer.

    Args:
        producer_directory: Directory containing the producer.env file.
        expected_producer: Producer whose metadata is expected at this path.

    Returns:
        A validated immutable producer metadata record.

    Raises:
        FileNotFoundError: If producer.env does not exist.
        MetadataError: If fields are unknown, missing, duplicated, or invalid.
        OSError: If the metadata file cannot be read.
    """
    metadata_path = producer_directory / "producer.env"
    source = metadata_path.read_text(encoding="utf-8")
    field_values: dict[MetadataField, str] = {}
    for line_number, line in enumerate(source.splitlines(), start=1):
        if not line or line.startswith("#"):
            continue
        key, separator, value = line.partition("=")
        if not separator or not key:
            raise MetadataError(f"line {line_number} must use key=value")
        try:
            field = MetadataField(key)
        except ValueError as error:
            raise MetadataError(f"line {line_number} has an unsupported field") from error
        if field in field_values:
            raise MetadataError(f"line {line_number} duplicates {field.value}")
        field_values[field] = value

    required_fields = (
        MetadataField.PRODUCER,
        MetadataField.STATUS,
        MetadataField.EXIT_CODE,
    )
    missing_fields = [field.value for field in required_fields if field not in field_values]
    if missing_fields:
        raise MetadataError(f"missing required fields: {', '.join(missing_fields)}")
    return _build_producer_metadata(field_values, expected_producer)


def _build_producer_metadata(
    field_values: dict[MetadataField, str], expected_producer: Producer
) -> ProducerMetadata:
    """Validate required scalar values and construct immutable producer metadata."""
    try:
        producer = Producer(field_values[MetadataField.PRODUCER])
        status = ProducerStatus(field_values[MetadataField.STATUS])
        exit_code = int(field_values[MetadataField.EXIT_CODE])
    except ValueError as error:
        raise MetadataError("producer, status, or exit_code is invalid") from error
    if producer is not expected_producer:
        raise MetadataError("producer does not match its report directory")
    if exit_code < 0:
        raise MetadataError("exit_code must not be negative")
    return ProducerMetadata(
        producer=producer,
        status=status,
        exit_code=exit_code,
        job_id=field_values.get(MetadataField.JOB_ID, ""),
        job_name=field_values.get(MetadataField.JOB_NAME, ""),
        job_url=field_values.get(MetadataField.JOB_URL, ""),
    )
