---
name: ui-ux
description: >
  Expert UI-UX skill for high-fidelity design systems, legacy modernization,
  and AI-powered workflows. MUST trigger for any request involving "Pro Max"
  aesthetics, Bento Grids, Glassmorphism, Neumorphism, design tokens, WCAG
  accessibility audits, or professional UI refactoring. Use this whenever the
  user wants a "modern", "futuristic", or "premium" look that goes beyond
  standard component libraries. Explicitly leverages curated industry data 
  for colors, typography, and UX patterns.

---

# UI-UX Expert Skill

A high-performance design companion for end-to-end UI/UX lifecycle management, from
conceptualization to modernization of legacy systems.

## Core Capabilities

- **New Project Architecting**: Establishing modern design systems, choosing stacks,
  and defining aesthetic directions (Glassmorphism, Bento, AI-Native, etc.).
- **Legacy Modernization**: Auditing existing UIs, identifying anti-patterns, and
  applying systematic upgrades to UX flows and visual styles.
- **AI-Powered Design Workflow**: Using LLM reasoning combined with curated design
  data to generate precise CSS, component structures, and interaction models.
- **Dynamic Source Tracking**: Automatically syncing with evolving design repositories
  to ensure guidance is always based on the latest industry standards.

## Methodology

### Step 1: Data Synchronization (Self-Evolving)
The skill uses a dynamic sync script to pull from multiple design data sources.
The script discovers new files and subdirectories automatically.

**Sync Command:**
```bash
bun run .agents/skills/ui-ux/scripts/sync_data.ts
```

### Step 2: Diagnostic & Local Cache Lookup
Before proposing any design, **you MUST query the local cache** (defined by `UI_UX_CACHE` environment variable or defaulting to `~/.cache/ui-ux-skill`) to find data-driven benchmarks.

**Priority Search Files (within the cache root):**
- `ui-ux-pro-max/colors.json`: Search for the specific "Product Type" to get WCAG-compliant palettes.
- `ui-ux-pro-max/styles.json`: Match the desired aesthetic (Bento, Glassmorphism, etc.) to its technical specs.
- `ui-ux-pro-max/ux-guidelines.json`: Check for "Best Practices" and "Anti-patterns" related to the component you are designing.
- `ui-ux-pro-max/typography.json`: Identify optimal font pairings and scaling for the industry.
- `ui-ux-pro-max/stacks/*.json`: Look up framework-specific best practices (e.g., `nextjs.json`, `shadcn.json`).

### Step 3: Diagnostic Phase (For Existing Projects)
- **UI Audit**: Analyze current screenshots, CSS, or component files.
- **Gap Analysis**: Compare current implementation against `ux-guidelines.json` and industry benchmarks found in Step 2.
- **Constraint Mapping**: Identify technical limitations of the current stack based on `stacks/*.json`.

### Step 4: Synthesis & Research
- **Pattern Matching**: Find "Pro Max" examples that fit the project's industry from the cache.
- **Web Augmentation**: Use web research ONLY if the cache doesn't have specific current trends or niche industry data.

### Step 5: AI-Driven Implementation
- **Aesthetic Transformation**: Propose a "before and after" for components using the discovered design tokens.
- **Design Tokens**: Generate a set of CSS variables or Tailwind configs strictly based on the `colors.json` and `typography.json` data.
- **Component Drafting**: Provide high-fidelity code for key UI elements.


## Rules

1. **Evolutionary Design**: Ensure designs are not just "modern" but adaptable.
2. **Context-Aware**: Respect the constraints of legacy code while pushing for
   modernization.
3. **Data-Augmented**: All design decisions should be backed by curated sources
   or verified research.
4. **Fidelity over Filler**: Provide production-ready CSS and precise specs, not
   vague advice.

## Resources

- **Cache Root**: Defined by `UI_UX_CACHE` (defaults to `~/.cache/ui-ux-skill`)
- **Sync Script**: `.agents/skills/ui-ux/scripts/sync_data.ts`
- **Active Sources**:
    - `ui-ux-pro-max`: Colors, Styles, UX Guidelines, Stacks, etc.
    - *Add new sources to `sync_data.ts` to extend the skill's knowledge base.*
