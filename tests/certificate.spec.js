import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('User opens certificate and starts learning', async ({ page }) => {

  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  await page.getByRole('button', { name: 'Next Next' }).click();

  await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Next Next' }).click();

  const email = `test${Date.now()}@mail.com`;

  await page.getByRole('button', { name: 'Email Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');

  await page.locator('div').filter({ hasText: /^Next$/ }).nth(1).click();

  await page.getByRole('button', { name: 'Next Next' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();

  // wait until topics appear
  await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();

  await page.getByRole('button', { name: 'Introduction to Personal' }).click();
  await page.getByRole('button', { name: 'Crypto-Topic' }).click();
  await page.getByRole('button', { name: 'Tax Strategy' }).click();
  await page.getByRole('button', { name: 'Wealth Preservation' }).click();

  await page.getByRole('button', { name: 'Next Next' }).click();

  await page.getByText('I am a ....I am a').click();
  await page.getByText('Full-time Employee').click();

  await page.getByRole('button', { name: 'Next Next' }).click();

  await page.getByRole('button', { name: '-5 mins' }).click();
  await page.getByRole('button', { name: 'Done Next' }).click();

  // Open certificate
  const certificate = page.locator('.w-full > .flex-1').first();
  await certificate.waitFor({ state: 'visible' });
  await certificate.click();

  // Open certificate landing page
  await page.getByRole('button', { name: 'Play now!!' }).click();

  // Start the game
  await page.getByRole('button', { name: 'Play Play now' }).click();

  // Open first session
  await page.getByText('Play Quiz').click();

});