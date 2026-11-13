// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'test-features.spec.js',
  timeout: 30000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    channel: 'msedge', // Uses installed Microsoft Edge browser instantly
    viewport: { width: 390, height: 844 }, // Mobile viewport matching user's iPhone mockup
    trace: 'off'
  }
});
