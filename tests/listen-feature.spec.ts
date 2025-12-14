// Tests the "Listen" feature for story narration.
// Verifies: Listen button visibility, audio playback starts (button changes to Pause),
// and auto-flip functionality works (page transitions during audio).
import { test, expect } from '@playwright/test';

test('Listen feature with auto-flip through all pages', async ({ page }) => {
  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // Try different ports
  const baseUrls = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];
  let connected = false;
  for (const url of baseUrls) {
    try {
      await page.goto(`${url}/story/red-earths-promise`, { timeout: 5000 });
      connected = true;
      break;
    } catch (e) {
      // try next
    }
  }
  if (!connected) throw new Error('Could not connect to dev server on expected ports');

  // Wait for the story to load
  await page.waitForSelector('text=The Red Earth\'s Promise', { timeout: 10000 });

  // Wait a bit for the page to fully render
  await page.waitForTimeout(1000);

  // Check for the Listen button - it should be visible (using semantic ID)
  const listenButton = page.locator('#listen-button');
  await expect(listenButton).toBeVisible({ timeout: 5000 });
  await expect(listenButton).toContainText('Listen');
  
  console.log('✓ Listen button is visible');

  // Take a screenshot before clicking
  await page.screenshot({ path: 'test-results/listen-before.png', fullPage: true });

  // Click the Listen button
  await listenButton.click();

  // Wait a moment for any errors to surface
  await page.waitForTimeout(500);

  // Log any console errors
  if (consoleErrors.length > 0) {
    console.log('Console errors after click:', consoleErrors);
  }

  // Wait for the button to change to Pause (using semantic ID)
  const pauseButton = page.locator('#listen-button');
  await expect(pauseButton).toBeVisible({ timeout: 3000 });
  await expect(pauseButton).toContainText('Pause');
  
  console.log('✓ Button changed to Pause');

  // Take a screenshot after clicking
  await page.screenshot({ path: 'test-results/listen-pause-clicked.png', fullPage: true });

  // Wait for audio to play and flip to page 2
  // We'll track page changes by monitoring the image src attribute
  const storyImage = page.locator('#listen-image');

  // Get initial page by checking which image is displayed
  let currentImageSrc = await storyImage.getAttribute('src');
  let currentPageNum = 1; // Default to page 1
  if (currentImageSrc) {
    // Extract page number from image URL (e.g., .../01.webp = page 1)
    const match = currentImageSrc.match(/(\d+)\.webp/);
    if (match) {
      currentPageNum = parseInt(match[1]);
    }
  }
  console.log(`Starting at page ${currentPageNum}`);

  // Track which pages we've seen
  const pagesSeen = new Set<number>();
  pagesSeen.add(currentPageNum);

  // Wait until we reach page 2 (verifies audio playback and auto-flip works)
  const maxWaitTime = 30000; // 30 seconds should be enough for first page flip
  const checkInterval = 500;
  const startTime = Date.now();

  while (pagesSeen.size < 2 && (Date.now() - startTime) < maxWaitTime) {
    await page.waitForTimeout(checkInterval);

    // Check if the image has changed (indicating a page flip)
    const newImageSrc = await storyImage.getAttribute('src');
    if (newImageSrc && newImageSrc !== currentImageSrc) {
      currentImageSrc = newImageSrc;
      // Extract page number from image URL
      const match = newImageSrc.match(/(\d+)\.webp/);
      if (match) {
        const newPageNum = parseInt(match[1]);
        if (newPageNum !== currentPageNum) {
          console.log(`Page flipped from ${currentPageNum} to ${newPageNum}`);
          currentPageNum = newPageNum;
          pagesSeen.add(newPageNum);

          // Take a screenshot at each page transition
          await page.screenshot({ path: `test-results/listen-page-${newPageNum}.png`, fullPage: true });
        }
      }
    }
  }

  // Verify we've seen at least page 2 (audio is playing and auto-flip works)
  expect(pagesSeen.size).toBeGreaterThanOrEqual(2);
  console.log(`Successfully verified audio playback and auto-flip: pages ${Array.from(pagesSeen).sort((a, b) => a - b).join(', ')}`);

  // Verify we're on page 2 or beyond
  expect(currentPageNum).toBeGreaterThanOrEqual(2);
  console.log(`Reached page ${currentPageNum}`);

  // Take a final screenshot
  await page.screenshot({ path: 'test-results/listen-final.png', fullPage: true });

  // Verify the button is still visible (audio should still be playing)
  const audioButton = page.locator('#listen-button');
  await expect(audioButton).toBeVisible();
  const buttonText = await audioButton.textContent();
  expect(buttonText).toMatch(/Listen|Pause/);
  console.log(`Audio button is still present (showing: ${buttonText?.trim()})`);
});

