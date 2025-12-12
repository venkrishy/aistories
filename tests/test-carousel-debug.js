const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    // Scroll to the story section
    await page.evaluate(() => {
      const storiesSection = document.getElementById('story-showcase');
      if (storiesSection) {
        storiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(1000);

    console.log('\n=== CHECKING STORY CARDS IN DOM ===');

    const cardAnalysis = await page.evaluate(() => {
      // Find the story showcase section
      const showcase = document.getElementById('story-showcase');
      if (!showcase) return { found: false };

      // Look for all elements with motion divs
      const motionDivs = showcase.querySelectorAll('div[class*="cursor-pointer"]');

      const cardsInfo = [];
      motionDivs.forEach((card, index) => {
        const computedStyle = window.getComputedStyle(card);
        const rect = card.getBoundingClientRect();

        // Find title in the card
        const h3 = card.querySelector('h3');
        const img = card.querySelector('img');

        cardsInfo.push({
          index,
          title: h3 ? h3.textContent : 'No title',
          hasImage: !!img,
          imageSrc: img ? img.src : 'none',
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          classes: card.className
        });
      });

      // Check for embla container
      const emblaContainer = showcase.querySelector('.overflow-hidden');
      const flexContainer = showcase.querySelector('.flex');

      return {
        found: true,
        showcaseExists: !!showcase,
        cardsCount: motionDivs.length,
        cards: cardsInfo,
        emblaContainer: {
          exists: !!emblaContainer,
          classes: emblaContainer ? emblaContainer.className : 'none'
        },
        flexContainer: {
          exists: !!flexContainer,
          classes: flexContainer ? flexContainer.className : 'none',
          childCount: flexContainer ? flexContainer.children.length : 0
        }
      };
    });

    console.log('Story showcase found:', cardAnalysis.showcaseExists);
    console.log('Cards found:', cardAnalysis.cardsCount);
    console.log('Embla container:', cardAnalysis.emblaContainer);
    console.log('Flex container:', cardAnalysis.flexContainer);

    if (cardAnalysis.cards) {
      console.log('\nCard details:');
      cardAnalysis.cards.forEach(card => {
        console.log(`\nCard ${card.index + 1}:`);
        console.log(`  Title: ${card.title}`);
        console.log(`  Has Image: ${card.hasImage}`);
        console.log(`  Image Src: ${card.imageSrc}`);
        console.log(`  Display: ${card.display}`);
        console.log(`  Visibility: ${card.visibility}`);
        console.log(`  Opacity: ${card.opacity}`);
        console.log(`  Dimensions: ${card.width}x${card.height}`);
        console.log(`  Position: top=${card.top}, left=${card.left}`);
        console.log(`  In Viewport: ${card.inViewport}`);
      });
    }

    // Take screenshot of the story section
    const storySection = await page.locator('#story-showcase');
    await storySection.screenshot({ path: '.playwright-mcp/story-section-debug.png' });
    console.log('\nScreenshot saved: story-section-debug.png');

    // Check computed styles of carousel
    const carouselStyles = await page.evaluate(() => {
      const carousel = document.querySelector('.overflow-hidden');
      if (!carousel) return null;

      const style = window.getComputedStyle(carousel);
      return {
        display: style.display,
        overflow: style.overflow,
        width: style.width,
        height: style.height
      };
    });
    console.log('\nCarousel styles:', carouselStyles);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
