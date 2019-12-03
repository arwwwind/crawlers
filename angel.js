const puppeteer = require('puppeteer-extra');
const ppt = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const linkSel = 'a.result-title.hover_feedback';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });

  const navigationPromise = page.waitForNavigation();
  await page.goto(`https://angel.co/login`, {
    timeout: 3000000
  });
  await page.waitForSelector('#user_email');
  await page.waitForSelector('#user_password');
  await page.waitForSelector(
    '.s-grid0 > .s-grid0-colLg12 > #new_user > .s-vgTop1_5 > .c-button'
  );

  await page.$eval(
    '#user_email',
    el => (el.value = 'dupesh.murgesh@gmail.com')
  );
  await page.$eval('#user_password', el => (el.value = 'Dupesh@123'));
  await page.click(
    '.s-grid0 > .s-grid0-colLg12 > #new_user > .s-vgTop1_5 > .c-button'
  );

  await page.screenshot({ path: `screenshots/angel${Date.now()}.png` });
  // fs.writeFileSync(
  //   `./data/zomato${Date.now()}.json`,
  //   JSON.stringify(finalData, null, 2),
  //   err => {
  //     err ? console.error(err) : console.log('done');
  //   }
  // );

  await navigationPromise;

  await browser.close();
})();
