// Comprehensive landing page test suite.
// Validates: page structure, hero section, typewriter effect, story carousel,
// images, React root, console errors, and story card navigation.
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  const baseUrls = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];

    // Listen to console events
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });

    // Navigate to landing page
    let connected = false;
    for (const url of baseUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
        connected = true;
        break;
      } catch {
        // try next port
      }
    }
    if (!connected) {
      throw new Error('Could not connect to dev server on expected ports');
    }
  });

  test('should have correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('Page title:', title);
  });

  test('should have React root with content', async ({ page }) => {
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();

    const rootContent = await reactRoot.innerHTML();
    expect(rootContent.length).toBeGreaterThan(0);
    console.log('React root content length:', rootContent.length);
  });

  test('should have Hero section with heading', async ({ page }) => {
    // Check for hero section or h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 5000 });

    const headingText = await h1.textContent();
    expect(headingText).toBeTruthy();
    console.log('Hero heading text:', headingText);
  });

  test('should have typewriter effect in hero subtitle', async ({ page }) => {
    // The hero subtitle has a typewriter effect with animate-pulse cursor
    const heroSubtitle = page.locator('#hero-subtitle');
    await expect(heroSubtitle).toBeVisible();

    // Wait for typing animation to progress
    await page.waitForTimeout(1500);

    const subtitleText = await heroSubtitle.textContent();
    expect(subtitleText?.length).toBeGreaterThan(10);
    console.log('Hero subtitle text length:', subtitleText?.length);
  });

  test('should have story showcase section', async ({ page }) => {
    const storyShowcase = page.locator('#story-showcase');
    await expect(storyShowcase).toBeVisible({ timeout: 5000 });

    await storyShowcase.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/landing-story-showcase.png' });
  });

  test('should have story grid with cards', async ({ page }) => {
    // Wait for stories to load (not in loading state)
    await page.waitForSelector('#story-grid', { timeout: 10000 });

    const storyGrid = page.locator('#story-grid');
    await expect(storyGrid).toBeVisible();

    // Check for story card links within the grid
    const storyCards = page.locator('#story-grid a[href*="/story/"]');
    const count = await storyCards.count();

    expect(count).toBeGreaterThan(0);
    console.log('Story cards found:', count);
  });

  test('should have clickable story links', async ({ page }) => {
    // Wait for grid to load
    await page.waitForSelector('#story-grid', { timeout: 10000 });

    const storyLinks = page.locator('a[href*="/story/"]');
    const linkCount = await storyLinks.count();

    expect(linkCount).toBeGreaterThan(0);
    console.log('Clickable story links found:', linkCount);
  });

  test('should have images on the page', async ({ page }) => {
    // Wait for story grid to load (images are in story cards)
    await page.waitForSelector('#story-grid', { timeout: 10000 });

    const images = page.locator('img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);
    console.log('Total images found:', imageCount);

    // Log first few images for debugging
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const src = await images.nth(i).getAttribute('src');
      const alt = await images.nth(i).getAttribute('alt');
      console.log(`Image ${i + 1}: src="${src}", alt="${alt}"`);
    }
  });

  test('should navigate to story page when clicking story card', async ({ page }) => {
    // Wait for grid to load
    await page.waitForSelector('#story-grid', { timeout: 10000 });

    const firstStoryLink = page.locator('a[href*="/story/"]').first();
    const linkCount = await page.locator('a[href*="/story/"]').count();

    if (linkCount === 0) {
      test.skip();
      return;
    }

    await firstStoryLink.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/landing-before-click.png' });

    await firstStoryLink.click();
    await page.waitForTimeout(1000);

    const newUrl = page.url();
    expect(newUrl).toContain('/story/');
    console.log('Navigated to:', newUrl);

    await page.screenshot({ path: 'test-results/landing-after-click.png', fullPage: true });
  });

  test('should not have console errors', async ({ page }) => {
    // Wait a moment for any async errors
    await page.waitForTimeout(1000);

    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }

    // Filter out known acceptable errors if needed
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') && !err.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should scroll and reveal content', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/landing-initial.png' });

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Take screenshot after scroll
    await page.screenshot({ path: 'test-results/landing-scrolled.png' });

    // Verify page is scrollable (has content below fold)
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(scrollHeight).toBeGreaterThan(viewportHeight);
    console.log(`Page scroll height: ${scrollHeight}, viewport: ${viewportHeight}`);
  });
});
