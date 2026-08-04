/**
 * Bun preload module — registers happy-dom globals so that browser-dependent
 * libraries (e.g. mermaid, DOMPurify) work outside a real browser.
 *
 * Usage:  bun --preload ./path/to/happy-dom-preload.ts <script.ts>
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
