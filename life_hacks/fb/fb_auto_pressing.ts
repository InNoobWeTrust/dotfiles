#!/usr/bin/env -S bun run

import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import log from "npmlog";
Object.defineProperty(log, "heading", {
  get: () => {
    return new Date().toLocaleString("sv", { timeZoneName: "short" });
  },
});
log.headingStyle = { bg: "", fg: "white" };
log.level = "silly";
import logfile from "npmlog-file";

const firefoxOptions = new firefox.Options().headless();
const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(firefoxOptions)
  .build();
driver.manage().setTimeouts({
  implicit: 1_500,
  pageLoad: 30_000,
  script: 120_000,
});

const holdon = () =>
  new Promise((resolve) => setTimeout(resolve, 1_000 + 500 * Math.random()));

const randomHour = () => Math.floor(4 + Math.random() * 2);

const sleep = (hours: number) =>
  new Promise((resolve) => setTimeout(resolve, hours * 3_600 * 1_000));

const login = async () => {
  log.info("Logging in...");
  await driver.get("http://www.facebook.com/login");
  await driver.findElement(By.id("email")).sendKeys(Bun.env.EMAIL);
  await driver.findElement(By.id("pass")).sendKeys(Bun.env.PASS);
  await driver.findElement(By.id("loginbutton")).click();
};

const pressing = async () => {
  const links = (await Bun.file("./links.txt").text()).split("\n");
  const script = await Bun.file("./fb_auto_pressing.js").text();
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

await login();
while (true) {
  await pressing();
  const hours = randomHour();
  log.info(`Sleeping for ${hours} hours...`);
  logfile.write(log, "log.txt");
  await sleep(hours);
}
//await driver.quit();
