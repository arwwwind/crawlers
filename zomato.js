const puppeteer = require('puppeteer-extra');
const ppt = require('puppeteer');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());
const iPhone = ppt.devices['iPhone 6'];

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

  let resURL = [];
  // let pagelimit = 892;
  let pagelimit = 5;
  for (let pi = 0; pi < pagelimit; pi++) {
    await page.goto(
      `https://www.zomato.com/bangalore/restaurants?page=${pi + 1}`,
      {
        timeout: 3000000
      }
    );

    await page.setViewport({ width: 1440, height: 789 });

    await page.waitForSelector(linkSel, { timeout: 0 });
    let postUrls = await page.$$eval(linkSel, postLinks => {
      return postLinks.map(link => link.href);
    });
    resURL = resURL.concat(postUrls);
    await page.waitFor(2000);
  }

  let finalData = [];

  for (let i = 1; i <= resURL.length; i++) {
    try {
      await page.goto(resURL[i - 1], {
        timeout: 3000000
      });
      await page.emulate(iPhone);
      let rating = await page.evaluate(
        () => document.querySelector('.res-rating.level-7').innerText
      );
      var zomato = await page.evaluate(() => {
        let res = {
          name: data.basic_info.name,
          rating: rating,
          timing: data.basic_info.timings_display,
          geo: data.basic_info.geolocation_data,
          thumb: data.basic_info.thumb,
          subzone_name: data.basic_info.subzone_name,
          website: data.basic_info.website,
          city: data.basic_info.city,
          urls: data.basic_info.urls,
          address: data.basic_info.restaurant_address,
          phone: data.basic_info.phoneData.phone_string,
          timings: data.all_timings,
          menu: data.menus_data.image_menus,
          highlights: []
        };
        data.highlights.forEach(h => {
          res.highlights.push(h.text);
        });
        return res;
      });
      finalData.push(zomato);
      await page.waitFor(2000);
    } catch (err) {
      console.log(err);
    }
  }

  fs.writeFileSync(
    `./data/zomato${Date.now()}.json`,
    JSON.stringify(finalData, null, 2),
    err => {
      err ? console.error(err) : console.log('done');
    }
  );

  await navigationPromise;

  await browser.close();
})();
