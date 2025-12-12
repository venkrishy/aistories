const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Track all network requests
  const requests = [];
  const failedRequests = [];

  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText
    });
  });

  // Track console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });

    // Wait for React to render
    await page.waitForTimeout(3000);

    console.log('\n=== NETWORK ANALYSIS ===');
    console.log(`Total requests: ${requests.length}`);

    // Check for story JSON requests
    const jsonRequests = requests.filter(r => r.url.includes('story.json'));
    console.log(`\nStory JSON requests: ${jsonRequests.length}`);
    jsonRequests.forEach(req => {
      console.log(`  - ${req.url}`);
    });

    // Check for cover image requests
    const coverRequests = requests.filter(r => r.url.includes('cover.webp'));
    console.log(`\nCover image requests: ${coverRequests.length}`);
    coverRequests.forEach(req => {
      console.log(`  - ${req.url}`);
    });

    console.log(`\nFailed requests: ${failedRequests.length}`);
    failedRequests.forEach(req => {
      console.log(`  - ${req.url}`);
      console.log(`    Error: ${req.failure}`);
    });

    console.log('\n=== REACT COMPONENT ANALYSIS ===');

    // Check if LandingPage is rendered
    const landingPage = await page.evaluate(() => {
      const hasHero = document.querySelector('section') !== null;
      const hasStoryShowcase = document.getElementById('story-showcase') !== null;
      return { hasHero, hasStoryShowcase };
    });
    console.log('Landing page components:', landingPage);

    // Check for carousel
    const carousel = await page.evaluate(() => {
      const carouselContainer = document.querySelector('[class*="embla"]');
      const storyCards = document.querySelectorAll('[class*="cursor-pointer"]');
      return {
        hasCarouselContainer: carouselContainer !== null,
        storyCardsCount: storyCards.length
      };
    });
    console.log('Carousel state:', carousel);

    // Check loading state
    const loadingState = await page.evaluate(() => {
      const spinner = document.querySelector('.animate-spin');
      const loadingText = Array.from(document.querySelectorAll('*')).find(
        el => el.textContent.includes('Loading')
      );
      return {
        hasSpinner: spinner !== null,
        hasLoadingText: loadingText !== null
      };
    });
    console.log('Loading state:', loadingState);

    // Get all class names on the page
    const classNames = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class]');
      const classes = new Set();
      elements.forEach(el => {
        el.className.split(' ').forEach(c => {
          if (c && c.length > 0) classes.add(c);
        });
      });
      return Array.from(classes).filter(c =>
        c.includes('story') || c.includes('card') || c.includes('carousel')
      );
    });
    console.log('\nStory-related classes found:', classNames);

    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type.toUpperCase()}] ${log.text}`);
    });

    // Take a final screenshot
    await page.screenshot({ path: '.playwright-mcp/detailed-analysis.png', fullPage: true });
    console.log('\nScreenshot saved: detailed-analysis.png');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
