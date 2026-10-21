# Fleet Benchmark Evidence

> **Who this is for:** maintainers of the agent fleet in `.agents/agents/` — reviewing a routing decision, adding or retiring an agent, or checking whether a model still earns its place.

Each agent file in `.agents/agents/` states only that agent's **role boundary**; descriptions carry no scores, prices or plan details, so dispatching a task never needs a benchmark lookup. The **evidence** behind those boundaries lives here, in the repository, outside the skills — a skill is reused and shared, while this record describes one fleet's configuration.

## Data

[`fleet-benchmarks.csv`](./fleet-benchmarks.csv) — one row per agent file, including retired agents.

| Column | Meaning |
|---|---|
| `agent_file` | File under `.agents/agents/` that routes to the model |
| `model_id` | Model identifier the agent points at |
| `provider_route` | Provider serving the model |
| `status` | `active` or `removed` |
| `bridgebench_overall`, `bridgebench_rank` | BridgeBench Overall rating and its rank in that snapshot |
| `asl_coding_pass_pct`, `asl_cost_per_1k_correct_usd` | AI Stupid Level coding pass rate and cost per 1,000 correct fixes |
| `price_in_per_mtok_usd`, `price_out_per_mtok_usd` | Public input/output price per million tokens |
| `other_benchmarks` | Task-specific scores (Terminal-Bench, Vibe Code, Code Migration, SWE-bench, MMMU Pro, BS Bench, Artificial Analysis, BenchLM, GDPval-AA) |
| `evidence_date` | Date the row was checked |
| `notes` | Provenance, version caveats, upgrade and drift history |

`unknown` means the review did not measure that value. It never means zero, and it never means weak.

## Reading the numbers

- **Benchmark versions are not comparable across rows.** Terminal-Bench 2.1 and Terminal-Bench 4.0 are different task suites; compare like with like, and check the version before quoting a number.
- **Model-level scores do not measure a configured effort variant or a rolling alias.** A `latest` alias can point at a different checkpoint than the one that was measured, and an effort variant is not the same model as its base entry.
- **Drift is a separate signal from a static leaderboard.** A model can hold its rank while its answer length, latency or cost per correct result changes under the same model id; post-launch power tracking and change-point alerts exist for that.
- **Absence of a score is not a verdict.** Route the task to a measured model when the task is consequential, and treat an unmeasured model as unmeasured.

## Refreshing the record

1. Re-check only the rows for models that changed; leave untouched rows and their `evidence_date` alone.
2. Record the exact checkpoint, benchmark version and source date next to each number, and mark missing metrics `unknown` rather than inferring them.
3. Add a row for every agent file added or removed, and keep retired rows with `status: removed` plus the reason.
4. Keep the record in the repository, not inside a skill: the catalog describes one deployment, while skills stay portable and self-contained.
