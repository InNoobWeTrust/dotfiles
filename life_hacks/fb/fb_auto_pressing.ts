#!/usr/bin/env -S deno run -A

import { Builder, By } from "npm:selenium-webdriver";
import until from "npm:selenium-webdriver/lib/until.js";
import chrome from "npm:selenium-webdriver/chrome.js";
import edge from "npm:selenium-webdriver/edge.js";
import firefox from "npm:selenium-webdriver/firefox.js";
import { Duration } from "npm:luxon";
import yaml from "npm:js-yaml";
import winston from "npm:winston";

const CONFIG = Deno.env.CONFIG || "./config.yml";
const SCRIPT = Deno.env.SCRIPT || "./fb_auto_pressing.js";
const LOGLEVEL = Deno.env.LOGLEVEL || "info";
const CHECKPOINT = Deno.env.CHECKPOINT || "./checkpoint.txt";
const CRON = Deno.env.CRON || false;

const logger = winston.createLogger({
  level: LOGLEVEL,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, label, timestamp }) =>
        [
          `${timestamp}`,
          label ? `[${label}]` : "",
          `${level}:`,
          message,
        ].filter(Boolean).join(" "),
    ),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "out.log",
    }),
  ],
});

const getConfig = async () => {
  logger.debug(`Loading config at path ${CONFIG}`);
  return yaml.load(Deno.readTextFileSync(CONFIG));
};

const getScript = async () => {
  logger.debug(`Using script at ${SCRIPT}...`);
  return Deno.readTextFileSync(SCRIPT);
};

const choose = (...arr: unknown[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const permutate = (...arr: unknown[]) =>
  function* (arr: unknown[]) {
    while (arr.length > 0) {
      const [picked, ..._] = arr.splice(
        Math.floor(Math.random() * arr.length),
        1,
      );
      logger.debug(`picked: ${picked}`);
      yield picked;
    }
  }.bind(this)(arr);

const durationFmt = (durationMs: number) => {
  return Duration.fromMillis(durationMs).toFormat("hh:mm:ss");
};

const holdon = async () => {
  const {
    delay: { min, max },
  } = await getConfig();
  const durationMs = min + Math.floor(Math.random() * (max - min));
  logger.debug(`Delay for ${durationFmt(durationMs)}...`);
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

const checkpoint = async () => {
  Deno.writeTextFileSync(CHECKPOINT, new Date().toISOString());
};

const getDriver = async () => {
  const { browsers, timeouts } = await getConfig();

  const browser = choose(...browsers);
  logger.info(`Using browser: ${browser}`);
  const driver = await new Builder()
    .forBrowser(browser)
    .setChromeOptions(new chrome.Options().headless())
    .setEdgeOptions(new edge.Options().headless())
    .setFirefoxOptions(new firefox.Options().headless())
    .build();
  driver.manage().setTimeouts(timeouts);
  return driver;
};

const login = async (driver: any) => {
  const { accounts, timeouts } = await getConfig();
  const acc = choose(...accounts) as { email: string; pass: string };
  logger.info(`Logging in with ${JSON.stringify(acc)}...`);
  await driver.get("http://www.facebook.com/login");
  await driver.wait(
    until.elementLocated(By.id("loginbutton")),
    timeouts.pageLoad,
  );
  await driver.findElement(By.id("email")).sendKeys(acc.email);
  await driver.findElement(By.id("pass")).sendKeys(acc.pass);
  await driver.findElement(By.id("loginbutton")).click();
  await holdon();
};

const pressingSingle = async (driver: any, target: string) => {
  const { timeouts } = await getConfig();
  const script = await getScript();

  logger.info(`Navigating to asshole @ ${target}...`);
  await driver.get(target);
  await driver.wait(
    until.elementLocated(By.css("div[aria-haspopup=menu][role=button]")),
    timeouts.pageLoad,
  );
  logger.info(`Pressing asshole @ ${target}...`);
  await driver.executeAsyncScript(
    "const callback = arguments[arguments.length - 1];\n" +
      script.trim().slice(0, -1) +
      ".then(callback)",
  );
};

const pressingAll = async (driver: any) => {
  const { links } = await getConfig();
  const start = Date.now();
  try {
    // Maximum of 25 per session
    for (const link of [...permutate(...links)].slice(0, 25)) {
      const start = performance.now();
      try {
        await pressingSingle(driver, link as string);
      } catch (e) {
        logger.error(e);
      } finally {
        await checkpoint();
      }
      const end = performance.now();
      logger.info(`Took ${durationFmt(end - start)}...`);
      for (const _ of Array(3)) {
        await holdon();
      }
    }
    logger.info("Justice has been executed, thanks for waiting, comrade!");
  } catch (e) {
    logger.error(e);
  }
  const end = Date.now();
  logger.info(`Pressing done after ${durationFmt(end - start)}`);
};

const cronDelayCheck = async () => {
  if (!CRON) {
    return;
  }

  if (!Deno.statSync(CHECKPOINT).isFile) {
    return;
  }

  const dateStr = Deno.readTextFileSync(CHECKPOINT);
  const mtimeMs = Date.parse(dateStr);
  const {
    sleep: { min, max },
  } = await getConfig();
  const durationMs = min + Math.floor(Math.random() * (max - min));
  const eta = durationMs - (Date.now() - mtimeMs);
  if (eta > 0) {
    logger.verbose(`Not running, will run in at least ${durationFmt(eta)}...`);
    Deno.exit(0);
  }
};

const runner = async () => {
  await cronDelayCheck();

  const driver = await getDriver();
  Deno.addSignalListener("SIGINT", async () => {
    logger.warning("interrupted!");
    await driver.quit();
    Deno.exit();
  });
  await login(driver);
  await pressingAll(driver);
  await driver.quit();
};

await runner();
