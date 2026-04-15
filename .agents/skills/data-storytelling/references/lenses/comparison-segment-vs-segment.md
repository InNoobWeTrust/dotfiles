# Lens: Comparison - Segment Vs Segment

## Purpose

Compare cohorts, regions, channels, plans, or customer types to reveal uneven performance.

## Best For

- Cohort analysis.
- Geo or channel performance reviews.
- Isolating where a top-line issue lives.

## Required Inputs

- Metric.
- Segment dimension.
- Optional time field.

## Questions Answered

- Which segments outperform or underperform?
- Is the top-line story hiding a concentrated issue?
- Which segment deserves the narrative lead?

## Method

1. Rank segments by the metric and segment size.
2. Compare absolute performance and contribution share.
3. Check whether segment mix shifts explain the top line.

## Output Contract

- `baseline_or_comparator`: <reported comparison segment, cohort set, or top-line reference used>
- `method_parameters`: <reported segment ranking logic, material size threshold, and any mix-adjustment rules used>
- Best and worst segments.
- Segment gap size.
- Segment contribution to the top-line move.
- Whether the issue is broad or concentrated.

## Caveats

- Small segments can look dramatic but have limited business impact.
- Always include segment size or share.
