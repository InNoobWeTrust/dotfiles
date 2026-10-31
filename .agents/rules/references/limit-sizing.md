<!-- Purpose: how to size timeouts, concurrency and resource limits. Read from execution-safety.md. -->
# Sizing Limits: Ceilings, Not Targets

Limits exist to stop **runaway growth**: infinite loops, hung processes, process/agent
proliferation, unbounded memory/disk/network use, spam. They do not exist to make normal work
cheap. A limit that a healthy, normal run can hit is a defect: it breaks the task and wastes
more resources through retries than it saves.

## Sizing method

1. **Estimate normal cost** from evidence: project CI timeouts, prior runs, tool docs, input
   size, or one small measured sample. Unknown → assume long, not short.
2. **Set the ceiling at roughly 3–10× the expected cost** (wall time, memory, disk, workers).
   Round up. Generous is the default; a ceiling only needs to catch genuine runaways.
3. **Prefer stall detection over a short wall-clock cap**: no output, CPU or file progress for a
   long idle window (several minutes) is a stronger hang signal than elapsed time.
4. **Concurrency**: default to the machine's real capacity (cores, free RAM) minus headroom for
   the user's own work. Do not default to 1–2 workers for work that parallelizes safely.

## Orders of magnitude (starting points, not mandates)

| Work | Reasonable ceiling |
|---|---|
| Quick read/search/lint/status | 1–5 min |
| Build, install, test suite, container pull | 15–60 min |
| Large scan, indexing, data processing, ML training/eval, long CI | 1–6 h or project-specific |
| Idle/stall window with no progress | 5–15 min |

Project-known timings override this table.

## When a limit is hit

- Inspect progress first. A job that is alive and progressing is **not** failing: extend once
  with a stated reason and a larger ceiling (≥2×), not the same value.
- Never retry with the same limit; never conclude "environment blocker" from a self-set limit.
- Hung/no-progress or growing without bound → stop it, clean up, diagnose.

## When to be strict

Tight, **measured** limits (CPU, RAM, PID, storage, network) are for recursive agents,
process trees, parallel fan-out, stress/unattended workloads. Measure real capacity; do not
guess low. Strictness applies to runaway-prone shapes, not to ordinary single commands.
