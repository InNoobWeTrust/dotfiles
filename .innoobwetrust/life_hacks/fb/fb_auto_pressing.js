// ==UserScript==
// @name         Auto pressing assholes on FB
// @namespace    all
// @version      2024-02-06
// @description  Auto pressing assholes on FB
// @downloadURL  https://github.com/InNoobWeTrust/dotfiles/raw/master/life_hacks/fb/fb_auto_pressing.js
// @updateURL    https://github.com/InNoobWeTrust/dotfiles/raw/master/life_hacks/fb/fb_auto_pressing.js
// @require      https://cdn.jsdelivr.net/npm/eruda
// @match        https://*.facebook.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

Object.defineProperty(Array.prototype, "sample", {
  value: function () {
    const idx = Math.floor(Math.random() * (this.length + 1));
    return [...this][idx];
  },
});
Object.defineProperty(Array.prototype, "inspectEach", {
  value: function (fn) {
    this.forEach(fn);
    return this;
  },
});

const borderHighlightBoxShadow = (el) => {
  if (!el || !el.style) return;
  const backupShadowStyle = el.style.boxShadow;
  el.style.boxShadow = "0 0 0 3px #f00";
  setTimeout(() => {
    if (el && el.style) el.style.boxShadow = backupShadowStyle;
  }, 1000);
};
const $ = (selectors) => {
  const res = document.querySelector(selectors);
  borderHighlightBoxShadow(res);
  return res;
};
const $$ = (selectors) =>
  [...document.querySelectorAll(selectors)].inspectEach(
    borderHighlightBoxShadow,
  );

// Create button to allow pressing with a click
const button = document.createElement("button");
button.classList.add("fb-pressing.btn");
Object.assign(button.style, {
  position: "absolute",
  top: "6em",
  left: "50%",
  transform: "translateX(-50%)",
  "z-index": 99999,
});
button.innerHTML = "Pressing asshole!";
button.onclick = () => {
  if (isPressing) return;
  Promise.resolve()
    .then(() => {
      isPressing = true;
      txt.innerText = "";
    })
    .then(reportAll)
    .catch((e) => {
      alert(e);
    })
    .finally(() => {
      isPressing = false;
    });
};
// Create textarea to print logs
const txt = document.createElement("textarea");
txt.classList.add("fb-pressing.log");
Object.assign(txt.style, {
  color: "white",
  background: "black",
  position: "absolute",
  top: "8em",
  left: "50%",
  transform: "translateX(-50%)",
  "z-index": 99999,
});
// Log to text area, as this userscript can also be run on mobile browser (no access to dev tools)
const log = (...args) => {
  console.debug(...args);
  txt.innerText += args.map(JSON.stringify).join(" ") + "\n";
};

const REPORTS = {
  "Fake account": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Fake account"),
      ),
  ],
  "Fake Page": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Fake Page"),
      ),
  ],
  "Fake name": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Fake name"),
      ),
  ],
  "Posting inappropriate things": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Posting inappropriate things"),
      ),
  ],
  "Harassment or bullying": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Harassment or bullying"),
      ),
  ],
  "I want to help": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("I want to help"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  "Something else": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Something else"),
      ),
  ],
  "Hate speech": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Hate speech"),
      ),
  ],
  "Nudity or sexual content": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Nudity or sexual content"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  "Nudity or sexual activity": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Nudity or sexual activity"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  Violence: [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Violence"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  Harassment: [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Harassment"),
      ),
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("It's someone else"),
      ),
  ],
  "Unauthorised sales": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Unauthorised sales"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  "Fraud or scam": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Fraud or scam"),
      ),
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Other"),
      ),
  ],
  "False information": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Fraud or scam"),
      ),
    () => $$("div[role=dialog] div[role=listitem] div[role=button]")?.sample(),
  ],
  Spam: [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Spam"),
      ),
  ],
  "Intellectual property": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("Intellectual property"),
      ),
  ],
  "I can't access my account": [
    () =>
      $$("div[role=dialog] div[role=listitem] div[role=button]")?.find((e) =>
        e.innerText.includes("I can't access my account"),
      ),
  ],
};

const SUBMIT_STEPS = [
  () => $("div[role=dialog] div[aria-label=Submit][role=button]"),
  () => $("div[role=dialog] div[aria-label=Next][role=button]"),
  () => $("div[role=dialog] div[aria-label=Done][role=button]"),
];

const delayClick = () => 2000 + 1000 * Math.random() + 500 * Math.random();

const timer = async (durationMs) => {
  await new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

const holdOn = async () => await timer(delayClick());

const openReportMenu = async () => {
  // Open menu
  //$('div[aria-label="See Options"]')?.click();
  //$('div[aria-label="See options"]')?.click();
  //$('div[aria-label="More"]')?.click();
  $("div[aria-haspopup=menu][role=button]")?.click();
  await holdOn();
  // Click report option
  $$("div[role=menuitem]")
    ?.find((e) => e.innerText.includes("Find support or report"))
    ?.click();
  $$("div[role=menuitem]")
    ?.find((e) => e.innerText.includes("Report group"))
    ?.click();
  await holdOn();
};

const listReportTypes = async () => {
  const reportTypes = $$(
    "div[role=dialog] div[role=listitem] div[role=button]",
  )?.map((e) => e.innerText.trim());
  // Make sure to close the dialog on teardown
  $("div[aria-label=Close]")?.click();
  await holdOn();
  return reportTypes;
};

const report = async (...clickProviders) => {
  await openReportMenu();
  await holdOn();
  // Follow defined steps to report
  for (const clickProvider of [...clickProviders, ...SUBMIT_STEPS]) {
    const target = clickProvider();
    if (!target) {
      // Click target not found, closing early
      $("div[aria-label=Close]")?.click();
      await holdOn();
      return;
    }
    target.click();
    await holdOn();
  }
  // Make sure to close the dialog on teardown
  $("div[aria-label=Close]")?.click();
  await holdOn();
};

const isNotificationSupported = () =>
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

// Single entry point to nuke the asshole with all the FUDs
const reportAll = async () => {
  const start = Date.now();
  await openReportMenu();
  let reportTypes = (await listReportTypes()).filter((rt) => rt in REPORTS);
  if (reportTypes.length === 0) {
    for (const _ of Array(3)) {
      reportTypes = (await listReportTypes()).filter((rt) => rt in REPORTS);
      if (reportTypes.length > 0) break;
      await timer(2000 + delayClick());
    }
  }
  log("Available report types:", reportTypes);
  for (const rt of reportTypes) {
    log(`Reporting for: ${rt}`);
    await report(...REPORTS[rt]);
  }
  const end = Date.now();
  const duration = Math.ceil((end - start) / 1000);
  if (isNotificationSupported()) {
    new Notification("FB auto pressing", {
      body: `Pressing asshole ${location.href.replace(
        location.origin,
        "",
      )} completed after ${duration}s! Thanks for waiting comrade!`,
    });
  } else {
    log(
      `Pressing asshole ${location.href.replace(location.origin, "")} completed after ${duration}s! Thanks for waiting comrade!`,
    );
  }
};

let isPressing = false;

(() => {
  // Download and init eruda
  const interval = setInterval(() => {
    if (window.eruda) {
      clearInterval(interval);
      window.eruda.init();
    }
  }, 500);
  // Append button
  document.body.appendChild(button);
  // Append textarea
  document.body.appendChild(txt);
  return button;
})();
