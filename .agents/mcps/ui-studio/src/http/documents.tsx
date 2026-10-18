/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "hono@4.13.13/jsx"

type DocumentProps = { base: string; nonce: string; catalogID: string }
type HostProps = DocumentProps & { title: string }
type FrameProps = DocumentProps & { source: string | null; channel: string; frameJS: string }

const frameCSS = ":root{color-scheme:only light}body{margin:0;background:var(--cds-background);color:var(--cds-text-primary)} @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}"
const safeJSON = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c")

/** Read-only discovery envelope; capability links and all caller text use escaped JSX. */
export function DashboardDocument({ boards }: { boards: ReadonlyArray<{
  session_id: string; token: string; title: string; chat_label?: string; acquired_at: number; current_revision: number
}> }) {
  return <html lang="en" data-studio="" data-theme="system"><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Boards · UI Studio</title><link rel="stylesheet" href="/dashboard.css" />
  </head><body class="dashboard">
    <main class="dashboard-main">
      <header class="dashboard-heading"><div><h1 class="empty-title">UI Studio boards</h1><p>Active boards in this MCP process. Refresh to see changes.</p></div>
        <a class="cds--btn cds--btn--tertiary" href="/">Refresh</a>
      </header>
      <section class="dashboard-list" aria-label="Active boards">
        {boards.length === 0 ? <div class="cds--tile"><h2>No active boards</h2><p>Ask your agent to acquire a board, then refresh this page.</p></div> : boards.map((board) => {
          const acquired = new Date(board.acquired_at).toISOString()
          return <article class="cds--tile dashboard-board" aria-labelledby={`board-${board.session_id}`}>
            <div class="dashboard-details"><h2 id={`board-${board.session_id}`}>{board.title}</h2>
              {board.chat_label ? <p>{board.chat_label}</p> : null}
              <p><span title={board.session_id} aria-label={`Board ID ${board.session_id}`}>Board {board.session_id.slice(0, 8)}</span> · Revision {board.current_revision}</p>
              <p>Acquired <time datetime={acquired}>{acquired}</time></p>
            </div>
            <a class="cds--btn cds--btn--primary" href={`/board/${board.token}`} aria-label={`Open board: ${board.title} (${board.session_id})`}>Open board</a>
          </article>
        })}
      </section>
    </main>
  </body></html>
}

/** Request-time host envelope; session text is escaped by Hono JSX, never raw HTML. */
export function HostDocument({ base, nonce, catalogID, title }: HostProps) {
  return <html lang="en" data-studio="" data-theme="system"><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title} · UI Studio</title>
    <link rel="stylesheet" href={`${base}/bundle.css`} />
    <link rel="stylesheet" href={`${base}/browser.css`} />
  </head><body data-catalog-version={catalogID}>
    <header class="studio-header">
      <button class="cds--btn cds--btn--ghost cds--btn--icon-only" id="history-toggle" type="button" aria-controls="revision-sidebar" aria-expanded="false" aria-label="Toggle revision history"><svg class="cds--btn__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" /><path d="M9 3v18M5 8h2m-2 4h2" fill="none" /></svg></button>
      <div class="studio-identity">
        <div class="title-line"><h1 id="title">{title}</h1><p id="visible">Waiting for agent draft</p></div>
        <div class="session-meta"><p id="status" role="status">Initializing browser catalog…</p><p id="badge" role="status">Following latest · waiting</p></div>
      </div>
      <div class="theme-picker cds--form-item">
        <div class="cds--select cds--select--inline cds--select--lg cds--layout--size-lg">
          <label class="cds--label" for="theme-mode">Theme</label>
          <div class="cds--select-input--inline__wrapper"><div class="cds--select-input__wrapper">
            <select class="cds--select-input" id="theme-mode"><option value="system" selected>System</option><option value="light">Light</option><option value="dark">Dark</option></select>
            <svg class="cds--select__arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M8 11 3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z" /></svg>
          </div></div>
        </div>
      </div>
    </header>
    <main>
      <aside id="revision-sidebar" aria-labelledby="history-heading" hidden>
        <div class="history-heading"><h2 id="history-heading">Revisions</h2><button class="cds--btn cds--btn--ghost cds--btn--icon-only" id="history-close" type="button" aria-label="Close revision history"><svg class="cds--btn__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M6 18 18 6" fill="none" /></svg></button></div>
        <div class="revision-picker cds--form-item"><div class="cds--select cds--select--lg cds--layout--size-lg">
          <label class="cds--label" for="revisions">Displayed revision</label>
          <div class="cds--select-input__wrapper">
            <select class="cds--select-input" id="revisions" disabled><option value="latest">Follow latest</option></select>
            <svg class="cds--select__arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M8 11 3 6 3.7 5.3 8 9.6 12.3 5.3 13 6z" /></svg>
          </div>
        </div></div>
        <ol id="revision-notes" aria-label="Published revision notes"><li>No published revisions yet.</li></ol>
        <p class="history-note">Discuss changes in the agent conversation. Interactions are mock-only; browser observations are advisory, not approval.</p>
        <p class="history-note">Owned by the MCP connection until release or server shutdown. Closing this tab does not release the session.</p>
      </aside>
      <section class="stage" aria-label="Draft preview">
        <p id="report-status" role="status" aria-live="polite" data-error="true" hidden></p>
        <div class="stage-body">
          <div id="empty-state">
            <svg class="empty-icon" aria-hidden="true" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="10" width="48" height="44" rx="6" /><path d="M8 22h48M38 22v32M17 32h12m-12 7h8m21-7h2m-2 7h2" /><path d="M17 16h2m4 0h2" /></svg>
            <p class="eyebrow">Your review workspace</p><h3 class="empty-title">Waiting for the first draft</h3>
            <p class="empty-copy">The agent’s next published design will appear here. Keep this tab open while the preview catalog initializes.</p>
          </div>
          <div id="preview" data-state="waiting"></div>
        </div>
      </section>
    </main>
    <script nonce={nonce} src={`${base}/browser.js`}></script>
  </body></html>
}

/** Only trusted static frame code and '<'-escaped JSON enter the raw script node. */
export function FrameDocument({ base, nonce, catalogID, source, channel, frameJS }: FrameProps) {
  const config = { source, channel, catalog_id: catalogID }
  return <html lang="en" data-carbon-theme="white"><head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="stylesheet" href={`${base}/bundle.css`} />
    <style nonce={nonce} dangerouslySetInnerHTML={{ __html: frameCSS }}></style>
  </head><body>
    <p id="notice" role="status">Loading OpenUI…</p><div id="root"></div>
    <script nonce={nonce} src={`${base}/bundle.js`}></script>
    <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `const config=${safeJSON(config)};\n${frameJS}` }}></script>
  </body></html>
}
