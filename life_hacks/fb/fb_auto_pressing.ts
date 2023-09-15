#!/usr/bin/env -S deno run -A

import { Builder, By } from "npm:selenium-webdriver";
import { Options as chromeOptions } from "npm:selenium-webdriver/chrome.js";
import { Options as edgeOptions } from "npm:selenium-webdriver/edge.js";
import { Options as firefoxOptions } from "npm:selenium-webdriver/firefox.js";
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

const getDriver = async () => {
  const { browsers, timeouts } = await getConfig();

  const browser = choose(...browsers);
  logger.info(`Using browser: ${browser}`);
  const driver = await new Builder()
    .forBrowser(browser)
    .setChromeOptions(new chromeOptions().headless())
    .setEdgeOptions(new edgeOptions().headless())
    .setFirefoxOptions(new firefoxOptions().headless())
    .build();
  driver.manage().setTimeouts(timeouts);
  return driver;
};

const login = async (driver: any) => {
  const { accounts } = await getConfig();
  const acc = choose(...accounts) as { email: string; pass: string };
  logger.info(`Logging in with ${JSON.stringify(acc)}...`);
  await driver.get("http://www.facebook.com/login");
  await driver.findElement(By.id("email")).sendKeys(acc.email);
  await driver.findElement(By.id("pass")).sendKeys(acc.pass);
  await driver.findElement(By.id("loginbutton")).click();
  await holdon();
};

const pressing = async (driver: any) => {
  const { links } = await getConfig();
  const script = await getScript();
  const start = Date.now();
  try {
    for (const link of permutate(...links)) {
      logger.info(`Pressing asshole @ ${link}`);
      const start = performance.now();
      try {
        await driver.get(link);
        await driver.executeAsyncScript(script);
      } catch (e) {
        logger.error(e);
      } finally {
        await checkpoint();
      }
      const end = performance.now();
      logger.info(`Took ${durationFmt(end - start)}...`);
      await holdon();
    }
    logger.info("Justice has been executed, thanks for waiting, comrade!");
  } catch (e) {
    logger.error(e);
  }
  const end = Date.now();
  logger.info(`Pressing done after ${durationFmt(end - start)}`);
};

const checkpoint = async () => {
  Deno.writeTextFileSync(CHECKPOINT, new Date().toISOString());
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
  await login(driver);
  await pressing(driver);
  await driver.quit();
};

await runner();
