# OpenObserve + MegaLinter Evidence Sources

> **Source map for:** [OpenObserve + MegaLinter](../openobserve-megalinter.md). Checked 2026-08-10.

This leaf holds the complete official citation inventory so the canonical page can keep evidence close to claims without carrying a long source list.

## Licensing, editions, and operating model

### OpenObserve

- [OpenObserve repository](https://github.com/openobserve/openobserve) — OSS platform, self-hosting, OSS/Enterprise distinction, SQL, dashboards, and license summary.
- [OpenObserve AGPL-3.0 license](https://raw.githubusercontent.com/openobserve/openobserve/main/LICENSE) — license obligations and terms.
- [OpenObserve downloads and editions](https://openobserve.ai/downloads/) — current edition and capability boundaries; use this rather than inferring OSS runtime or feature requirements from a sample.

### MegaLinter

- [MegaLinter repository](https://github.com/oxsecurity/megalinter) — project scope and distribution.
- [MegaLinter AGPL-3.0 license](https://raw.githubusercontent.com/oxsecurity/megalinter/main/LICENSE) — license obligations and terms.
- [MegaLinter latest documentation](https://megalinter.io/latest/) — open-source/free-for-all-uses statement, supported linter families, and CI positioning.
- [MegaLinter version guidance](https://megalinter.io/latest/install-version/) — current GHCR/version guidance.

## OpenObserve deployment, identity, and operations

- [OpenObserve getting started](https://openobserve.ai/docs/getting-started/) — self-hosted quickstart boundaries, initial identity bootstrap, and the warning that HA needs a separate deployment path.
- [OpenObserve architecture and deployment modes](https://openobserve.ai/docs/architecture/) — single-node versus HA shape, storage durability, and component responsibilities.
- [OpenObserve HA deployment](https://openobserve.ai/docs/administration/deployment/ha-deployment/) — Kubernetes/Helm, object-storage, metadata-store, and NATS prerequisites; use for production planning, not as a provider-specific manifest here.
- [OpenObserve storage management](https://openobserve.ai/docs/administration/maintenance/storage-management/) and [storage configuration](https://openobserve.ai/docs/administration/maintenance/storage-management/storage/) — stream-data and metadata storage choices, object-storage configuration, and production metadata guidance.
- [OpenObserve organizations](https://openobserve.ai/docs/user-guide/account-administration/identity-and-access-management/organizations/) — organization identifiers, provisioning behavior, access boundaries, and the version-sensitive auto-creation setting.
- [OpenObserve service accounts](https://openobserve.ai/docs/user-guide/account-administration/identity-and-access-management/service-accounts/) — non-human API identity, role assignment, token handling, rotation, and edition boundaries.
- [OpenObserve ingestion tokens](https://openobserve.ai/docs/user-guide/account-administration/identity-and-access-management/ingestion-tokens/) — organization-scoped ingestion-only credentials, one-time display, enable/disable behavior, and endpoint usage.
- [OpenObserve stream details and schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/stream-details/) and [schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/schema-settings/) — retention, inferred fields, index choices, and schema-change cautions; [extended retention](https://openobserve.ai/docs/user-guide/data-processing/streams/extended-retention/) covers deliberate incident-range retention.
- [OpenObserve monitoring and `/metrics`](https://openobserve.ai/docs/administration/maintenance/expose-metrics/) — enabling and scraping the Prometheus-format internal metrics endpoint.
- [OpenObserve operator guide and recovery CLI](https://openobserve.ai/docs/administration/maintenance/operator-guide/cli-commands/) — operational ownership, dry-run/destructive command cautions, and file-list recovery paths.
- [OpenObserve releases](https://openobserve.ai/docs/releases/) — stable binary/container release locations used for version and pin review.

## OpenObserve platform and ingestion claims

- [JSON log ingestion](https://openobserve.ai/docs/reference/api/ingestion/logs/json/) — `_json` endpoint, JSON-array request shape, timestamp handling, flattening, and field limits.
- [Stream schema settings](https://openobserve.ai/docs/user-guide/data-processing/streams/schema-settings/) — configurable stream schema and indexing settings.
- [Data type and index type in streams](https://openobserve.ai/docs/user-guide/data-processing/streams/data-type-and-index-type-in-streams/) — supported data/index type choices; supports the caveat that not every field is automatically indexed in the same way.
- [SQL reference](https://openobserve.ai/docs/reference/sql-reference/) — SQL query capabilities and configured-index behavior.
- [Dashboards in OpenObserve](https://openobserve.ai/docs/user-guide/analytics/dashboards/dashboards-in-openobserve/) — dashboards, panels, charts, and historical/real-time visualization.

## MegaLinter CI, reports, and failure-path claims

- [GitLab CI installation](https://megalinter.io/latest/install-gitlab/) — current GHCR image, documented `script: ["true"]`, entrypoint fallback, workspace, and artifacts.
- [Activation/deactivation](https://megalinter.io/latest/config-activation/) — descriptor and linter-key semantics, including `ENABLE_LINTERS`.
- [Common variables](https://megalinter.io/latest/config-variables/) — `CLEAR_REPORT_FOLDER`, `APPLY_FIXES`, report folder, and related variables.
- [Environment variable security](https://megalinter.io/latest/config-variables-security/) — secured environment-variable handling and output-sanitization considerations.
- [Apply fixes](https://megalinter.io/latest/config-apply-fixes/) — valid `APPLY_FIXES` values and operational cautions.
- [Reporters overview](https://megalinter.io/latest/reporters/) — available reporters and defaults.
- [API reporter](https://megalinter.io/latest/reporters/ApiReporter/) — MegaLinter's documented observability/API reporter option; still distinct from the team's OpenObserve normalization contract.
- [JSON reporter](https://megalinter.io/latest/reporters/JsonReporter/) — `JSON_REPORTER`, output file, and raw/full JSON report behavior.
- [Markdown Summary reporter](https://megalinter.io/latest/reporters/MarkdownSummaryReporter/) — `MARKDOWN_SUMMARY_REPORTER` and output behavior.

## Coverage and complexity boundaries

- [MegaLinter capability overview](https://megalinter.io/latest/) — lint/policy orchestration scope.
- [Supported-linter catalog](https://megalinter.io/latest/all_linters/) — catalog used to phrase the absence of documented native coverage or Lizard integration conservatively.
- [MegaLinter post-commands](https://megalinter.io/latest/config-postcommands/) — user command hook; not a native coverage integration.
- [Java PMD descriptor](https://megalinter.io/latest/descriptors/java_pmd/) · [JavaScript ESLint descriptor](https://megalinter.io/latest/descriptors/javascript_eslint/) · [Python Ruff descriptor](https://megalinter.io/latest/descriptors/python_ruff/) — language-specific complexity findings exposed through underlying linters.
- [PMD cyclomatic complexity](https://pmd.github.io/pmd/pmd_rules_java_design.html#cyclomaticcomplexity) · [ESLint complexity](https://eslint.org/docs/latest/rules/complexity) · [Ruff complex structure](https://docs.astral.sh/ruff/rules/complex-structure/) — different tool/language complexity semantics.
- [Lizard README and options](https://github.com/terryyin/lizard#options) — documented CSV/XML/Checkstyle output, threshold options, warning exit behavior, and parser limitations; example dedicated producer, not documented as bundled with MegaLinter.
- [JaCoCo](https://www.jacoco.org/jacoco/trunk/doc/) · [Coverlet](https://github.com/coverlet-coverage/coverlet) · [Istanbul](https://istanbul.js.org/) · [Jest coverage](https://jestjs.io/docs/configuration#collectcoverage-boolean) · [pytest-cov](https://pytest-cov.readthedocs.io/en/latest/) · [Coverage.py](https://coverage.readthedocs.io/) — native stack coverage producers.

## GitLab coverage, test reports, and failure behavior

- [GitLab coverage guidance](https://docs.gitlab.com/ci/testing/code_coverage/) — coverage collection and CI use.
- [Coverage visualization](https://docs.gitlab.com/ci/testing/code_coverage/coverage_visualization/) — MR/UI visualization behavior.
- [Coverage report artifact](https://docs.gitlab.com/ci/yaml/artifacts_reports/#artifactsreportscoverage_report) — supported coverage report artifact contract.
- [Unit-test reports](https://docs.gitlab.com/ci/testing/unit_test_reports/) — test report artifact/UI contract.
- [`after_script`](https://docs.gitlab.com/ci/yaml/#after_script) · [artifact reports](https://docs.gitlab.com/ci/yaml/artifacts_reports/) — failure-path execution and report upload ordering.
- [GitLab jobs](https://docs.gitlab.com/ci/jobs/) — job execution and status boundaries.
- [GitLab CI/CD variables](https://docs.gitlab.com/ci/variables/) — masked/protected variable storage and use.
- [`needs`](https://docs.gitlab.com/ci/yaml/needs/) · [`dependencies`](https://docs.gitlab.com/ci/yaml/#dependencies) — explicit job ordering and artifact flow choices.
- [Protected branches and merge gates](https://docs.gitlab.com/user/project/repository/branches/protected/) — repository-side enforcement of required successful checks.

## OpenObserve metrics ingestion

- [JSON log ingestion](https://openobserve.ai/docs/reference/api/ingestion/logs/json/) — flat event-record ingestion for run details.
- [JSON metrics ingestion](https://openobserve.ai/docs/reference/api/ingestion/metrics/json/) — metric payload and label model only. **Repo-authored architecture recommendation:** keep labels low-cardinality and keep commit/pipeline/MR identifiers in event fields rather than metric labels.

## GitLab Code Quality interoperability

- [GitLab Code Quality](https://docs.gitlab.com/ci/testing/code_quality/) — required JSON-array artifact format, required finding fields, and the separate-transform model for tools without native output.

## Sonar semantic comparison claims

- [Quality gates](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates.md) — gate purpose and quality-policy enforcement.
- [New code](https://docs.sonarsource.com/sonarqube-community-build/user-guide/about-new-code.md) — new-code baseline and change-focused analysis.
- [Metrics definitions](https://docs.sonarsource.com/sonarqube-community-build/user-guide/code-metrics/metrics-definition.md) — coverage, duplication, and other metric definitions.
- [Quality profiles](https://docs.sonarsource.com/sonarqube-server/2025.2/quality-standards-administration/managing-quality-profiles.md) — centrally managed analyzer profiles.
- [Rules](https://docs.sonarsource.com/sonarqube-community-build/quality-standards-administration/managing-rules/rules.md) — rule management and activation concepts.
- [Issues solution overview](https://docs.sonarsource.com/sonarqube-community-build/user-guide/issues/solution-overview.md) — issue lifecycle and remediation concepts.
- [Pull-request analysis](https://docs.sonarsource.com/sonarqube-server/2026.1/discovering/code-analysis/pull-request-analysis.md) — pull-request analysis and ALM integration context.
- [Security hotspots](https://docs.sonarsource.com/sonarqube-server/2026.2/user-guide/security-hotspots.md) — security-hotspot review workflow.
