# Prompt: Data Profiler

## Objective

Establish what the dataset can and cannot support before lens planning begins.

## Inputs

- User-provided data reference or source description.
- Available schema, sample rows, metric list, or table descriptions.
- Approved analysis brief.

## Procedure

1. Identify the unit of analysis and reporting grain.
2. List candidate metrics, dimensions, timestamps, targets, and benchmarks.
3. Note data freshness, coverage window, and obvious missingness.
4. Check whether the data supports comparison, segmentation, trend, and threshold logic.
5. Flag issues that cap confidence or block specific lenses.

## Output Contract

```markdown
## Data Profile

- **Unit of analysis**: ...
- **Grain**: ...
- **Primary metrics**: ...
- **Available dimensions**: ...
- **Time coverage**: ...
- **Targets or benchmarks**: ...
- **Data quality risks**: ...
- **Supported lens families**: ...
- **Unsupported questions**: ...
```

## Guardrails

- Do not assume targets or benchmarks exist unless they were explicitly supplied.
- Call out when the data is too thin for root-cause or causal language.
- Keep the profile factual and short.
