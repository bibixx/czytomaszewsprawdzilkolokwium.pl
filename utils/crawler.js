let launch;
const chalk = require('chalk');

if (process.env.NODE_ENV === 'production') {
  const chrome = require('chrome-aws-lambda');
  const puppeteer = require('puppeteer-core');

  launch = async () => puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });
} else {
  const puppeteer = require('puppeteer');
  launch = () => puppeteer.launch();
}

const DATA_URL = 'https://pejot.sharepoint.com/sites/tomaszew/2018_2019_Z/PPJ';
const { PJATK_LOGIN: LOGIN, PJATK_PASSWORD: PASSWORD } = process.env;

module.exports = async () => {
  console.log(chalk.cyan("[CRAWLER START]"));
  console.log(chalk.grey("[1/5] Starting crawler..."));
  const browser = await launch();

  const page = await browser.newPage();
  await page.goto(DATA_URL);

  console.log(chalk.grey("[2/5] Logging in on Microsoft page..."));
  const $loginInput = await page.$('[name="loginfmt"]');
  await $loginInput.type(LOGIN);
  
  await $loginInput.press('Enter');
  
  const passwordInputSelector = '[name="Password"]';
  await page.waitForSelector(passwordInputSelector);
  
  console.log(chalk.grey("[3/5] Logging in on PJATK page..."));
  const $passwordInput = await page.$(passwordInputSelector);
  await $passwordInput.type(PASSWORD);
  await $passwordInput.press('Enter');
  
  const noButtonSelector = '#idBtn_Back';
  await page.waitForSelector(noButtonSelector);

  await page.click(noButtonSelector);

  await page.waitForRequest(DATA_URL);

  console.log(chalk.grey("[4/5] Waiting for cells..."));
  const headerCellsSelector = '[data-sp-a11y-id="ControlZone_a5f77b8c-a9ae-431c-bf09-e67a5ed41028"] .ms-DetailsList-headerWrapper .ms-DetailsHeader-cell';
  await page.waitForSelector(headerCellsSelector);

  await page.waitForFunction(() => !!document.querySelectorAll('[data-sp-a11y-id="ControlZone_a5f77b8c-a9ae-431c-bf09-e67a5ed41028"] .ms-DetailsList-headerWrapper .ms-DetailsHeader-cell')[1].textContent.indexOf('Numer') >= 0);
  
  const headerCells = await page.$$eval(headerCellsSelector, cells => cells.map(cell => cell.textContent));
  await browser.close();

  const nonExerciseMarks = headerCells
    .slice(4)
    .map(cell => cell.replace(String.fromCharCode(59149), ''))
    .filter(cell => !(/Z[0-9\.]+/).test(cell));

  console.log(chalk.grey(`[5/5] Current marks: ${JSON.stringify(nonExerciseMarks)}`));
  console.log(chalk.cyan("[CRAWLER END]"));

  return nonExerciseMarks;
};

