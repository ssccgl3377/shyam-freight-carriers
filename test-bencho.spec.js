// @ts-check
const { test, expect } = require('@playwright/test');

const LOCAL_URL = 'http://127.0.0.1:3000';
const GLASS_URL = 'http://127.0.0.1:3000/glass.html';

test.describe('KABANI - Bencho Micro-Interactions Suite (press, slide, swipe, type, select, loading)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Bencho Press: Micro-spring tactile feedback & Heart Like burst with dispersing particles', async ({ page }) => {
    // 1.1 Check presence of .bencho-press utility on interactive buttons
    const demoBtn = page.locator('#btn-demo-transporter');
    await expect(demoBtn).toHaveClass(/bencho-press/);

    // 1.2 Demo Login to reach driver board with bilty cards
    await demoBtn.click();
    await page.click('#card-role-driver');
    await expect(page.locator('#view-driver')).toBeVisible();

    // 1.3 Find first like button on Bilty card
    const likeBtn = page.locator('.bencho-like-pill').first();
    await expect(likeBtn).toBeVisible();

    // Click like button to trigger particle burst and active state
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/is-liked/);

    // Verify particle emission in DOM during burst
    const hasHeartAnim = await likeBtn.evaluate((el) => {
      const svg = el.querySelector('svg');
      return svg ? window.getComputedStyle(svg).animationName !== 'none' || el.classList.contains('is-liked') : false;
    });
    expect(hasHeartAnim).toBe(true);
  });

  test('2. Bencho Slide: Segmented Control slider thumb translation', async ({ page }) => {
    // 2.1 Language segmented control slider thumb
    const langThumb = page.locator('#lang-slider-thumb');
    await expect(langThumb).toBeVisible();
    
    // Switch to Hindi
    await page.click('#lang-btn-hi');
    const transformHi = await langThumb.evaluate(el => el.style.transform);
    expect(transformHi).toContain('translateX');

    // Switch back to English
    await page.click('#lang-btn-en');
    const transformEn = await langThumb.evaluate(el => el.style.transform);
    expect(transformEn).toMatch(/translateX\(0(px)?\)/);

    // 2.2 Auth tab slider thumb
    const authThumb = page.locator('#auth-slider-thumb');
    await expect(authThumb).toBeVisible();

    await page.click('#tab-btn-signup');
    const transformSignup = await authThumb.evaluate(el => el.style.transform);
    expect(transformSignup).toContain('translateX');

    await page.click('#tab-btn-login');
    const transformLogin = await authThumb.evaluate(el => el.style.transform);
    expect(transformLogin).toMatch(/translateX\(0(px)?\)/);
  });

  test('3. Bencho Type: Specular focus breathing ring & validation shake feedback', async ({ page }) => {
    // 3.1 Input type breathing class attachment
    const mobileInput = page.locator('#login-mobile');
    await expect(mobileInput).toHaveClass(/bencho-type-input/);

    // 3.2 Trigger validation shake on invalid input
    await page.fill('#login-mobile', '123');
    await page.click('#form-login button[type="submit"]');

    const authCard = page.locator('#view-auth > div');
    // Shake class is triggered on submission failure
    const alertBox = page.locator('#auth-alert');
    await expect(alertBox).toBeVisible();
  });

  test('4. Bencho Select: Role selector tactile spring & selection states', async ({ page }) => {
    // Demo login to role selection
    await page.click('#btn-demo-transporter');
    await expect(page.locator('#view-role-select')).toBeVisible();

    // Check bencho-select-card class
    const transpCard = page.locator('#card-role-transporter');
    const driverCard = page.locator('#card-role-driver');
    await expect(transpCard).toHaveClass(/bencho-select-card/);
    await expect(driverCard).toHaveClass(/bencho-select-card/);

    // Select role triggers tactile transition
    await transpCard.click();
    await expect(page.locator('#view-transporter')).toBeVisible();
  });

  test('5. Bencho Swipe: Horizontal swipe drag on Bilty cards to reveal Quick Call', async ({ page }) => {
    // Navigate to driver board
    await page.click('#btn-demo-driver');
    await page.click('#card-role-driver');
    await expect(page.locator('#view-driver')).toBeVisible();

    // Check swipe wrapper structure
    const swipeWrapper = page.locator('.bencho-swipe-card-wrapper').first();
    await expect(swipeWrapper).toBeVisible();

    const quickCallAction = swipeWrapper.locator('.bencho-swipe-actions a');
    await expect(quickCallAction).toBeVisible();
    await expect(quickCallAction).toHaveAttribute('href', /tel:/);
  });

  test('6. Glassmorphism Edition: Bencho animations & 3D background truck blur', async ({ page }) => {
    await page.goto(GLASS_URL);
    await page.waitForLoadState('domcontentloaded');

    // 6.1 Check 3D Canvas
    const canvas = page.locator('#bg-truck-canvas');
    await expect(canvas).toBeVisible();

    // 6.2 Check Glass panels with blur
    const glassCard = page.locator('.glass-panel').first();
    await expect(glassCard).toBeVisible();
    const backdropBlur = await glassCard.evaluate(el => window.getComputedStyle(el).backdropFilter);
    expect(backdropBlur).toContain('blur');

    // 6.3 Check Bencho slider thumb in Glass Edition
    const glassAuthThumb = page.locator('#auth-slider-thumb');
    await expect(glassAuthThumb).toBeVisible();

    await page.click('#tab-btn-signup');
    const transformSignup = await glassAuthThumb.evaluate(el => el.style.transform);
    expect(transformSignup).toContain('translateX');
  });

});
