---
metadata:
  prototype-added: "2026-10-24"
  prototype-validation: |-
    The previous starter and this style block both compiled as two-page synthetic CV plus technical/product-note specimens with Typst 0.15.1; rendered pages and extracted text were inspected. An intentionally absent font still produced a PDF with a warning, confirming the need for checks beyond exit status; these tests do not establish that the new style is universally better or that less capable models will follow it.
  maintenance-review: |-
    No real-user CV, non-Latin typography, complex scientific specimen, external template runtime, publisher acceptance or model comparison was validated. After the next 1–2 real document uses, check whether the spacing controls and feedback loop prevented the reported errors before claiming effectiveness.
  aci-review: |-
    Result: PASS WITH GAPS — inputs, distinct controls, examples and blocked-rendering behavior are explicit; model-following and broader document outcomes remain unverified.
    Main risks: Confusing leading with baseline spacing, overriding a template, silent font substitution and treating compilation as visual approval.
    Interface upgrades: Just-in-time router, searchable template catalog, conditional heuristics, scoped settings and final-revision rendered checks.
---

# Typography and Spacing

For agents laying out paginated documents in Typst, especially when a model tends to fix density with arbitrary spacing. Use this reference to choose controls and inspect results, not to redesign the document's content or override a required template.

## Establish the system before adjusting gaps

1. **Respect the contract:** Confirm paper/screen use, page size, language/script, reader needs, required template and actual page limit. A scientific venue, company style or accessible-format requirement takes priority over generic heuristics; do not assume every CV must fit one page.
2. **Start with a suitable template:** Use [Template selection](template-selection.md); retain its font and spacing defaults initially. A font substitution changes apparent size, wrapping and line metrics, not merely appearance.
3. **Choose body text first:** Establish font family, size and line measure (the width of a text column), then line spacing, paragraph/list spacing and heading hierarchy. Give code, captions, tables and footnotes explicit roles rather than shrinking everything together.
4. **Centralize decisions:** Keep a small named style block in the main source or existing template configuration. Change one relevant control, rebuild and compare; do not scatter corrective `v()` calls through content.

**Conditional starting points, not compliance rules:** Butterick's practitioner guidance suggests 10–12 pt body text, baseline-to-baseline line spacing of 120–145% of font size, and roughly 45–90 characters per line for ordinary Latin prose. Wisconsin's résumé guidance independently supports 10–12 pt and consistent whitespace, but these ranges do not establish suitability for slides, equations, narrow journal columns, non-Latin scripts or readers needing larger type.

**Never translate that percentage directly into `par.leading`.** In Typst, the gap is measured from the bottom text edge of one line to the top edge of the next; baseline distance also depends on text edges and line contents. Keep the template/default leading initially and inspect several wrapped lines with the intended font; do not assume `leading: 1.4em` means “140% line height.”

## Match the symptom to the control

| Symptom or intent | Typst control | Guardrail |
|---|---|---|
| Lines inside one paragraph are too close/far apart | `par(leading: ...)` | An edge gap, not CSS `line-height` or a word processor's spacing multiple; font/text-edge changes affect the result |
| Paragraphs merge or look unrelated | `par(spacing: ...)`, `first-line-indent` | Usually choose paragraph space **or** first-line indentation as the primary paragraph signal; do not insert repeated empty lines |
| A deliberate new line within one paragraph | `linebreak()` or `\` followed by whitespace | Not a paragraph break; repeated breaks manufacture empty lines instead of semantic spacing |
| List items need separation, but wrapped item lines look fine | `list(spacing: ...)`; corresponding numbered-list settings | Distinguish item gaps from `par.leading`; blank lines in list markup create loose lists, affecting their default spacing |
| Heading or block has the wrong surrounding gap | Scoped `block(above: ..., below: ...)` rules | Adjacent block gaps collapse rather than necessarily add; inspect the rendered gap before compensating |
| Letters look too loose/tight | `text(tracking: ...)` | Character spacing; normally leave ordinary body text at its default, not a density control |
| Words, not letters, look too loose/tight | `text(spacing: ...)`, paragraph justification | Word-space width is separate from tracking; justified text can stretch spaces, so inspect the whole paragraph |
| A particular letter pair looks wrong | `text(kerning: ...)` and the chosen font | Kerning is pair-specific; normally retain it, rather than simulating it with global tracking |
| Dates or labels drift when a title wraps | `grid`, alignment and column sizing | Use real columns/gutters, not repeated spaces or manual line breaks; use `table` for semantically tabular data |
| Content overflows or one extra page appears | Content scope, column width, template/page settings | Diagnose the cause; do not start with negative tracking, tiny type, negative gaps or a scaled-down page |

**Spacing interactions:** Typst's default `par.leading` is `0.65em`; `par.spacing` defaults to `1.2em`. Tight lists default to leading-based item spacing, loose lists to paragraph-based spacing; explicit item spacing and surrounding block gaps are separate controls.

**Tracking exceptions are local:** Slightly opening short all-capital or small-capital labels can help in some Latin faces; Butterick gives 0.05–0.12 em as a starting range. This is not a body-text preset, and it must not be applied indiscriminately to scripts with joining behavior; paragraph justification's tracking adjustments are a separate mechanism from a deliberate `text.tracking` style.

## A small style block, not a universal preset

The example below was compiled with Typst 0.15.1 using an available Libertinus Serif font. Its numbers are illustrative choices for a synthetic CV/report specimen, not validated settings for every document; discover fonts with `typst fonts` and use an appropriate available face, never silently substitute one to claim the intended layout was checked.

```typst
#let rhythm = (
  body: 11pt,
  leading: 0.65em,
  paragraph: 0.7em,
  item: 0.3em,
  section: 1.2em,
)
#set text(font: "Libertinus Serif", lang: "en",
          size: rhythm.body, tracking: 0pt, kerning: true)
#set par(leading: rhythm.leading, spacing: rhythm.paragraph,
         first-line-indent: 0pt)
#set list(spacing: rhythm.item)
#show heading: set block(above: rhythm.section, below: 0.5em)
```

**Scope matters:** Set/show rules apply within their enclosing scope, not magically across unrelated files or nested template transformations. Prefer a template's public configuration and scoped show-set rules; do not paste this block over an established template and assume its internal rules will yield.

For an entry with a date, give the text room to wrap independently:

```typst
#grid(
  columns: (1fr, auto),
  column-gutter: 1em,
  [A long role or project title that may wrap],
  [2024–2026],
)
```

Use a semantic `table` for related row/column data instead of a layout grid. Neither visually correct columns nor selectable PDF text proves assistive-technology or applicant-tracking reading order.

## Verify and correct

1. **Build a representative specimen:** Include a long title beside dates, wrapped body paragraphs, multi-line list items, heading transitions and the document's hardest real material: tables/code for a technical report, figures/equations/citations for a paper. Test the intended language and glyphs; a Latin sample does not validate another script.
2. **Compile and read warnings:** Use the existing build path from [Typst workflow](typst-workflow.md). A successful exit can still accompany an unknown-font warning; missing glyphs can also require visual detection, so neither exit status nor silence proves font correctness.
3. **Inspect the final PDF:** Check every page at readable size and as page thumbnails: no collisions/clipping, irregular gaps, crowded lines, missing glyphs, detached headings/captions or unexpected blank pages. Check long labels, column gutters, lists, page breaks and actual font usage; a text extraction check complements but cannot replace visual inspection.
4. **Fix the responsible layer:** Correct template parameters or the shared style before patching individual paragraphs. If content truly exceeds the agreed space, discuss prioritization or permitted pagination instead of deleting meaning or compressing type to force a fit.
5. **Recheck boundaries:** Try a longer label, a near-page-break section and the actual dependency/font environment. Rebuild and reinspect after each source, font, layout or asset change; when rendering is unavailable, report visual verification as blocked rather than approved.

## Sources and scope

- **Typst semantics:** Official [paragraph](https://typst.app/docs/reference/model/par/), [text](https://typst.app/docs/reference/text/text/), [line break](https://typst.app/docs/reference/text/linebreak/), [lists](https://typst.app/docs/reference/model/list/), [blocks](https://typst.app/docs/reference/layout/block/), [grid](https://typst.app/docs/reference/layout/grid/), [table](https://typst.app/docs/reference/model/table/) and [styling](https://typst.app/docs/reference/styling/) references establish controls, not aesthetic approval.
- **Practitioner heuristics:** Matthew Butterick's [typography in ten minutes](https://practicaltypography.com/typography-in-ten-minutes.html), [line spacing](https://practicaltypography.com/line-spacing.html), [letterspacing](https://practicaltypography.com/letterspacing.html) and [paragraph spacing](https://practicaltypography.com/space-between-paragraphs.html) supply conditional print advice, not universal standards or Typst-specific values.
- **Independent résumé context:** University of Wisconsin–Madison's [résumé guidance](https://careercenter.education.wisc.edu/prepare-apply/resume/) emphasizes readable type, consistency and whitespace; page count depends on context/experience. This does not validate academic CV conventions or ATS behavior.
