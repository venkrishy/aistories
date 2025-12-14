import { test, expect } from '@playwright/test';

test('Listen feature with auto-flip through all pages', async ({ page }) => {
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
  await page.screenshot({ path: 'tests/listen-before.png', fullPage: true });

  // Click the Listen button
  await listenButton.click();
  
  // Wait for the button to change to Pause (using semantic ID)
  const pauseButton = page.locator('#listen-button');
  await expect(pauseButton).toBeVisible({ timeout: 3000 });
  await expect(pauseButton).toContainText('Pause');
  
  console.log('✓ Button changed to Pause');

  // Take a screenshot after clicking
  await page.screenshot({ path: 'tests/listen-pause-clicked.png', fullPage: true });

  // Now we need to wait for all 10 pages to flip through
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

  // Wait for all 10 pages to be seen
  // We'll check every 500ms for up to 2 minutes (should be plenty for audio)
  const maxWaitTime = 120000; // 2 minutes
  const checkInterval = 500;
  const startTime = Date.now();

  while (pagesSeen.size < 10 && (Date.now() - startTime) < maxWaitTime) {
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
          console.log(`✓ Page flipped from ${currentPageNum} to ${newPageNum}`);
          currentPageNum = newPageNum;
          pagesSeen.add(newPageNum);
          
          // Take a screenshot at each page transition
          await page.screenshot({ path: `tests/listen-page-${newPageNum}.png`, fullPage: true });
        }
      }
    }
  }

  // Verify we've seen all 10 pages
  expect(pagesSeen.size).toBe(10);
  console.log(`✓ Successfully flipped through all 10 pages: ${Array.from(pagesSeen).sort((a, b) => a - b).join(', ')}`);

  // Verify we're on the last page (page 10) by checking the image
  const finalImageSrc = await storyImage.getAttribute('src');
  expect(finalImageSrc).toContain('10.webp');
  console.log('✓ Ended on page 10');

  // Take a final screenshot
  await page.screenshot({ path: 'tests/listen-final.png', fullPage: true });

  // Verify the button is still visible (audio should still be playing or just finished)
  // The button might still say Pause or might have changed back to Listen if audio ended
  const audioButton = page.locator('#listen-button');
  await expect(audioButton).toBeVisible();
  const buttonText = await audioButton.textContent();
  expect(buttonText).toMatch(/Listen|Pause/);
  console.log(`✓ Audio button is still present (showing: ${buttonText?.trim()})`);
});

