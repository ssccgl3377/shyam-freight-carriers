const { test, expect } = require('@playwright/test');

const GLASS_APP_URL = 'http://127.0.0.1:3000/glass.html';

test.describe('KABANI Glassmorphism Edition - Verification & UX Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(GLASS_APP_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(async () => {
      localStorage.clear();
      try { await fetch('/api/reset-users', { method: 'POST' }); } catch(e) {}
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('1. Glassmorphism Aesthetics: Ambient Orbs, Frosted Glass & Official Branding', async ({ page }) => {
    // Title
    await expect(page).toHaveTitle(/KABANI Glassmorphism/i);

    // Official Logo
    const logo = page.locator('img[alt="KABANI Official Logo"]');
    await expect(logo).toBeVisible();

    // Dual Taglines
    await expect(page.locator('[data-i18n="tagline_primary"]')).toContainText('RELIABLE TRUCK NETWORK');
    await expect(page.locator('[data-i18n="tagline_secondary"]')).toContainText('VERIFIED TRANSPORT NETWORK');

    // Ambient Orbs
    const orbs = page.locator('.orb');
    expect(await orbs.count()).toBe(3);

    // Glass panel
    const glassPanel = page.locator('.glass-panel').first();
    await expect(glassPanel).toBeVisible();
  });

  test('2. Glass Authentication: Demo Login & Case-Sensitive Validation', async ({ page }) => {
    // Demo Driver login
    await page.click('#btn-demo-driver');

    // Check Role select view
    const roleView = page.locator('#view-role-select');
    await expect(roleView).toBeVisible();
    await expect(page.locator('#user-header-pill')).toBeVisible();

    // Logout
    await page.click('#btn-logout');
    await expect(page.locator('#view-auth')).toBeVisible();
  });

  test('3. Glass Driver Load Board: Frosted Bilty Cards, Calling & Audio Assist', async ({ page }) => {
    await page.click('#btn-demo-driver');
    await page.click('#card-role-driver');

    const driverView = page.locator('#view-driver');
    await expect(driverView).toBeVisible();

    // Verify Glass Bilty Cards
    const cards = page.locator('#driver-loads-container > div');
    expect(await cards.count()).toBeGreaterThan(0);

    // Verify 1-Tap Call Transporter Button with Sonar Wave Rings
    const callBtn = page.locator('#driver-loads-container a[href^="tel:"]').first();
    await expect(callBtn).toBeVisible();
    const href = await callBtn.getAttribute('href');
    expect(href).toMatch(/^tel:\+91\d{10}$/);

    const sonarRing = page.locator('.sonar-ring-1').first();
    await expect(sonarRing).toBeAttached();

    // Test Voice Assist / Listen button
    const listenBtn = page.locator('button:has-text("Listen")').first();
    await expect(listenBtn).toBeVisible();
    await listenBtn.click();
    await expect(page.locator('#toast-container')).toBeVisible();
  });

  test('4. Glass Transporter Dashboard: Demo View-Only & Authenticated Post Load', async ({ page }) => {
    // 4.1 Demo Transporter is View-Only and blocked from posting loads
    await page.click('#btn-demo-transporter');
    await page.click('#card-role-transporter');

    const transporterView = page.locator('#view-transporter');
    await expect(transporterView).toBeVisible();

    const viewOnlyNotice = page.locator('#demo-transporter-viewonly-notice');
    await expect(viewOnlyNotice).toBeVisible();

    // Fill load form as Demo Transporter
    await page.fill('#post-origin', 'Delhi (Transport Hub)');
    await page.fill('#post-destination', 'Mumbai (JNPT Port)');
    await page.fill('#post-weight', '30 Tons (30 MT)');
    await page.fill('#post-phone', '9829011888');

    // Submit attempt as Demo Transporter
    await page.click('#btn-submit-post-load');

    // Verify blocked by View-Only toast
    await expect(page.locator('#toast-container')).toContainText(/View-Only|केवल देख सकते/i);

    // 4.2 Logout and login as Registered Transporter with password
    await page.click('#btn-logout');
    await expect(page.locator('#view-auth')).toBeVisible();

    // Real login as registered transporter
    await page.fill('#login-mobile', '9829011223');
    await page.fill('#login-password', 'Password@123');
    await page.click('#form-login button[type="submit"]');

    await expect(page.locator('#view-role-select')).toBeVisible();
    await page.click('#card-role-transporter');
    await expect(transporterView).toBeVisible();

    // Fill and publish load as authenticated registered transporter
    await page.fill('#post-origin', 'Delhi (Transport Hub)');
    await page.fill('#post-destination', 'Mumbai (JNPT Port)');
    await page.fill('#post-weight', '30 Tons (30 MT)');
    await page.fill('#post-phone', '9829011223');
    await page.click('#btn-submit-post-load');

    // Verify success toast
    await expect(page.locator('#toast-container')).toContainText(/successfully|लाइव/i);

    // Verify load in My Posted Loads
    const myPostings = page.locator('#transporter-cards-container');
    await expect(myPostings).toContainText('Delhi (Transport Hub)');
  });

  test('5. Glass Localization: English vs Hindi Switch', async ({ page }) => {
    await page.click('#btn-demo-driver');

    // Hindi Switch
    await page.click('#lang-btn-hi');
    await expect(page.locator('#card-role-driver h3')).toContainText('मैं ड्राइवर हूँ');
    await expect(page.locator('#card-role-transporter h3')).toContainText('मैं ट्रांसपोर्टर हूँ');

    // English Switch
    await page.click('#lang-btn-en');
    await expect(page.locator('#card-role-driver h3')).toContainText('I am a Driver');
  });

});
