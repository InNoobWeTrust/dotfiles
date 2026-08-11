# OpenObserve Quality Garden: MVP Playbook

> **For one hypothetical monorepo.** Copy and adapt the standalone [Garden example](./openobserve-quality-garden/) for an application with `backend/` and `frontend/` directories. The example is a template, not a claim that this repository contains that application.

## Outcome and boundary

Garden local `Run`/`exec` actions own the reproducible workflow. No GitLab, GitHub, or cloud CI service is required or involved. Four local producers create raw reports; a dependent publisher validates their outputs, emits normalized records, and sends one JSON array to OpenObserve.

This is an MVP for local quality telemetry. It does not define release policy, remote raw-report storage, dashboards, retention, scaling, or security operations. Use the [canonical OpenObserve + MegaLinter guide](../quality-tooling/openobserve-megalinter.md) for those decisions and the broader metadata contract.

## What the example contains

- **Hypothetical repository:** `backend/` and `frontend/`; adapt commands and pinned tool versions to the target monorepo.
- **MegaLinter producer:** writes `quality-reports/megalinter/report.json`.
- **Backend coverage producer:** writes Cobertura XML to `quality-reports/backend-coverage/coverage.xml`.
- **Frontend coverage producer:** writes Cobertura XML to `quality-reports/frontend-coverage/coverage.xml`.
- **Lizard producer:** writes CSV to `quality-reports/lizard/complexity.csv`.
- **Producer metadata:** each producer writes `quality-reports/<producer>/producer.env` beside its report.
- **Publisher:** depends on all four producers and runs the `openobserve-quality` package.

Read the [example README](./openobserve-quality-garden/README.md), [project.garden.yml](./openobserve-quality-garden/project.garden.yml), and [garden.yml](./openobserve-quality-garden/garden.yml) for the concrete action graph and path contract. The [uploader package README](./openobserve-quality-garden/src/openobserve_quality/README.md) documents the module boundaries.

## Producer metadata contract

Every producer must preserve this local `producer.env` envelope:

| Field | Requirement |
|---|---|
| `producer` | One of `megalinter`, `backend-coverage`, `frontend-coverage`, `lizard`; it must match the directory. |
| `status` | `passed` or `failed`, representing the producer command. |
| `exit_code` | A non-negative integer. Any nonzero value is failed, regardless of `status`. |
| `job_id`, `job_name`, `job_url` | Optional traceability values; local identifiers are valid. |

Missing, duplicated, unknown, or malformed fields are diagnostics, not successful results. A failed producer may still provide a valid partial report; the publisher preserves the failure.

## Normalizer behavior

The normalizer accepts only the fixed report paths and formats:

1. MegaLinter JSON must be a syntactically valid root map. Its version-specific contents remain opaque; the MVP records validated document presence rather than guessing finding fields.
2. Coverage reports must be Cobertura XML with a `coverage` root and numeric `line-rate` from `0` through `1`; the value becomes a percentage.
3. Lizard CSV must contain `CCN` and `NLOC` columns; functions with `CCN` strictly greater than the configured threshold are counted.

Each normalized record is an immutable typed domain value. Supported classifications remain explicit enums for event type, status, producer, report format, metric, and diagnostic code; serialization writes their stable string values. The design does not erase those distinctions into arbitrary untyped maps at the domain boundary.

The publisher emits flat records containing `event_type`, `status`, `schema_version`, `producer`, `report_format`, `metric_name`, `metric_value`, `report_path`, and `message`. Missing or malformed inputs become failed diagnostic records and produce a nonzero publisher result. The request body is always one canonical JSON array: never a lone object, NDJSON stream, raw report, source file, or secret.

Garden dependencies keep `publish-quality` behind the four producer actions. If it is invoked with partial outputs, the normalizer reports missing, malformed, or producer-failed inputs explicitly rather than inventing success.

See the [uploader tests](./openobserve-quality-garden/tests/test_quality_publisher.py) and [CLI tests](./openobserve-quality-garden/tests/test_cli.py) for the executable contract.

## Use the workflow

1. Copy or adapt `openobserve-quality-garden/` into the target monorepo. Keep the four report directories, filenames, metadata fields, and publisher dependency boundary unless the contract is deliberately versioned.
2. Install Garden, Docker for MegaLinter, `uv`, Lizard, and the target application's backend/frontend dependencies. Pin tool and image versions for repeatability.
3. Configure these values in the host environment, outside version control: `OPENOBSERVE_INGEST_URL` (credential-free HTTPS `/_json` URL), `OPENOBSERVE_INGEST_USER`, and `OPENOBSERVE_INGEST_TOKEN`. Use least-privilege ingest credentials; do not place values in Garden files or print them.
4. From the adapted example directory, run the complete local graph:

   ```bash
   garden run publish-quality
   ```

5. During setup, use the deterministic no-I/O dry run:

   ```bash
   uv run openobserve-quality --dry-run --report-root quality-reports --threshold 15
   ```

   Dry run returns before reading reports, credentials, or network resources.
6. Run the example tests with `uv run pytest` before relying on an adaptation.

Only `publish-quality` receives the three OpenObserve settings through Garden's `${local.env.*}` references. The transport accepts only a credential-free HTTPS `/_json` endpoint, strips query and fragment components, uses a 15-second timeout, and never logs credentials.

## Checks and limitations

- Confirm all four producer outputs and `producer.env` files exist before publication.
- Confirm every metadata `producer` value matches its directory and every nonzero `exit_code` remains failed.
- Confirm the ingest request parses as a JSON array with the stable flat record fields.
- Keep raw reports local and exclude source contents, secrets, full diffs, and unredacted command output from telemetry.
- Treat MegaLinter JSON as report-version-specific; update the adapter deliberately when its format changes.
- Treat coverage and complexity as separate evidence; do not compare unrelated languages or tools as one universal score.
- A dry run proves the no-I/O path, not report parsing or OpenObserve connectivity.
- This local MVP does not provide shared enforcement, remote retention, access governance, or production availability.

## Related links

- [Canonical OpenObserve ingestion and metadata contract](../quality-tooling/openobserve-megalinter.md#openobserve-ingestion-and-metadata-contract)
- [OpenObserve JSON ingestion](https://openobserve.ai/docs/reference/api/ingestion/logs/json/)
- [MegaLinter documentation](https://megalinter.io/latest/)
- [OpenObserve + MegaLinter evidence sources](../quality-tooling/details/openobserve-megalinter-sources.md)
