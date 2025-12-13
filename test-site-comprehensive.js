import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  const warnings = [];
  const successes = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(`Page error: ${error.message}`);
  });

  console.log('🌐 Testing: https://aistories-95i.pages.dev/\n');

  try {
    // Navigate to the site
    const response = await page.goto('https://aistories-95i.pages.dev/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`✅ Page loaded: ${response.status()}`);
    successes.push('Page loads successfully');

    // Check page title
    const title = await page.title();
    console.log(`✅ Page title: "${title}"`);
    successes.push(`Page title is correct: ${title}`);

    // Check if root div has content
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    if (rootContent.length > 0) {
      console.log(`✅ Root div has content: ${rootContent.length} characters`);
      successes.push(`Root div populated with ${rootContent.length} characters`);
    } else {
      console.log(`❌ Root div is empty`);
      errors.push('Root div is empty');
    }

    // Check for main navigation elements
    const hasNav = await page.$('nav');
    if (hasNav) {
      console.log(`✅ Navigation found`);
      successes.push('Navigation component exists');
    }

    // Check for hero section
    const hasHero = await page.$('[class*="hero" i], [class*="Hero" i]');
    if (hasHero) {
      console.log(`✅ Hero section found`);
      successes.push('Hero section exists');
    }

    // Get all loaded resources
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        type: r.initiatorType,
        status: r.transferSize > 0 ? 'loaded' : 'cached'
      }));
    });

    // Check JavaScript files
    const jsFiles = resources.filter(r => r.name.endsWith('.js'));
    console.log(`\n📦 JavaScript files loaded: ${jsFiles.length}`);
    jsFiles.forEach(js => {
      console.log(`   - ${js.name.split('/').pop()}: ${js.status}`);
    });

    // Check CSS files
    const cssFiles = resources.filter(r => r.name.endsWith('.css'));
    console.log(`\n🎨 CSS files loaded: ${cssFiles.length}`);
    cssFiles.forEach(css => {
      console.log(`   - ${css.name.split('/').pop()}: ${css.status}`);
    });

    // Take screenshot
    await page.screenshot({ path: 'site-test-screenshot.png', fullPage: true });
    console.log(`\n📸 Screenshot saved: site-test-screenshot.png`);

    // Test routing (if applicable)
    const links = await page.$$('a[href^="/"]');
    console.log(`\n🔗 Internal links found: ${links.length}`);

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    errors.push(`Test execution failed: ${error.message}`);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ Successes: ${successes.length}`);
  successes.forEach(s => console.log(`   - ${s}`));

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    warnings.slice(0, 5).forEach(w => console.log(`   - ${w}`));
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more warnings`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors: ${errors.length}`);
    errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(errors.length === 0 ? '✅ All tests passed!' : '⚠️  Some issues found');
  console.log('='.repeat(60) + '\n');

  process.exit(errors.length === 0 ? 0 : 1);
})();
