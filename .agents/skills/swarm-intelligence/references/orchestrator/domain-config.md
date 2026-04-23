# Domain Config Schema

Use this file only when you need to validate or understand a domain config.

## Required Keys

```text
phase1_a_label / phase1_a_persona / phase1_a_field
phase1_b_label / phase1_b_persona / phase1_b_field
phase2_forward_label / phase2_forward_persona
phase2_review_label  / phase2_review_persona
phase2_revise_label  / phase2_revise_persona
phase3_decompose_label / phase3_decompose_persona
phase3_maker_label     / phase3_maker_persona
phase3_maker_fix_label / phase3_maker_fix_persona
phase3_breaker_label   / phase3_breaker_persona
```

`phase3_breaker_persona` should use the `__QA_CASES__` placeholder. The orchestrator must replace this placeholder with the actual QA cases from the domain context before invoking the breaker node.

## Field Meanings

- `_label`: human-readable name for logs
- `_persona`: full instruction string passed to the node runner
- `_field`: top-level JSON key used when merging multi-model outputs for that persona

## Optional Metadata

```text
model_pool_refs = ["free", "premium"]
```

When resolved by the orchestrator, these become runtime lists such as
`free_model_pool` and `premium_model_pool`.

## Built-In Domains

- `code`
- `writing`
- `design`
- `pm`
- `slides`
- `skill-review`

## Source Of Truth

- Domain configs live in `references/domains/.../config.json`
- Model pools live in `references/models/*.json`
