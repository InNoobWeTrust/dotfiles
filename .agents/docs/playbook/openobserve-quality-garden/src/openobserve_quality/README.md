# `openobserve_quality` module

## Responsibility

This package turns four fixed local quality artifacts into one normalized JSON
array for OpenObserve. It does not generate reports, define merge policy, or
store raw reports remotely.

## Public surfaces

- `cli.app` is the Typer entry point with `--report-root`, `--threshold`,
  `--dry-run`, and `--fail-on-producer-failure`.
- `publisher.collect_publication(Path, float)` collects immutable events and
  failed diagnostic events.
- `domain.Publication.to_json_body()` is the sole JSON-array serialization
  boundary.

## Design boundaries

`metadata` validates the producer envelope, `report_parser` accepts exactly
MegaLinter JSON, Cobertura XML, and Lizard CSV, and `transport` owns the single
sanitized `urllib` POST. `--dry-run` returns before any of those I/O boundaries.
All report and metadata errors become typed diagnostic events; a nonzero
producer exit code is always failed. `--fail-on-producer-failure` posts that
normalized diagnostic body before returning its required nonzero process status.
