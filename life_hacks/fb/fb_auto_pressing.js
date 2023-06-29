Object.defineProperty(Array.prototype, "sample", {
  value: function () {
    const idx = Math.floor(Math.random() * (this.length + 1));
    return [...this][idx];
  },
});

const $ = (selectors) => document.querySelector(selectors);
const $$ = (selectors) => [...document.querySelectorAll(selectors)];

const REPORTS = {
  "Fake account": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fake account",
      ),
    () => $('div[role="dialog"] div[aria-label="Submit"][role="button"]'),
    () => $('div[role="dialog"] div[aria-label="Next"][role="button"]'),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Fake name": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fake name",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Posting inappropriate things": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Posting inappropriate things",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Harassment or bullying": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Harassment or bullying",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "I want to help": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I want to help",
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]',
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Something else": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Something else",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Hate speech": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Hate speech",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Nudity or sexual content": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Nudity or sexual content",
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]',
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  Violence: [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Violence",
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]',
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  Harassment: [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Harassment",
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "It's someone else",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Unauthorised sales": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Unauthorised sales",
      ),
    () =>
      $$(
        'div[role="dialog"] div[role="listitem"] div[role="button"]',
      )?.sample(),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Fraud or scam": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Fraud or scam",
      ),
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Other",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "Intellectual property": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "Intellectual property",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
  "I can't access my account": [
    () =>
      $$('div[role="dialog"] div[role="listitem"] div[role="button"]')?.find(
        (e) => e.innerText === "I can't access my account",
      ),
    () => $('div[role="dialog"] div[aria-label="Done"][role="button"]'),
  ],
};

const delayClick = () =>
  1000 + 1000 * Math.random() + 500 * Math.random() + 250 * Math.random();

const timer = async (durationMs) => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const holdOn = async () => await timer(delayClick());

const listReportTypes = async () => {
  // Open profile menu
  $('div[aria-label="See Options"]')?.click();
  $('div[aria-label="See options"]')?.click();
  await holdOn();
  // Click report option
  $$('div[role="menuitem"]')
    ?.find((e) => e.innerText === "Find support or report")
    ?.click();
  await holdOn();
  const reportTypes = $$(
    'div[role="dialog"] div[role="listitem"] div[role="button"]',
  )?.map((e) => e.innerText);
  // Make sure to close the dialog on teardown
  $('div[aria-label="Close"]')?.click();
  return reportTypes;
};

const report = async (...clickProviders) => {
  // Open profile menu
  $('div[aria-label="See Options"]')?.click();
  $('[aria-label="See options"]')?.click();
  await holdOn();
  // Click report option
  $$('div[role="menuitem"]')
    ?.find((e) => e.innerText === "Find support or report")
    ?.click();
  await holdOn();
  // Follow defined steps to report
  for (const clickProvider of clickProviders) {
    const target = clickProvider();
    if (!target) {
      // Click target not found, closing early
      $('div[aria-label="Close"]')?.click();
      await holdOn();
      return;
    }
    target.click();
    await holdOn();
  }
  // Make sure to close the dialog on teardown
  $('div[aria-label="Close"]')?.click();
  await holdOn();
};

// Single entry point to nuke the asshole with all the FUDs
const reportAll = async () => {
  const start = Date.now();
  const reportTypes = (await listReportTypes()).filter((rt) => rt in REPORTS);
  console.debug("Available report types:", reportTypes);
  for (const rt of reportTypes) {
    console.debug(`Reporting for: ${rt}`);
    await report(...REPORTS[rt]);
  }
  const end = Date.now();
  const duration = Math.ceil((end - start) / 1000);
  new Notification("FB auto pressing", {
    body: `Pressing asshole ${
      location.href.replace(
        location.origin,
        "",
      )
    } completed after ${duration}s! Thanks for waiting comrade!`,
  });
  if (arguments?.length > 0) {
    arguments[arguments.length - 1]()
  }
};

reportAll();