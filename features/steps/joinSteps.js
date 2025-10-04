const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');

let browser, page;

Before(async function () {
  browser = await chromium.launch();
  page = await browser.newPage();
  this.page = page;
});

After(async function () {
  if (browser) await browser.close();
});

Given('the server is running', async function () {
  // Assume tests run against local server on 3000
  // In CI, set up the server as a service or start it in setup
  return true;
});

When('I open the game page', async function () {
  await this.page.goto('http://localhost:3000');
});

When('I click {string}', async function (buttonText) {
  await this.page.click(`text=${buttonText}`);
});

Then('I should see the draw pile count', async function () {
  await this.page.waitForSelector('#drawCount');
  const text = await this.page.textContent('#drawCount');
  if (!text) throw new Error('No drawCount visible');
});
