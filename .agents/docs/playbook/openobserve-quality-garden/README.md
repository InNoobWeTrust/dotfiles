# OpenObserve Quality Garden

A local-only Garden example for a **hypothetical** application with `backend/`
and `frontend/` directories. This dotfiles repository does not contain that
application. Treat every producer command as an explicit copy/adapt template,
not as a claim that it runs here.

The workflow keeps raw reports local, normalizes small scalar records, and
sends exactly one JSON array to OpenObserve after every producer records its
original result. Producer actions return success only after writing their
metadata, so Garden reaches publication even when a producer failed. There is
no dedicated cloud-CI configuration in this example.

## Prerequisites and setup

Install Garden, Docker (for MegaLinter), `uv`, and the hypothetical
application's backend and frontend dependencies. This example pins its Python
build, runtime, and test dependencies in `pyproject.toml`; the Lizard action
uses `lizard==1.23.0` through `uvx`. Pin the MegaLinter image and application
tool versions before relying on this workflow for repeatability.

Set these three local environment variables outside version control; never
commit their values:

- `OPENOBSERVE_INGEST_URL` — a credential-free HTTPS OpenObserve `/_json` URL.
- `OPENOBSERVE_INGEST_USER` — least-privilege ingest user.
- `OPENOBSERVE_INGEST_TOKEN` — least-privilege ingest token.

Run the complete local dependency graph from this directory:

```bash
garden run publish-quality
```

Use the deterministic no-I/O path while wiring the command:

```bash
uv run openobserve-quality --dry-run --report-root quality-reports --threshold 15
```

Dry-run does not read reports, credentials, or network resources.

## Illustrative producer commands

`garden.yml` deliberately expects a hypothetical application and writes the
following artifacts. Adapt each command to the real application's toolchain
while preserving these paths and metadata fields:

| Garden action | Illustrative command | Required output |
| --- | --- | --- |
| `mega-linter` | Docker MegaLinter v10 with `JSON_REPORTER=true` | `quality-reports/megalinter/report.json` |
| `backend-coverage` | `backend`: `uv run pytest --cov --cov-report=xml:...` | `quality-reports/backend-coverage/coverage.xml` |
| `frontend-coverage` | `frontend`: `npm test -- --coverage --coverageReporters=cobertura` | `quality-reports/frontend-coverage/coverage.xml` |
| `lizard-complexity` | `uvx --from lizard==1.23.0 lizard --csv --verbose backend frontend` | `quality-reports/lizard/complexity.csv` |

Each action also writes
`quality-reports/<producer>/producer.env` with the strict contract:

```dotenv
producer=<megalinter|backend-coverage|frontend-coverage|lizard>
status=<passed|failed>
exit_code=<non-negative integer>
job_id=<optional local or CI identifier>
job_name=<optional name>
job_url=<optional URL>
```

A nonzero `exit_code` is always normalized as failed, regardless of `status`.
Each producer returns zero only after writing this original result, allowing
`publish-quality` to run. That action passes `--fail-on-producer-failure`, which
uploads the normalized diagnostics and then exits nonzero for the failed
producer. Missing or malformed metadata and reports produce typed diagnostics
and a nonzero publisher exit.

## Report schema and path contract

The normalizer accepts only these formats:

- MegaLinter: a syntactically valid JSON **map** at
  `quality-reports/megalinter/report.json`. The schema is version-specific and
  treated as opaque; this example does not guess finding fields.
- Backend and frontend coverage: Cobertura XML with a `coverage` root and a
  numeric `line-rate` in `[0, 1]` at each fixed `coverage.xml` path.
- Complexity: Lizard 1.23.0 `--csv --verbose` CSV at
  `quality-reports/lizard/complexity.csv`, with the documented header ending
  `long_name,start,end` and quoted string fields. Functions are counted when
  `CCN` is strictly greater than `--threshold`.

Every output record is a frozen typed domain record serialized explicitly as a
flat object with `event_type`, `status`, `schema_version`, `producer`,
`report_format`, `metric_name`, `metric_value`, `report_path`, and `message`.
The request body is always one JSON array, never a lone object, NDJSON stream,
raw report, source file, or secret.

## Garden secret propagation

Only the `publish-quality` local action receives OpenObserve settings, through
these exact Garden template references with no embedded values:

```yaml
OPENOBSERVE_INGEST_URL: ${local.env.OPENOBSERVE_INGEST_URL}
OPENOBSERVE_INGEST_USER: ${local.env.OPENOBSERVE_INGEST_USER}
OPENOBSERVE_INGEST_TOKEN: ${local.env.OPENOBSERVE_INGEST_TOKEN}
```

The Python transport accepts only a credential-free HTTPS `/_json` endpoint,
removes query and fragment components, uses a 15-second timeout, and never
prints credentials. Do not commit any secret file or raw report containing
sensitive material.

## Traceability

This example implements the normalized-array and raw-artifact separation in
the canonical [OpenObserve ingestion and metadata contract](../../quality-tooling/openobserve-megalinter.md#openobserve-ingestion-and-metadata-contract).
That document remains the source of truth for retention, indexing, security,
and broader operational policy.

## Validation

```bash
uv run pytest
```

The tests cover successful producer reports, failed producer metadata,
missing/malformed inputs, Lizard thresholds, JSON-array serialization, dry-run
behavior, and deferred producer-failure publication. `project.garden.yml` uses
its documented `dotIgnoreFile` support to exclude the local `.venv/`, without
an additional uncertain scan filter.
