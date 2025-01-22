const $ = (selectors) => document.querySelector(selectors);
const $$ = (selectors) => [...document.querySelectorAll(selectors)];

const expandCompletedModules = () =>
  $$("div.main_module.completed:not(.open)").forEach((e) => e.click());

const moduleHours = (moduleNumber) => {
  expandCompletedModules();

  return (
    $$(`div.main_module.completed[tabindex="${moduleNumber}"] span.seshTime`)
      .map((e) => e.innerText)
      .map(
        (t) =>
          (t.split("h")[0] * 60 || 0) +
          Number(t.split("m")[0].split("h").slice(-1))
      )
      .reduce((acc, x) => acc + x, 0) / 60
  );
};

const totalHours = () => {
  expandCompletedModules();

  return (
    $$(`div.main_module.completed span.seshTime`)
      .map((e) => e.innerText)
      .map(
        (t) =>
          (t.split("h")[0] * 60 || 0) +
          Number(t.split("m")[0].split("h").slice(-1))
      )
      .reduce((acc, x) => acc + x, 0) / 60
  );
};
