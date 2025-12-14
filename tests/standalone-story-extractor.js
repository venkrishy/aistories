// Extracts story content from a Gemini shared link.
// Navigates through all pages, extracts text from each,
// and saves the complete story data to a JSON file.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://gemini.google.com/share/5b555f55e29d');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const allPages = [];
  
  for (let i = 0; i < 12; i++) {
    // Extract text from paragraphs
    const pageData = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('p'));
      return paragraphs.map(p => p.innerText).join('\n').trim();
    });
    
    allPages.push({
      page: i + 1,
      
      text: pageData
    });
    
    console.log(`Extracted page ${i + 1}`);
    
    // Click next if not last page
    if (i < 11) {
      const nextBtn = await page.locator('button').nth(3); // Adjust selector as needed
      await nextBtn.click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Save to JSON
  const story = {
    title: "The Magical Sword and the Clever Sailor",
    author: "Google Gemini",
    pages: allPages
  };
  
  fs.writeFileSync('story-data.json', JSON.stringify(story, null, 2));
  
  await browser.close();
  console.log('✓ Story extracted and saved');
})();