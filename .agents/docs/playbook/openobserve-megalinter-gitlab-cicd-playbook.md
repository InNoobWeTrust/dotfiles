# GitLab Quality Checks + OpenObserve: MVP Getting Started

> **For one repository.** This short guide gets MegaLinter, test coverage, complexity checks, and OpenObserve working together. It is a starting point, not a universal pipeline.

## Outcome

After setup:

- GitLab runs lint, tests and coverage, and complexity checks.
- GitLab decides whether the pipeline passes or fails.
- OpenObserve shows a history of the lint, coverage, and complexity results.

## What this guide does not cover

This guide does not explain deployment choices, security design, scaling, backups, retention policy, or advanced dashboards. Use the [canonical OpenObserve + MegaLinter guide](../quality-tooling/openobserve-megalinter.md) when you are ready for those topics.

## Before you start

You need:

1. A working OpenObserve URL, organization, and target stream.
2. A GitLab Runner that can pull `ghcr.io/oxsecurity/megalinter:v10` and reach OpenObserve.
3. Three GitLab CI variable names available in the project settings:

   ```text
   OPENOBSERVE_INGEST_URL
   OPENOBSERVE_INGEST_USER
   OPENOBSERVE_INGEST_TOKEN
   ```

Mark the variables as masked and protected. Put the values in GitLab settings only. Never put values in YAML or print them in job logs.

## The simple flow

```text
repository
    |
    v
three GitLab jobs: lint | test + coverage | complexity
    |
    v
GitLab report files (artifacts)
    |
    v
one publish-quality job (uploader)
    |
    v
OpenObserve
```

An **artifact** is a report file GitLab saves, including after a failed job when `artifacts: when: always` is configured. The **uploader** is a small repository-owned script or container that reads the report formats this repository actually produces, normalizes them, and sends an array of records to OpenObserve. It is not a universal parser. Send summaries only; detailed `quality_findings` records are optional and deferred for this MVP. Keep raw reports in GitLab artifacts; do not send source files or full job logs. Follow the [canonical ingestion and metadata contract](../quality-tooling/openobserve-megalinter.md#openobserve-ingestion-and-metadata-contract) for record fields.

## Setup steps

### 1. Add a report-only MegaLinter baseline

Create `.mega-linter.yml`. Choose the linter keys for this repository. `ENABLE_LINTERS` is a list. Keep fixes off while starting.

### 2. Add three separate jobs

- `mega-linter` runs lint checks.
- `test-coverage` runs the repository's current test tool and writes coverage output.
- `complexity` runs Lizard and writes CSV or XML output.

MegaLinter does linting only. It does not calculate coverage. Lizard is a separate complexity tool.

### 3. Save the report files

Give each job its own report folder. Use `artifacts: when: always` so GitLab saves the files after a failed lint, test, coverage, or complexity check. These files are for investigating failures and for the uploader.

### 4. Add the uploader job

Add `publish-quality` after the three jobs. It should use `when: always`, which means it runs even when an earlier job fails. Start with `allow_failure: true`, which means an uploader failure does not fail the pipeline during this MVP rollout.

`allow_failure: true` applies only to `publish-quality`. A failed lint, test, coverage threshold, or complexity check must still fail its own job and the pipeline. The uploader must never turn that failure into a pass.

The uploader reads the saved reports and sends one JSON array to the OpenObserve `_json` ingestion URL. GitLab artifacts and GitLab report widgets do not automatically send anything to OpenObserve. The uploader must explicitly download the needed artifacts and parse the repository's known report formats; do not assume a generic parser can understand every MegaLinter, coverage, or Lizard output.

GitLab does not execute later `script` lines after a command fails. In this flow, `when: always` runs `publish-quality` after an upstream failure, and `artifacts: when: always` makes the reports available to it. If scanning and uploading are combined in one job, use a wrapper that saves the scan status, normalizes and uploads with independent diagnostics, then exits with the saved scan status. The uploader must not turn a failed lint, test, coverage-threshold, or complexity job into a pass.

### 5. Connect coverage and complexity reports

For GitLab's coverage view, configure the test tool to write XML and declare the real file as either Cobertura or JaCoCo. The format depends on the project. Lizard should write documented CSV or XML for the uploader; do not expect Lizard JSON.

Raw MegaLinter JSON is not native GitLab Code Quality output. If that widget is needed later, add a separate conversion step.

### 6. Run two test pipelines

Run one normal pipeline and check that all three quality jobs pass, artifacts exist, and OpenObserve shows the expected normalized run summaries. Then make one known lint error, run again, and confirm that GitLab fails the lint job while still saving its artifact and running `publish-quality`. Also confirm that an uploader failure cannot change that failed lint result into a pass.

## Copy/adapt CI sketch

This is a short sketch. Replace every `<...>` value with the repository's commands and paths. The current MegaLinter baseline is shown for validation; pin an approved exact version before making this a long-term pipeline.

```text
# .mega-linter.yml
ENABLE_LINTERS: [<LINTER_KEY>]
JSON_REPORTER: true
MARKDOWN_SUMMARY_REPORTER: true
APPLY_FIXES: none
CLEAR_REPORT_FOLDER: true
REPORT_OUTPUT_FOLDER: megalinter-reports

# .gitlab-ci.yml sketch
mega-linter:
  image: ghcr.io/oxsecurity/megalinter:v10
  script: ["true"]
  artifacts: { when: always, paths: [megalinter-reports/] }

test-coverage:
  script: ["<project-test-command>"]
  artifacts:
    when: always
    paths: [<coverage-report-dir>/]
    reports:
      junit: <junit-xml-path>
      coverage_report: { coverage_format: <cobertura-or-jacoco>, path: <coverage-xml-path> }

complexity:
  script: ["<lizard-command-writing-csv-or-xml>"]
  artifacts: { when: always, paths: [<complexity-report-dir>/] }

publish-quality:
  needs:
    - job: mega-linter
      artifacts: true
    - job: test-coverage
      artifacts: true
    - job: complexity
      artifacts: true
  when: always
  allow_failure: true
  script: ["<repository-owned normalizer/upload command for this repository's report formats>"]

# OpenObserve _json request body: a JSON array of normalized records.
# The uploader emits a run summary plus applicable producer records:
# quality_run, coverage_run when coverage ran, and complexity_run when
# complexity ran. quality_findings is optional/deferred for this MVP.
```

The `needs` entries make artifact downloads explicit in the adapted GitLab file. Do not rely on files left behind by another job. Replace the placeholder uploader with repository-owned code that knows these report formats and maps their available measurements into the normalized contract; do not pretend that one parser works for every repository. Preserve the `_json` array shape. Emit a `quality_run` summary for the run, plus a separate `coverage_run` and/or `complexity_run` for each applicable producer; never collapse those producer measurements into one `quality_run` object.

For every emitted record, `job_id` identifies the source producer job, not the uploader job. For each `coverage_run` or `complexity_run`, the uploader must preserve the canonical identity, scope, and outcome contract: include the shared run metadata; identify the language, module, tool, tool version, report format, and metric type; and include status, threshold, duration, normalizer version, and timestamp. Coverage records use canonical fields such as `line_percent`; complexity records use fields such as `max_complexity`. See the [canonical ingestion and metadata contract](../quality-tooling/openobserve-megalinter.md#openobserve-ingestion-and-metadata-contract) for the complete field requirements.

## What OpenObserve receives

Send a JSON **array** of normalized records for the run. The `_json` body must be an array, not a single object or newline-delimited payload. Emit a `quality_run` summary and the applicable producer-specific `coverage_run` and `complexity_run` records; this guide does not require an exact record count. At minimum, carry the canonical correlation metadata: `event_type`, `schema_version`, `run_id`, repository/project and owning team, commit SHA, ref, change identifier when applicable, pipeline/job identity, CI URL, `normalizer_version`, the MegaLinter image/action reference, `_timestamp`, `status`, and the relevant summary measurements.

Relevant MVP measurements can include lint error counts, coverage percentage, complexity values, duration, status counts, and whether the upload is complete or partial. Coverage and complexity records must also carry their canonical scope and outcome fields, including `mr_iid` when applicable, `line_percent` for coverage, and `max_complexity` for complexity. Detailed `quality_findings` records are optional and deferred; if added later, they should carry the canonical linter, rule, severity, message, path, location, fixability, and fingerprint metadata. Keep raw reports in GitLab artifacts and do not upload source contents, secrets, full diffs, or unredacted command output.

## MVP done checklist

- [ ] The three GitLab jobs run and GitLab owns their pass/fail results.
- [ ] Each job saves its report files after both successful and failed runs.
- [ ] GitLab shows the coverage XML when the declared Cobertura or JaCoCo file is valid.
- [ ] OpenObserve shows the expected normalized run summaries for a successful pipeline.
- [ ] A known bad lint change fails GitLab and leaves a lint artifact.
- [ ] An uploader failure does not turn a failed lint, test, or complexity job into a pass.

## When to add more

When this MVP is useful, use the [canonical guide](../quality-tooling/openobserve-megalinter.md) for the next operating decisions.

## Related links

- [Canonical OpenObserve + MegaLinter guide](../quality-tooling/openobserve-megalinter.md)
- [Evidence sources](../quality-tooling/details/openobserve-megalinter-sources.md)
- [Maturity and rollout](../quality-tooling/maturity-and-rollout.md)
- [CI/CD principles](../project-lifecycle/automation-cicd-deployment.md)
