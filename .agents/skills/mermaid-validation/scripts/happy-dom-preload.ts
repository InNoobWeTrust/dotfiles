/**
 * Bun preload module — registers happy-dom globals so that browser-dependent
 * libraries (e.g. mermaid, DOMPurify) work outside a real browser.
 *
 * Usage:  bun --preload "$SKILL_ROOT/scripts/happy-dom-preload.ts" <script.ts>
 * Resolve SKILL_ROOT from the actual loaded skill location, not the project root.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
