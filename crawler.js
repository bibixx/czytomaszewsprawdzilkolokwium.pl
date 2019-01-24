const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const DATA_URL = 'https://pejot.sharepoint.com/sites/tomaszew/2018_2019_Z/PPJ';
const { LOGIN, PASSWORD } = process.env;

const getNonExerciseMarks = async () => {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  await page.goto(DATA_URL);

  console.log("Logging in on Microsoft page...");
  const $loginInput = await page.$('[name="loginfmt"]');
  await $loginInput.type(LOGIN);
  
  await $loginInput.press('Enter');
  
  const passwordInputSelector = '[name="Password"]';
  await page.waitForSelector(passwordInputSelector);
  
  console.log("Logging in on PJATK page...");
  const $passwordInput = await page.$(passwordInputSelector);
  await $passwordInput.type(PASSWORD);
  await $passwordInput.press('Enter');
  
  const noButtonSelector = '#idBtn_Back';
  await page.waitForSelector(noButtonSelector);

  await page.click(noButtonSelector);

  await page.waitForRequest(DATA_URL);

  console.log("Waiting for cells...");
  const headerCellsSelector = '[data-sp-a11y-id="ControlZone_a5f77b8c-a9ae-431c-bf09-e67a5ed41028"] .ms-DetailsList-headerWrapper .ms-DetailsHeader-cell';
  await page.waitForSelector(headerCellsSelector);

  await page.waitForFunction(() => !!document.querySelectorAll('[data-sp-a11y-id="ControlZone_a5f77b8c-a9ae-431c-bf09-e67a5ed41028"] .ms-DetailsList-headerWrapper .ms-DetailsHeader-cell')[1].textContent.indexOf('Numer') >= 0);
  
  const headerCells = await page.$$eval(headerCellsSelector, cells => cells.map(cell => cell.textContent));
  await browser.close();

  const nonExerciseMarks = headerCells
    .slice(4)
    .map(cell => cell.replace(String.fromCharCode(59149), ''))
    .filter(cell => !(/Z[0-9\.]+/).test(cell));

  return nonExerciseMarks;
};

module.exports = async (req, res) => {
  const marks = await getNonExerciseMarks();
  res.end(JSON.stringify(marks));
}
