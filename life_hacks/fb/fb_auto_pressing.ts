#!/usr/bin/env -S deno run -A

import { Builder, By } from "npm:selenium-webdriver";
import firefox from "npm:selenium-webdriver/firefox.js";

const links = Deno.readTextFileSync("./links.txt").split("\n");
const script = Deno.readTextFileSync("./fb_auto_pressing.js");
const holdon = () =>
  new Promise((resolve) => setTimeout(resolve, 1000 + 500 * Math.random()));

const start = Date.now();
const firefoxOptions = new firefox.Options().headless();
const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(firefoxOptions)
  .build();
driver.manage().setTimeouts({
  implicit: 1500,
  pageLoad: 20000,
  script: 300000,
});
try {
  console.log("Logging in...");
  await driver.get("http://www.facebook.com/login");
  await driver.findElement(By.id("email")).sendKeys(Deno.env.get("EMAIL"));
  await driver.findElement(By.id("pass")).sendKeys(Deno.env.get("PASS"));
  await driver.findElement(By.id("loginbutton")).click();

  for (const link of links) {
    console.log(`Pressing asshole @ ${link}`);
    console.time(link);
    await driver.get(link);
    try {
      await driver.executeAsyncScript(script);
    } catch (e) {
      console.log(e);
      console.log("Some shits happen, please proceed with escalation!");
    }
    console.timeEnd(link);
    await holdon();
  }
  console.log("Justice has been executed, thanks for waiting, comrade!");
} finally {
  console.log("Cleaning up...");
  await driver.quit();
}
const end = Date.now();
const duration = Math.ceil((end - start) / 1000);
console.log(
  `Pressing done after ${Math.floor(duration / 60)}m${duration % 60}s}`,
);
Deno.exit();
