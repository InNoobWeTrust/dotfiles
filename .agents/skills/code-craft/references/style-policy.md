# Consistent code style

Resolve style once for a coding unit and reuse it across producers and reviewers. This is an inline part of the existing handoff, not a new phase, document or permission to reformat a repository.

## Resolve before choosing a default

1. **Honor the project:** Inspect applicable user/project requirements, formatter scripts, pinned tools, configuration and CI. Preserve compatible established choices, including Black, Biome and project-specific profiles; clarify conflicting explicit policy/configuration rather than silently choosing one.
2. **Resolve effective configuration:** Record the actual command, working directory/workspace, configuration paths and effective options. Configuration discovery is tool-specific, not always nearest-file-wins; editor settings, syntax/edition and target versions can matter.
3. **Use local precedent:** With no applicable tool/policy, follow consistent surrounding conventions for a bounded existing-code edit. Do not introduce a greenfield profile as unrelated cleanup.
4. **Select a greenfield profile once:** The four core defaults live in the [language references](languages/README.md). For another supported language, the caller supplies a resolved source-backed style record or project policy as runtime input; do not require a sibling skill, invent a competing default, or claim style verified when that input is missing.

## Carry the same contract

**Style input:** profile and applicable guide scope; formatter/version; check command and cwd; effective configuration/options; syntax/dialect/edition/target version; affected files; exceptions and manual/unverified checks. Keep it in the existing task/handoff and preserve it on worker replacement; reviewers receive the same record.

**Formatting is not the whole guide.** Prefer the selected opinionated formatter for layout, quotes and wrapping; check naming, API, documentation and other applicable conventions separately. Declare deliberate differences between formatter defaults and a prose guide, rather than claiming complete guide compliance or repeatedly overriding the formatter.

**Scope and availability:** Format only authorized affected files. Use existing non-mutating checks for verification; a tool that only rewrites needs separately authorized scratch/diff handling, not a reviewer write to user files. No installation, auto-download, toolchain/config change or competing formatter is authorized by this reference; unavailable tools, unsupported syntax/plugins or unresolved options are reported as unverified, not a fabricated pass.

**Prototype:** Added 2026-10-28; reassess after 1–2 real uses. Source-backed defaults and a shared contract do not by themselves prove consistent subagent output.
