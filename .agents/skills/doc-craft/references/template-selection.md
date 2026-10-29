---
metadata:
  catalog-snapshot: "2026-10-24"
  validation-history: "The eight catalog entries were inspected at their linked source/metadata pages. No external package was downloaded or compiled as part of this catalog, and no publisher, ATS or recipient acceptance was tested."
---

# Select a Document Template

For an agent choosing a document structure or page-layout starting point. The output is one suitable candidate with its version, requirements, limitations and check status—not a claim that attractive preview pages prove usability.

Use the searchable [document template catalog](../assets/document-templates.csv), resolving it relative to this reference. Keep alternatives and their metadata in that CSV rather than maintaining a second comparison table here.

## Select by fit, not appearance

1. **Check the destination:** Identify document type, audience, native consumer format, language, page size/limits and required publisher/company/institution template. Preserve a suitable existing template; follow [Document format selection](document-formats.md), not a blanket conversion to Typst.
2. **Separate structure from styling:** A PRD outline identifies content questions; a report theme controls typography and pagination. Product, architecture and scientific content must come from its authoritative owner/source; do not use a template to settle missing requirements or research claims.
3. **Retrieve a few candidates:** Query `document_types` and `resource_type` in the CSV with an available CSV-aware tool; inspect at most a few matching rows first. Plain-text search is a fallback for discovery, not a CSV parser; do not install tools or load the whole catalog into every writing task.
4. **Inspect the exact candidate:** Open its source page for current release, license, compiler compatibility, fonts, package dependencies and configuration. Versions in the catalog are inspected snapshots, not “latest forever”; pin the selected package version in the document.
5. **Try before adopting:** When acquisition is authorized and dependencies are available, compile the smallest official example, then test representative real content with [Typography and spacing](typography.md). Otherwise return the candidate as metadata-only, name the missing check and stop short of claiming it is ready.

**Catalog coverage:** Short technical reports/manuals and product PDF layout; long nonfiction reports/books; IEEE-style scientific papers; résumés; slides; letters; architecture structure; product requirements structure. A resource can serve more than one type, but neither a cover page nor a PRD outline is a complete product-document system.

**Product-document path:** The catalog includes Atlassian's public PRD walkthrough as a content-structure reference, not a native Typst theme or freely redistributable template. If an approved PRD needs PDF delivery, a neutral report layout such as `basic-report` compact mode is a candidate for its presentation; retain the approved sections and native source if required, and verify the resulting layout.

**Scientific-document path:** Use the actual venue's current instructions first. `charged-ieee` is an IEEE-style candidate, not evidence that IEEE or a particular conference accepts the output; do not generalize its two-column format to all scientific papers or theses.

## Adoption and failure contract

- **Dependencies:** A template name/import is not proof its packages or fonts are locally available. Follow the bounded acquisition rules in [Typst workflow](typst-workflow.md); missing access is a blocker, not installation or upload authorization.
- **Font changes:** Preserve defaults initially, then recheck line measure, leading, tables and pagination after substitutions. `basic-report` explicitly warns that its spacing is tuned to Vollkorn; changing to a “similar” face is not a cosmetic-only edit.
- **License and reuse:** Verify the license for the exact package, included examples and fonts. A linked proprietary preview is not permission to copy or redistribute its content; the catalog is a set of pointers, not a vendored template pack.
- **Accessibility and extraction:** Check heading semantics, PDF reading order, text extraction and the actual target workflow. Resume authors' ATS-friendly claims and compiler tagging are not independent certification.
- **No fitting tricks:** Do not rewrite substantive claims, shrink body type indiscriminately or use negative spacing/tracking to imitate a screenshot or force a page count. Fix the relevant layout layer or return an unresolved content/space trade-off to its owner.

## Verification limits

`source-inspected;not-compiled` means precisely that, not recommended-for-production or tested with the recipient's content. For non-Typst structure resources, compilation is not applicable and native workflow usability remains unchecked.

Keep these limits when handing off a selection; record actual adoption/build/render observations separately rather than upgrading all candidates after one template succeeds.
