// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('KABANI - Master Owner & Load Access Control Suite', () => {

  test('1. Master Owner Account: Sunil Gahlot (7231858636 / sunilgahlot0636@gmail.com) Universal Access', async ({ page }) => {
    // Test on Glassmorphism Edition
    await page.goto('/glass.html');

    // Check that Owner Demo button exists on auth card
    const btnOwner = page.locator('#btn-demo-owner');
    await expect(btnOwner).toBeVisible();
    await btnOwner.click();

    // Verify redirected to role select with owner badge in header
    await expect(page.locator('#view-role-select')).toBeVisible();
    const userPill = page.locator('#user-header-pill');
    await expect(userPill).toBeVisible();
    await expect(userPill).toContainText('Sunil Gahlot');
    await expect(userPill).toContainText('Owner');

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

  test('3. Classic Edition: Master Owner Sunil Gahlot & Access Controls', async ({ page }) => {
    await page.goto('/index.html');

    // Check that Owner Demo button exists on auth card
    const btnOwnerClassic = page.locator('#btn-demo-owner');
    await expect(btnOwnerClassic).toBeVisible();
    await btnOwnerClassic.click();

    // Verify redirected to role select with owner badge in header
    await expect(page.locator('#view-role-select')).toBeVisible();
    const userPill = page.locator('#user-header-pill');
    await expect(userPill).toBeVisible();
    await expect(userPill).toContainText('Sunil Gahlot');
    await expect(userPill).toContainText('Owner');

    // Owner selects Transporter view
    await page.click('#card-role-transporter');
    await expect(page.locator('#view-transporter')).toBeVisible();

    // Owner has active action controls on loads
    const markBtn = page.locator('button[onclick*="toggleLoadStatus(\'LOAD-701\')"]').first();
    await expect(markBtn).toBeVisible();
  });

});
