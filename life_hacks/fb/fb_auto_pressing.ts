#!/usr/bin/env -S bun run

import { Builder, By } from "selenium-webdriver";
import yaml from "js-yaml";
import log from "npmlog";
Object.defineProperty(log, "heading", {
  get: () => {
    return new Date().toLocaleString("sv", { timeZoneName: "short" });
  },
});
log.headingStyle = { bg: "", fg: "white" };
import logfile from "npmlog-file";

const CONFIG = Bun.env.CONFIG || "./config.yml";
const SCRIPT = Bun.env.SCRIPT || "./fb_auto_pressing.js";
const LOGLEVEL = Bun.env.LOGLEVEL || "silly";

log.level = LOGLEVEL;

const getConfig = async () => {
  log.verbose(`Using config at ${CONFIG}...`);
  return yaml.load(await Bun.file(CONFIG).text());
};

const getScript = async () => {
  log.verbose(`Using script at ${SCRIPT}...`);
  return await Bun.file(SCRIPT).text();
};

const choose = (...arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const holdon = async () => {
  const {
    delay: { min, max },
  } = await getConfig();
  const durationMs = min + Math.floor(Math.random() * (max - min));
  log.verbose(
    `Delay for ${
      durationMs.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })
    }ms...`,
  );
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

const sleep = async () => {
  const {
    sleep: { min, max },
  } = await getConfig();
  const durationMs = min + Math.floor(Math.random() * (max - min));
  log.info(
    `Sleeping for ${
      durationMs.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })
    }ms...`,
  );
  await new Promise((resolve) => setTimeout(resolve, durationMs));
};

const getDriver = async () => {
  const { browsers, timeouts } = await getConfig();

  const browser = choose(...browsers);
  log.info(`Using browser: ${browser}`);
  const driver = await new Builder().forBrowser(browser).build();
  driver.manage().setTimeouts(timeouts);
  return driver;
};

const login = async (driver) => {
  const { accounts } = await getConfig();
  const acc = choose(...accounts);
  log.info(`Logging in with ${JSON.stringify(acc)}...`);
  await driver.get("http://www.facebook.com/login");
  await driver.findElement(By.id("email")).sendKeys(acc.email);
  await driver.findElement(By.id("pass")).sendKeys(acc.pass);
  await driver.findElement(By.id("loginbutton")).click();
};

const pressing = async (driver) => {
  const { links } = await getConfig();
  const script = await getScript();
  const start = Date.now();
  try {
    for (const link of links) {
      log.info(`Pressing asshole @ ${link}`);
      console.time(link);
      try {
        await driver.get(link);
        await driver.executeAsyncScript(script);
      } catch (e) {
        log.error(e);
      }
      console.timeEnd(link);
      await holdon();
    }
    log.info("Justice has been executed, thanks for waiting, comrade!");
  } catch (e) {
    log.error(e);
  } finally {
    log.verbose("Cleaning up...");
  }
  const end = Date.now();
  const duration = Math.ceil((end - start) / 1_000);
  log.info(
    `Pressing done after ${Math.floor(duration / 60)}m${duration % 60}s}`,
  );
};

while (true) {
  const driver = await getDriver();
  await login(driver);
  await pressing(driver);
  await driver.quit();
  logfile.write(log, "out.log");
  await sleep();
}
