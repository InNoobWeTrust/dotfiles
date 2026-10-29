---
metadata:
  prototype-added: "2026-10-28"
  review-after: "1–2 real uses"
  maintenance-review: "Prototype; reassess after 1–2 real uses. Catalog/link checks are source checks, not evidence of formatter execution or improved review outcomes."
---

# Review the agreed style, not a new preference

Use for code-style or formatter questions alongside the existing [core review](core-review.md) and [file rules](file-rules.md). Preserve their scope, severity, output and anti-noise gates; this is not another universal review stage.

## Resolve the source of truth

1. **Reuse the producer's contract:** Read the applicable original project/user policy and the supplied style record: profile/guide scope, formatter/version, actual check command/cwd, effective config/options, syntax/dialect/edition/target version, files and exceptions. Check that it matches the current project; do not silently substitute a preferred formatter.
2. **Check effective configuration:** Inspect project scripts, locks and configuration. Tool-specific command/workspace rules decide which settings apply, not a generic nearest-config assumption. Return material conflicts for resolution; do not relabel a stale configuration assumption as a code defect.
3. **Use the catalog selectively:** For an unconfigured project, retrieve only the matching family from [language-styles.csv](../assets/language-styles.csv) and relevant source material. A caller can supply that resolved record to another skill as runtime input; no sibling package is required to operate this bundle.

The catalog is a single mapping of the existing file-rule families plus the existing raw-SQL producer consumer, not a list of installed tools or new language-support claims. `rule_family` matches a rule filename stem; `sql` has no new glob, and `default` covers unidentified syntax. The `profile` identifies a greenfield lookup, not an override of project policy.

Both URL columns use **` | `** to separate multiple URLs; blank means no verified source/tool documentation selected. Rows explicitly distinguish official guidance, company/community conventions, tool-owned syntax layout and project-only/manual gaps; a syntax specification is not a semantic style standard.

## Check without style churn

- **Mechanical checks:** Use the agreed existing non-mutating command with its effective settings and relevant files. Record actual results and source/version limitations; unsupported syntax, missing plugins/tools or an unavailable check is **style unverified**, not success. Do not install, auto-download, write/fix user files or switch formatters to complete a review.
- **Semantic conventions:** Manually inspect applicable naming, API and documentation advice not enforced by the formatter. Do not infer correctness, security or full guide compliance from a format pass, or import company-specific build, architecture or language-version restrictions without a project decision.
- **No retrospective blockers:** Without an agreed style contract or applicable project rule, catalog guidance is advisory; disclose the missing contract and do not manufacture a blocking preference-only finding. Preserve existing Go/Python anti-style-noise rules. Attribute pre-existing formatting debt separately and keep ordinary review findings within the diff unless a wider audit is explicitly authorized.
- **Ambiguous syntax:** Resolve the actual language, not just its extension. Objective-C `.m` explicitly uses the `objc` record through the runtime contract despite the existing MATLAB extension route; ambiguous `.m` remains advisory. Reason `.re/.rei`, ArkTS, Vyper and templates require their own supported parser, not a superficially similar language's formatter.
