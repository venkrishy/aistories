// Extracts story content from a Gemini shared link.
// Navigates through all pages, extracts text from each,
// and saves the complete story data to a JSON file.
//
// Usage: node scripts/story-extractor.js <gemini-share-url> [output-file]
// Example: node scripts/story-extractor.js https://gemini.google.com/share/d80c813ca0bd my-story.json

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extracts story content from a Gemini shared link
 * @param {string} url - The Gemini share URL
 * @param {Object} options - Configuration options
 * @param {string} options.outputFile - Output JSON file path (default: story-data.json)
 * @param {number} options.maxPages - Maximum pages to extract (default: 20)
 * @param {boolean} options.headless - Run browser in headless mode (default: true)
 * @returns {Promise<Object>} The extracted story data
 */
export async function extractStory(url, options = {}) {
  const {
    outputFile = 'story-data.json',
    maxPages = 20,
    headless = true
  } = options;

  if (!url || !url.includes('gemini.google.com/share')) {
    throw new Error('Invalid Gemini share URL');
  }

  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { timeout: 60000 });

    // Wait for page to stabilize - don't require networkidle as it may timeout
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Take a debug screenshot
    await page.screenshot({ path: 'debug-gemini-page.png', fullPage: true });
    console.log('Debug screenshot saved: debug-gemini-page.png');

    // Try to extract the title from the page
    const title = await page.evaluate(() => {
      // Try various selectors for title
      const h1 = document.querySelector('h1');
      if (h1) return h1.innerText.trim();

      const titleEl = document.querySelector('title');
      if (titleEl) return titleEl.innerText.replace(' - Google Gemini', '').trim();

      return 'Untitled Story';
    });

    console.log(`Story title: ${title}`);

    const allPages = [];
    let pageNum = 0;
    let hasNextPage = true;

    while (hasNextPage && pageNum < maxPages) {
      // Extract text from paragraphs
      const pageData = await page.evaluate(() => {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        return paragraphs.map(p => p.innerText).join('\n').trim();
      });

      if (pageData) {
        allPages.push({
          page: pageNum + 1,
          text: pageData
        });
        console.log(`Extracted page ${pageNum + 1} (${pageData.length} chars)`);
      }

      pageNum++;

      // Try to find and click next button
      const nextButton = page.locator('[data-test-id="next-page-button"]');

      // Check if button exists and is enabled
      const isVisible = await nextButton.isVisible().catch(() => false);
      const isDisabled = await nextButton.getAttribute('disabled').catch(() => null);

      if (isVisible && isDisabled === null) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        // Button is disabled or not found - we're on the last page
        hasNextPage = false;
      }
    }

    const story = {
      title,
      sourceUrl: url,
      extractedAt: new Date().toISOString(),
      pageCount: allPages.length,
      pages: allPages
    };

    // Save to JSON
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(story, null, 2));
    console.log(`Story saved to: ${outputPath}`);

    return story;

  } finally {
    await browser.close();
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length > 0) {
  const url = args[0];
  const outputFile = args[1] || 'story-data.json';

  extractStory(url, { outputFile, headless: false })
    .then(story => {
      console.log(`Extracted ${story.pageCount} pages from "${story.title}"`);
    })
    .catch(err => {
      console.error('Extraction failed:', err.message);
      process.exit(1);
    });
} else if (process.argv[1] && process.argv[1].includes('story-extractor')) {
  console.log('Usage: node scripts/story-extractor.js <gemini-share-url> [output-file]');
  console.log('Example: node scripts/story-extractor.js https://gemini.google.com/share/d80c813ca0bd my-story.json');
}
