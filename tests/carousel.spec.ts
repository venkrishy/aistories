import { test, expect } from '@playwright/test'

test('carousel next button vertical position stability', async ({ page }) => {
  // Vite may run on 5173 or another port (e.g. 3001). Try 5173 first, then fallback.
  const baseUrls = ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000']
  let connected = false
  for (const url of baseUrls) {
    try {
      await page.goto(url, { timeout: 2000 })
      connected = true
      break
    } catch (e) {
      // try next
    }
  }
  if (!connected) throw new Error('Could not connect to dev server on expected ports')

  // wait for carousel to mount
  await page.waitForSelector('[data-slot="carousel"]')

  const next = page.locator('[data-slot="carousel-next"]')
  const prev = page.locator('[data-slot="carousel-previous"]')

  await expect(next).toBeVisible()

  // capture bounding box before clicking
  const box1 = await next.boundingBox()
  // take screenshot for visual evidence
  await page.screenshot({ path: 'tests/s1.png', fullPage: true })

  // click next
  await next.click()
  // small wait for layout to settle
  await page.waitForTimeout(600)

  const box2 = await next.boundingBox()
  await page.screenshot({ path: 'tests/s2.png', fullPage: true })

  // log difference for human reading in runner output
  // Use expect to assert positions are equal (or very close)
  if (box1 && box2) {
    const dy = Math.round((box2.y - box1.y) * 100) / 100
    console.log('next button y before:', box1.y, 'after:', box2.y, 'delta:', dy)
    expect(Math.abs(dy)).toBeLessThanOrEqual(1)
  } else {
    throw new Error('Could not determine bounding boxes for next button')
  }
})
