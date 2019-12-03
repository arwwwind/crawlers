const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const url = require('url');
const uuid = require('uuid/v4');
const fs = require('fs');
const mainDishSel = '.menu-item__main-container.cursor-pointer > a';
const sideopenerSel = 'p.addon-panel__cta.text--bolder.cursor-pointer';

puppeteer.use(StealthPlugin());

async function run() {
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

  try {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://dahmakan.com/kuala-lumpur/menu', {
      timeout: 3000000
    });

    await page.waitForSelector(sideopenerSel, { timeout: 0 });
    const clickThemAll = await page.$$eval(sideopenerSel, links =>
      links.map(link => link.click())
    );

    await page.waitForSelector(mainDishSel, { timeout: 0 });
    let postUrls = await page.$$eval(mainDishSel, postLinks => {
      return postLinks.map(link => link.href);
    });
    postUrls = postUrls.reduce(function(a, b) {
      if (a.indexOf(b) < 0) a.push(b);
      return a;
    }, []);

    let unique = {};
    postUrls.forEach(p => {
      let split = p.split('/');
      let u = split[split.length - 1];
      unique[u] = p;
    });

    let filteredUrl = [];

    for (var key in unique) {
      filteredUrl.push(unique[key]);
    }

    console.log(filteredUrl.length);

    let crawlData = [];

    for (let i = 1; i <= filteredUrl.length; i++) {
      console.log(i);
      await page.goto(filteredUrl[i - 1], {
        timeout: 3000000
      });
      const titleSel = 'h1.dish__title';
      const costSel = '.dish__price > span';
      const imageSel = '.dish__image.border--rounded';
      
      await page.waitForSelector(titleSel, { timeout: 0 });
      await page.waitForSelector(costSel, { timeout: 0 });
      await page.waitForSelector(imageSel, { timeout: 0 });
      
      const title = await page.$eval(titleSel, titleSel => titleSel.outerText);
      
      let content;
      try {
        const contentSel = '.general-view.lh--150';
        // await page.waitForSelector(contentSel, { timeout: 0 });
        content = await page.$eval(
        contentSel,
        contentSel => contentSel.outerText
      );
      } catch(err) {
        console.log('Item does not have description');
        content = null;
      }

      const cost = await page.$eval(costSel, costSel => {
        let c = costSel.outerText;
        c = parseFloat(c.substring(2, 8), 10);
        return c;
      });
      const img = await page.$eval(imageSel, imageSel => {
        let im = window.getComputedStyle(imageSel).backgroundImage;
        im = im.substr(5).slice(0, -2);
        return im;
      });

      allImg = {};
      allImg.default = img;
      allImg.thumb = img.split('default').join('small');
      allImg.large = img.split('default').join('large');

      crawlData.push({
        id: uuid(),
        title: title,
        content: content,
        cost: cost,
        url: filteredUrl[i - 1],
        img: allImg
      });
      // await page.screenshot({ path: `screenshots/dhamakan${Date.now()}.png` });
    }
    fs.writeFileSync(
      `./data/dhamakan${Date.now()}.json`,
      JSON.stringify(crawlData, null, 10),
      err => {
        err ? console.error(err) : console.log('done');
      }
    );

    browser.close();
  } catch (err) {
    console.log(err);
    return;
  }
}

run();
