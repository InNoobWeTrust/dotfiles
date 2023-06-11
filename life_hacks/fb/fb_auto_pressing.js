Object.defineProperty(Array.prototype, "sample", {
  value: function () {
    const idx = Math.floor(Math.random() * (this.length + 1));
    return [...this][idx];
  },
});

Object.defineProperty(NodeList.prototype, "sample", {
  value: function () {
    const idx = Math.floor(Math.random() * (this.length + 1));
    return [...this][idx];
  },
});

Object.defineProperty(NodeList.prototype, "find", {
  value: function (predicate) {
    return [...this].find(predicate);
  },
});

const $ = (selectors) => document.querySelector(selectors);
const $$ = (selectors) => document.querySelectorAll(selectors);

const REPORTS = {
  "Fake account": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fake account"
      ),
    () => $('div[role="dialog"] div[aria-label="Submit"][role="button"]'),
    () => $('div[role="dialog"] div[aria-label="Next"][role="button"]'),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Fake name": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fake name"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Posting inappropriate things": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Posting inappropriate things"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Harassment or bullying": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Harassment or bullying"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "I want to help => Suicide": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Suicide"
      ),
  ],
  "I want to help => Self-injury": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Self-injury"
      ),
  ],
  "I want to help => Harassment": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Harassment"
      ),
  ],
  "I want to help => Hacked": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Hacked"
      ),
  ],
  "I want to help => Hacked": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Hacked"
      ),
  ],
  "Something else": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Something else"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Hate speech": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Hate speech"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Nudity or sexual content": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Nudity or sexual content"
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]'
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  Violence: [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Violence"
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]'
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  Harassment: [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Harassment"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "It's someone else"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Unauthorised sales": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Unauthorised sales"
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]'
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Fraud or scam": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fraud or scam"
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Other"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Intellectual property": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Intellectual property"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "I can't access my account": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I can't access my account"
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
};

const timer = async (durationMs) => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const report = async (...clickProviders) => {
  // Open profile menu
  $('[aria-label="See Options"]')?.click();
  await timer(500);
  // Click report option
  $$('div[role="menuitem"]')
    ?.find((e) => e.innerText === "Find support or report")
    ?.click();
  await timer(1000);
  // Follow defined steps to report
  for (const clickProvider of clickProviders) {
    const target = clickProvider();
    if (!target) {
      // Click target not found, closing early
      $('div[aria-label="Close"]')?.click();
      await timer(500);
      return;
    }
    target.click();
    await timer(1000);
  }
  // Make sure to close the dialog on teardown
  $('div[aria-label="Close"]')?.click();
  await timer(500);
};

// Single entry point to nuke the asshole with all the FUDs
const reportAll = async () => {
  for (const [k, v] of Object.entries(REPORTS)) {
    console.debug(`Reporting for: ${k}`);
    await report(...v);
  }
  alert("Pressing asshole completed! Thanks for waiting comrade!");
};