import path from 'node:path';
import { test, expect, chromium } from '@playwright/test';

const extensionPath = path.resolve(process.cwd());

test('loads the unpacked extension in Chromium', async () => {
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  try {
    const page = await context.newPage();

    await page.goto('chrome://extensions/');
    await expect(page.locator('body')).toContainText('CodinGame Pro Mode');
  } finally {
    await context.close();
  }
});
