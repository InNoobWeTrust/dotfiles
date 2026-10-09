# Export And Embedding

## Deliverables

For each finished illustration, produce:

- editable source (SVG when tooling supports it, otherwise a structural illustration spec)
- embeddable raster when requested (PNG or JPEG) and when export tooling is available
- short alt text
- caption or placement note when needed

## Export rules

1. Keep the editable source as the canonical artifact.
2. Export raster at the size needed for the destination artifact.
3. Check the exported image for text collisions, cropped edges, contrast loss, and cropped captions/caveats.
4. Preserve captions or caveats required by visual QA when exporting to raster.
5. Delivered SVG must remain static: no scripts, `foreignObject`, event handlers, remote asset fetches, or external references.
6. If the destination is markdown and supports SVG or Mermaid poorly, embed the raster and keep the source nearby.
7. If raster export is unavailable, return the source/spec plus a clear note describing the missing export step rather than pretending the image is production-ready.

For the default Typst document destination, embed a local static SVG or PNG with native `image`/`figure`, meaningful alt text, and a caption. Follow [Typst workflow](../../doc-craft/references/typst-workflow.md#3-include-visuals-and-portable-references); keep editable source and verify the image in the final PDF. A validated Mermaid source still needs rendering before embedding.

## Placement notes

- Put the illustration near the claim it supports.
- Do not let the caption carry information the image should have carried visually.
- If the illustration is purely ornamental, remove it.
