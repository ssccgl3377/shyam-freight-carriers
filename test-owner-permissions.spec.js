// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('KABANI - Master Owner & Load Access Control Suite', () => {

  test('1. Master Owner Account: Secure Admin Login (mobile + password) & Universal Access', async ({ page }) => {
    // Test on Glassmorphism Edition
    await page.goto('/glass.html');

    // Check that the Admin Login button exists (not exposing owner name)
    const btnAdmin = page.locator('#btn-admin-login');
    await expect(btnAdmin).toBeVisible();
    await expect(btnAdmin).toContainText('Admin Login');

    // Click to open the secure owner login modal
    await btnAdmin.click();

    // Verify modal opened
    const modal = page.locator('#owner-login-modal');
    await expect(modal).toBeVisible();

    // Fill in the correct owner credentials
    await page.fill('#owner-mobile', '7231858636');
    await page.fill('#owner-password', 'Coronary@7');
    await page.locator('#owner-login-modal form').dispatchEvent('submit');

    // Wait for modal to close and navigate to role-select
    await expect(modal).toBeHidden({ timeout: 3000 });
    await expect(page.locator('#view-role-select')).toBeVisible();

    // Owner badge in header shows Admin (not the owner's real name)
    const userPill = page.locator('#user-header-pill');
    await expect(userPill).toBeVisible();
    await expect(userPill).toContainText('Admin');

    // Navigate to Transporter Dashboard as Owner
    await page.click('#card-role-transporter');
    await expect(page.locator('#view-transporter')).toBeVisible();

    // Owner should see and be able to toggle status on any load (e.g., LOAD-701)
    const toggleBtn701 = page.locator('button[onclick*="toggleLoadStatus(\'LOAD-701\')"]').first();
    await expect(toggleBtn701).toBeVisible();
    await toggleBtn701.click();
    await expect(page.locator('#toast-container')).toBeVisible();

    // Owner can seamlessly switch to Driver Board
    await page.click('button:has-text("View Driver Load Board")');
    await expect(page.locator('#view-driver')).toBeVisible();
  });

  test('2. Strict Load Ownership Protection: Non-creator cannot alter other users\' loads', async ({ page }) => {
    await page.goto('/glass.html');

    // Login as Ramesh Singh (Driver / Truck Owner - 9876543210)
    await page.click('#btn-demo-driver');
    await expect(page.locator('#view-role-select')).toBeVisible();

    // Navigate to Transporter Dashboard
    await page.click('#card-role-transporter');
    await expect(page.locator('#view-transporter')).toBeVisible();

    // LOAD-701 was posted by Rajesh Kumar (9829011223), so Ramesh Singh is NOT the creator
    // Attempting to invoke toggleLoadStatus on LOAD-701 should be blocked by access control
    await page.evaluate(() => {
      window.app.toggleLoadStatus('LOAD-701');
    });

    // Check toast shows Access Denied message
    const toast = page.locator('#toast-container');
    await expect(toast).toBeVisible();
    await expect(page.locator('#toast-message')).toContainText('Access Denied');
  });

  test('3. Owner Login Security: Wrong credentials are rejected', async ({ page }) => {
    await page.goto('/glass.html');

    // Open admin login modal
    await page.click('#btn-admin-login');
    const modal = page.locator('#owner-login-modal');
    await expect(modal).toBeVisible();

    // Try wrong credentials
    await page.fill('#owner-mobile', '9999999999');
    await page.fill('#owner-password', 'wrongpassword');
    await page.locator('#owner-login-modal form').dispatchEvent('submit');

    // Error message should appear, modal stays open
    await page.waitForTimeout(900);
    await expect(modal).toBeVisible();
    const errEl = page.locator('#owner-login-error');
    await expect(errEl).toBeVisible();
    await expect(errEl).toContainText('Access denied');

    // Now close with Escape key
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

});
