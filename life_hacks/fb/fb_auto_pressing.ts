#!/usr/bin/env -S bun run

import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const links = (await Bun.file("./links.txt").text()).split("\n");
const script = await Bun.file("./fb_auto_pressing.js").text();
const holdon = () =>
  new Promise((resolve) => setTimeout(resolve, 1_000 + 500 * Math.random()));
const randomHour = () => Math.floor(4 + Math.random() * 2);
const sleep = (hours: number) =>
  new Promise((resolve) => setTimeout(resolve, hours * 3_600 * 1_000));

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

const login = async () => {
  console.log("Logging in...");
  await driver.get("http://www.facebook.com/login");
  await driver.findElement(By.id("email")).sendKeys(Bun.env.EMAIL);
  await driver.findElement(By.id("pass")).sendKeys(Bun.env.PASS);
  await driver.findElement(By.id("loginbutton")).click();
};

const pressing = async () => {
  const start = Date.now();
  try {
    for (const link of links) {
      console.log(`Pressing asshole @ ${link}`);
      console.time(link);
      try {
        await driver.get(link);
        await driver.executeAsyncScript(script);
      } catch (e) {
        console.log(e);
      }
      console.timeEnd(link);
      await holdon();
    }
    console.log("Justice has been executed, thanks for waiting, comrade!");
  } catch (e) {
    console.log(e);
  } finally {
    console.log("Cleaning up...");
  }
  const end = Date.now();
  const duration = Math.ceil((end - start) / 1_000);
  console.log(
    `Pressing done after ${Math.floor(duration / 60)}m${duration % 60}s}`,
  );
};

await login();
while (true) {
  await pressing();
  const hours = randomHour();
  console.log(`Sleeping for ${hours} hours...`);
  await sleep(hours);
}
//await driver.quit();
