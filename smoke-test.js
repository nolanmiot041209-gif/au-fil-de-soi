const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@au-fil-de-soi.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    desktop.on('pageerror', (error) => errors.push(error.message));
    desktop.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await desktop.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await desktop.waitForSelector('[data-hero-title]');
    await desktop.screenshot({ path: path.join(OUT_DIR, 'home-desktop.png'), fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 900 }, isMobile: true });
    mobile.on('pageerror', (error) => errors.push(error.message));
    mobile.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await mobile.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await mobile.waitForSelector('[data-menu-button]');
    await mobile.click('[data-menu-button]');
    await mobile.screenshot({ path: path.join(OUT_DIR, 'home-mobile.png'), fullPage: true });

    if (ADMIN_PASSWORD) {
      await desktop.click('[data-open-admin]');
      await desktop.fill('[data-login-form] [name="email"]', ADMIN_EMAIL);
      await desktop.fill('[data-login-form] [name="password"]', ADMIN_PASSWORD);
      await desktop.click('[data-login-form] button[type="submit"]');
      await desktop.waitForSelector('[data-admin-workspace]:not([hidden])');
    }

    if (errors.length) {
      throw new Error(`Browser errors:\n${errors.join('\n')}`);
    }

    console.log('smoke ok');
    console.log(`desktop screenshot: ${path.join(OUT_DIR, 'home-desktop.png')}`);
    console.log(`mobile screenshot: ${path.join(OUT_DIR, 'home-mobile.png')}`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
