import { test, expect } from '@playwright/test';

test('Debug Screenshot', async ({ page }) => {
  await page.goto('http://localhost:5175');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'frontend/debug_screenshot.png' });
  
  const content = await page.content();
  console.log('Page Content:', content);
});
