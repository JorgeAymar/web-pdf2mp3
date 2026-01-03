import { test, expect } from '@playwright/test';

test('UX Review', async ({ page }) => {
  // Go to the app (using port 5175 as per recent logs)
  await page.goto('http://localhost:5175');

  // 1. Check Initial Load and Title
  await expect(page).toHaveTitle('Lector PDF Inteligente');
  await expect(page.locator('h1')).toContainText('Lector de PDF');

  // 2. Check Upload Area
  const uploadCard = page.locator('.upload-card');
  await expect(uploadCard).toBeVisible();
  
  // Check hover state (visual check via screenshot)
  await uploadCard.hover();
  await page.screenshot({ path: 'ux_review_screenshots/01_upload_hover.png' });

  // 3. Accessibility Check for Buttons
  // Check if voice select exists
  // Voice select is only visible in Reader mode.
  // We can't easily test file upload interaction without a real file, 
  // but we can check if the basic structure is sound.
  
  // 4. Check responsiveness
  await page.setViewportSize({ width: 375, height: 667 }); // Mobile
  await page.screenshot({ path: 'ux_review_screenshots/02_mobile_view.png' });
  
  await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
  
  console.log("UX Review Completed");
});
