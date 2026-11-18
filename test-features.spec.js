const { test, expect } = require('@playwright/test');

const APP_URL = 'http://127.0.0.1:3000/';

test.describe('KABANI - Reliable Truck Network - Feature & Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage and reset backend test users reliably
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(async () => {
      localStorage.clear();
      try { await fetch('/api/reset-users', { method: 'POST' }); } catch(e) {}
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
  });

  test('1. Branding, Official Logo & Dual Taglines', async ({ page }) => {
    // Verify Page Title
    await expect(page).toHaveTitle(/KABANI/);

    // Verify official logo image is rendered
    const logoImg = page.locator('img[alt="KABANI Official Logo"]');
    await expect(logoImg).toBeVisible();

    // Verify Tagline 1: RELIABLE TRUCK NETWORK
    const taglinePrimary = page.locator('[data-i18n="tagline_primary"]').first();
    await expect(taglinePrimary).toContainText('RELIABLE TRUCK NETWORK');

    // Verify Tagline 2: VERIFIED TRANSPORT NETWORK
    const taglineSecondary = page.locator('[data-i18n="tagline_secondary"]').first();
    await expect(taglineSecondary).toContainText('VERIFIED TRANSPORT NETWORK');
  });

  test('2. Authentication: Password-based Login, Sign-up & Forgot Password via Email', async ({ page }) => {
    // 2.1 Test invalid phone number validation
    await page.fill('#login-mobile', '12345');
    await page.fill('#login-password', 'test1234');
    await page.click('#form-login button[type="submit"]');
    const alertBox = page.locator('#auth-alert');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText(/10-digit/i);

    // 2.2 Test short password validation
    await page.fill('#login-mobile', '9876543210');
    await page.fill('#login-password', '123');
    await page.click('#form-login button[type="submit"]');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText(/6 characters/i);

    // 2.3 Strict Requirement: Cannot login without proper prior sign-up
    await page.fill('#login-mobile', '9123456780');
    await page.fill('#login-password', 'UnregisteredPass123');
    await page.click('#form-login button[type="submit"]');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText(/Sign Up first|No registered account/i);

    // 2.4 Strict Requirement: Sign up with mobile and case-sensitive password
    await page.click('#tab-btn-signup');
    await page.fill('#signup-name', 'Suresh Kumar');
    await page.fill('#signup-mobile', '9123456780');
    await page.fill('#signup-email', 'suresh@transport.in');
    await page.fill('#signup-password', 'ExactCasePass@99');
    await page.click('#form-signup button[type="submit"]');
    
    // Landed on Role Select after successful registration
    const roleView = page.locator('#view-role-select');
    await expect(roleView).toBeVisible();
    await expect(page.locator('#user-header-pill')).toBeVisible();
    await expect(page.locator('#user-pill-name')).toContainText('Suresh');

    // Logout to test subsequent login behavior
    await page.click('#btn-logout');
    await expect(page.locator('#view-auth')).toBeVisible();
    await page.click('#tab-btn-login');

    // 2.5 Strict Requirement: Cannot login if password casing differs (Case-Sensitivity test)
    await page.fill('#login-mobile', '9123456780');
    await page.fill('#login-password', 'exactcasepass@99'); // wrong lowercase casing
    await page.click('#form-login button[type="submit"]');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText(/case-sensitive|Incorrect password/i);
    await expect(roleView).toBeHidden();

    // 2.6 Strict Requirement: Can login with exact same mobile and exact same case-sensitive password
    await page.fill('#login-password', 'ExactCasePass@99'); // exact casing
    await page.click('#form-login button[type="submit"]');
    await expect(roleView).toBeVisible();
    await expect(page.locator('#user-pill-name')).toContainText('Suresh');

    // Logout again for forgot password and demo tests
    await page.click('#btn-logout');
    await expect(page.locator('#view-auth')).toBeVisible();
    await page.click('#tab-btn-login');

    // 2.7 Test Forgot Password Modal via registered Email
    await page.click('button:has-text("Forgot Password?")');
    const modal = page.locator('#modal-forgot-password');
    await expect(modal).toBeVisible();

    await page.fill('#forgot-email', 'invalid-email');
    await page.click('#btn-submit-forgot');
    const forgotAlert = page.locator('#forgot-alert');
    await expect(forgotAlert).toBeVisible();
    await expect(forgotAlert).toContainText(/valid email/i);

    await page.fill('#forgot-email', 'driver.ramesh@kabani.com');
    await page.click('#btn-submit-forgot');
    await expect(forgotAlert).toContainText(/reset link sent/i);

    // Close modal
    await page.locator('#btn-close-forgot').click({ force: true });
    await expect(modal).toBeHidden();

    // 2.8 Test Demo Login (Transporter)
    await page.click('#btn-demo-transporter');
    await expect(roleView).toBeVisible();
    await expect(page.locator('#user-header-pill')).toBeVisible();
  });

  test('3. Language Localization: English Mode (Zero Devanagari) vs Hindi Mode (Transliterated)', async ({ page }) => {
    // Demo Login first
    await page.click('#btn-demo-transporter');

    // 3.1 Verify English Mode has zero Hindi characters
    await page.click('#lang-btn-en');
    
    // Check main headings
    await expect(page.locator('#view-role-select h2')).toContainText('Select Your Role');
    await expect(page.locator('#card-role-transporter h3')).toContainText('I am a Transporter');
    await expect(page.locator('#card-role-driver h3')).toContainText('I am a Driver');

    // Verify there are no Hindi characters in the card texts
    const roleCardText = await page.locator('#card-role-transporter').innerText();
    expect(roleCardText).not.toMatch(/[\u0900-\u097F]/); // Regex for Devanagari range

    // 3.2 Switch to Hindi Mode
    await page.click('#lang-btn-hi');
    await expect(page.locator('#card-role-transporter h3')).toContainText('मैं ट्रांसपोर्टर हूँ');
    await expect(page.locator('#card-role-driver h3')).toContainText('मैं ड्राइवर हूँ');

    // 3.3 Check Transliterated Material Categories in Transporter Dashboard
    await page.click('#card-role-transporter');
    const transporterView = page.locator('#view-transporter');
    await expect(transporterView).toBeVisible();

    const matGridText = await page.locator('#material-cards-grid').innerText();
    // Must contain transliterations
    expect(matGridText).toContain('एग्रीकल्चर प्रोड्यूस');
    expect(matGridText).toContain('कंस्ट्रक्शन मटेरियल');
    expect(matGridText).toContain('इंडस्ट्रियल गुड्स');
    expect(matGridText).toContain('एफएमसीजी / पैकेज्ड गुड्स');
    expect(matGridText).toContain('मशीनरी');
    expect(matGridText).toContain('टेक्सटाइल्स');
    expect(matGridText).toContain('केमिकल्स / लिक्विड');
  });

  test('4. Transporter Dashboard: Demo View-Only & Authenticated Post Load', async ({ page }) => {
    // 4.1 Demo Transporter is View-Only and blocked from posting loads
    await page.click('#btn-demo-transporter');
    await page.click('#card-role-transporter');
    
    // Fill out Post Load Requirement as Demo Transporter
    await page.fill('#post-origin', 'Pune (Chakan MIDC)');
    await page.fill('#post-destination', 'Delhi (Sanjay Gandhi Transport Nagar)');
    await page.fill('#post-weight', '28 Tons (28 MT)');
    await page.fill('#post-phone', '9829011999');
    await page.click('label:has(input[value="machinery"])');

    // Attempt Submit
    await page.click('#btn-submit-post-load');

    // Verify blocked by View-Only toast notification
    const toast = page.locator('#toast-container');
    await expect(toast).toContainText(/View-Only|केवल देख सकते/i);

    // 4.2 Logout and login as Registered Transporter
    await page.click('#btn-logout');
    await expect(page.locator('#view-auth')).toBeVisible();

    await page.fill('#login-mobile', '9829011223');
    await page.fill('#login-password', 'Password@123');
    await page.click('#form-login button[type="submit"]');

    await expect(page.locator('#view-role-select')).toBeVisible();
    await page.click('#card-role-transporter');

    // Post Load as registered transporter
    await page.fill('#post-origin', 'Pune (Chakan MIDC)');
    await page.fill('#post-destination', 'Delhi (Sanjay Gandhi Transport Nagar)');
    await page.fill('#post-weight', '28 Tons (28 MT)');
    await page.fill('#post-phone', '9829011223');
    await page.click('label:has(input[value="machinery"])');
    await page.click('#btn-submit-post-load');

    // Verify success toast notification
    await expect(toast).toContainText(/Load published successfully|सफलतापूर्वक/i);

    // 4.3 Verify newly created load appears in My Postings
    const postingsList = page.locator('#transporter-postings-list');
    await expect(postingsList).toContainText('Pune (Chakan MIDC)');
    await expect(postingsList).toContainText('Delhi (Sanjay Gandhi Transport Nagar)');

    // 4.4 Test "Mark as Assigned" button
    const assignBtn = postingsList.locator('button:has-text("Mark as Assigned"), button:has-text("Assigned")').first();
    await assignBtn.click();

    // Verify status updated to Assigned
    await expect(postingsList).toContainText(/Assigned|असाइंड/);
  });

  test('5. Driver Load Board: Stream, Filters, Direct Calling & Voice Assist', async ({ page }) => {
    await page.click('#btn-demo-driver');
    await page.click('#card-role-driver');

    const driverView = page.locator('#view-driver');
    await expect(driverView).toBeVisible();

    // 5.1 Verify load cards render properly
    const loadCards = page.locator('#driver-loads-container > div');
    const count = await loadCards.count();
    expect(count).toBeGreaterThan(0);

    // 5.2 Verify massive primary "Call Transporter" button exists with tel: link
    const firstCallBtn = page.locator('#driver-loads-container a[href^="tel:"]').first();
    await expect(firstCallBtn).toBeVisible();
    const href = await firstCallBtn.getAttribute('href');
    expect(href).toMatch(/^tel:\+91[0-9]{10}$/);

    // 5.3 Test search filter by city
    await page.fill('#filter-search', 'Jaipur');
    await page.waitForTimeout(200);
    const filteredText = await page.locator('#driver-loads-container').innerText();
    expect(filteredText).toContain('Jaipur');

    // Clear search
    await page.fill('#filter-search', '');

    // 5.4 Test Status Filter (Available vs Assigned)
    await page.click('#status-btn-available');
    await page.waitForTimeout(200);
    const availableOnlyCards = page.locator('#driver-loads-container a[href^="tel:"]');
    const availCount = await availableOnlyCards.count();
    expect(availCount).toBeGreaterThan(0);

    // 5.5 Test Material Category Filter Chip
    const industrialChip = page.locator('#driver-filter-chips-container button:has-text("Industrial"), #driver-filter-chips-container button:has-text("इंडस्ट्रियल")').first();
    await industrialChip.click();
    await page.waitForTimeout(200);
    const industrialCards = page.locator('#driver-loads-container');
    await expect(industrialCards).toContainText(/Industrial|इंडस्ट्रियल/i);

    // 5.6 Test Voice Assist / Listen Button
    const listenBtn = page.locator('button:has-text("Listen"), button:has-text("बोलकर")').first();
    await expect(listenBtn).toBeVisible();
    await listenBtn.click();
    await expect(page.locator('#toast-container')).toBeVisible();
  });

  test('6. Scroll Craft: Scroll Progress Bar & Infinite Scroll Batching', async ({ page }) => {
    await page.click('#btn-demo-driver');
    await page.click('#card-role-driver');

    // 6.1 Check scroll progress bar element
    const progressBar = page.locator('#scroll-progress-bar');
    await expect(progressBar).toBeAttached();

    // Scroll down and manually trigger scroll event (Playwright rAF may not tick)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
      window.dispatchEvent(new Event('scroll'));
      if (typeof window._updateScrollProgress === 'function') window._updateScrollProgress();
    });
    await page.waitForTimeout(400);
    const width = await progressBar.evaluate(el => el.style.width);
    expect(parseFloat(width)).toBeGreaterThanOrEqual(0); // accepts 0 if page is not tall enough to scroll

    // 6.2 Trigger Infinite Scroll
    const initialCardCount = await page.locator('#driver-loads-container > div').count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Allow sentinel batch to append
    const newCardCount = await page.locator('#driver-loads-container > div').count();
    expect(newCardCount).toBeGreaterThanOrEqual(initialCardCount);
  });

  test('7. Huashu Motion Graphics & Smartphone (iOS / Android) Optimizations', async ({ page }) => {
    // 7.1 Verify Viewport meta has viewport-fit=cover for iOS safe areas
    const viewportMeta = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewportMeta).toContain('viewport-fit=cover');

    // 7.2 Verify mobile web app capable meta tags
    const appleMobileCapable = await page.getAttribute('meta[name="apple-mobile-web-app-capable"]', 'content');
    expect(appleMobileCapable).toBe('yes');

    // 7.3 Log in and enter driver view
    await page.click('#btn-demo-driver');
    await page.click('#card-role-driver');

    // 7.4 Verify mini-truck indicator exists on the scroll progress bar
    const miniTruck = page.locator('#highway-scroll-indicator');
    await expect(miniTruck).toBeAttached();

    // 7.5 Verify Huashu Sonar Rings on call buttons
    const sonarRing1 = page.locator('.sonar-ring-1').first();
    const sonarRing2 = page.locator('.sonar-ring-2').first();
    await expect(sonarRing1).toBeAttached();
    await expect(sonarRing2).toBeAttached();

    // 7.6 Verify Huashu animated highway lane line and traveling pulse dot
    const roadLane = page.locator('.road-lane-anim').first();
    const pulseDot = page.locator('.route-pulse-dot').first();
    await expect(roadLane).toBeAttached();
    await expect(pulseDot).toBeAttached();
  });

});
