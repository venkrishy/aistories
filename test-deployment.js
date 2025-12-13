import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });

  // Navigate to the site
  console.log('Navigating to https://aistories-95i.pages.dev/...');
  await page.goto('https://aistories-95i.pages.dev/', { waitUntil: 'networkidle' });

  // Check page title
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Check if root div has content
  const rootContent = await page.$eval('#root', el => el.innerHTML);
  console.log(`Root div content length: ${rootContent.length}`);

  // Take a screenshot
  await page.screenshot({ path: 'deployment-screenshot.png' });
  console.log('Screenshot saved to deployment-screenshot.png');

  // Get network responses for JS files
  console.log('\nChecking network responses...');
  const response = await page.goto('https://aistories-95i.pages.dev/', { waitUntil: 'load' });
  console.log(`Main page status: ${response.status()}`);

  await browser.close();
})();
