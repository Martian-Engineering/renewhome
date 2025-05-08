// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CloudWatch Integration', () => {
  test('should load environment variables', async ({ page }) => {
    // Create a promise to check for CloudWatch initialization
    const loggerPromise = page.waitForFunction(() => {
      return window.logSlideNavigation !== undefined && 
             window.logUserInteraction !== undefined;
    }, { timeout: 5000 });
    
    // Navigate to a slide
    await page.goto('/slides/introduction');
    
    // Wait for the logger to be initialized
    await loggerPromise;
    
    // Check console for any logger errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('CloudWatch')) {
        errors.push(msg.text());
      }
    });
    
    // Perform a navigation action
    await page.keyboard.press('ArrowRight');
    
    // Wait for any potential console errors
    await page.waitForTimeout(1000);
    
    // Verify no CloudWatch errors were logged
    expect(errors).toHaveLength(0);
  });
});