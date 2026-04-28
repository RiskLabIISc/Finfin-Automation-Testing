import { test, expect } from '@playwright/test';

test('User selects learning time and completes onboarding', async ({ page }) => {

  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  // Language
  await page.getByRole('button', { name: 'Next Next' }).click();

  // Player group
  await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Next Next' }).click();

  const email = `test${Date.now()}@mail.com`;

  // Signup
  await page.getByRole('button', { name: 'Email Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');
  await page.getByRole('button', { name: 'Next Next' }).click();

  // Topic selection
  await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();
  await page.getByRole('button', { name: 'Introduction to Personal' }).click();
  await page.getByRole('button', { name: 'Crypto-Topic' }).click();
  await page.getByRole('button', { name: 'Tax Strategy' }).click();
  await page.getByRole('button', { name: 'Wealth Preservation' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();

  // Profile setup
  await page.getByText('I am a ....I am a').click();
  await page.getByText('Full-time Employee').click();
  await page.getByRole('button', { name: 'Next Next' }).click();

  // Learning time selection
  await page.getByRole('button', { name: '-5 mins' }).click();

  // Complete onboarding
  await page.getByRole('button', { name: 'Done Next' }).click();

});