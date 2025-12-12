const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Array to store console messages
  const consoleLogs = [];
  const consoleErrors = [];
  const consoleWarnings = [];

  // Listen to console events
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      consoleErrors.push(text);
      console.log('CONSOLE ERROR:', text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      console.log('CONSOLE WARNING:', text);
    } else {
      consoleLogs.push(text);
      console.log('CONSOLE LOG:', text);
    }
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });

  // Listen to network requests
  page.on('requestfailed', request => {
    console.log('FAILED REQUEST:', request.url(), request.failure().errorText);
  });

  try {
    console.log('=== TEST 1: Navigate to landing page ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '.playwright-mcp/01-landing-page.png', fullPage: true });
    console.log('Screenshot saved: 01-landing-page.png');

    console.log('\n=== TEST 2: Check page title ===');
    const title = await page.title();
    console.log('Page title:', title);

    console.log('\n=== TEST 3: Check HTML structure ===');
    const bodyContent = await page.evaluate(() => document.body.innerHTML);
    console.log('Body has content:', bodyContent.length > 100 ? 'YES' : 'NO');
    console.log('Body content length:', bodyContent.length);

    console.log('\n=== TEST 4: Check for Hero section ===');
    const heroExists = await page.locator('[class*="hero"]').count() > 0 ||
                       await page.locator('h1').count() > 0;
    console.log('Hero section found:', heroExists);

    if (heroExists) {
      const h1Text = await page.locator('h1').first().textContent().catch(() => 'Not found');
      console.log('Hero heading text:', h1Text);
      await page.screenshot({ path: '.playwright-mcp/02-hero-section.png' });
    }

    console.log('\n=== TEST 5: Check for typewriter effect ===');
    const typewriterElements = await page.locator('[class*="typewriter"], [class*="typing"]').count();
    console.log('Typewriter elements found:', typewriterElements);

    console.log('\n=== TEST 6: Scroll and check for stories section ===');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/03-after-scroll.png', fullPage: true });

    console.log('\n=== TEST 7: Check for story carousel/cards ===');
    const storyCards = await page.locator('[class*="story"], [class*="card"], [class*="carousel"]').all();
    console.log('Story-related elements found:', storyCards.length);

    // Try to find any clickable story elements
    const clickableStories = await page.locator('a[href*="story"], button[class*="story"]').all();
    console.log('Clickable story elements:', clickableStories.length);

    console.log('\n=== TEST 8: Check all visible text ===');
    const allText = await page.evaluate(() => document.body.innerText);
    console.log('Visible text on page:');
    console.log(allText);

    console.log('\n=== TEST 9: Check for "Our Stories" section ===');
    const ourStoriesText = await page.getByText('Our Stories', { exact: false }).count();
    console.log('Our Stories section found:', ourStoriesText > 0);

    if (ourStoriesText > 0) {
      await page.getByText('Our Stories', { exact: false }).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '.playwright-mcp/04-our-stories-section.png' });
    }

    console.log('\n=== TEST 10: Check all images ===');
    const images = await page.locator('img').all();
    console.log('Total images found:', images.length);

    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const src = await images[i].getAttribute('src');
      const alt = await images[i].getAttribute('alt');
      console.log(`Image ${i + 1}: src="${src}", alt="${alt}"`);
    }

    console.log('\n=== TEST 11: Try clicking on story card if available ===');
    const firstStoryCard = await page.locator('a[href*="story"], button[class*="story"]').first();
    const cardCount = await page.locator('a[href*="story"], button[class*="story"]').count();

    if (cardCount > 0) {
      console.log('Found story card, attempting to click...');
      await firstStoryCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '.playwright-mcp/05-before-click.png' });

      await firstStoryCard.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '.playwright-mcp/06-after-click.png', fullPage: true });

      const newUrl = page.url();
      console.log('Navigated to:', newUrl);
    } else {
      console.log('No story cards found to click');
    }

    console.log('\n=== TEST 12: Check for React root ===');
    const reactRoot = await page.locator('#root').count();
    console.log('React root element found:', reactRoot > 0);

    if (reactRoot > 0) {
      const rootContent = await page.locator('#root').innerHTML();
      console.log('React root has content:', rootContent.length > 0);
      console.log('React root content length:', rootContent.length);
    }

    console.log('\n=== CONSOLE SUMMARY ===');
    console.log('Total console logs:', consoleLogs.length);
    console.log('Total console warnings:', consoleWarnings.length);
    console.log('Total console errors:', consoleErrors.length);

    if (consoleErrors.length > 0) {
      console.log('\nERRORS:');
      consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }

    if (consoleWarnings.length > 0) {
      console.log('\nWARNINGS:');
      consoleWarnings.forEach((warn, i) => console.log(`${i + 1}. ${warn}`));
    }

    // Save a detailed report
    const report = {
      timestamp: new Date().toISOString(),
      title,
      heroExists,
      typewriterElements,
      storyCardsCount: storyCards.length,
      clickableStoriesCount: clickableStories.length,
      ourStoriesFound: ourStoriesText > 0,
      imagesCount: images.length,
      consoleLogs,
      consoleWarnings,
      consoleErrors,
      reactRootExists: reactRoot > 0,
      visibleText: allText
    };

    fs.writeFileSync('.playwright-mcp/test-report.json', JSON.stringify(report, null, 2));
    console.log('\nTest report saved to: .playwright-mcp/test-report.json');

  } catch (error) {
    console.error('Test failed with error:', error.message);
    await page.screenshot({ path: '.playwright-mcp/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
