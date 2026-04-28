import { test, expect } from '@playwright/test';

test('User can sign up using Email', async ({ page }) => {

  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  // Language
  await page.getByText('English').click();
  await page.getByRole('button', { name: /next/i }).click();

  // Player group
  await page.getByText('Masters').click();
  await page.getByRole('button', { name: /next/i }).click();

  // Wait for signup page
  await expect(page.getByText('Sign up using')).toBeVisible();

  // Click Email option
  await page.getByRole('button', { name: /Email/i }).click();

  // Fill signup form
  await page.locator('input[type="email"]').fill('testuser123@email.com');
  await page.locator('input[type="password"]').first().fill('1234567');
  await page.locator('input[type="password"]').nth(1).fill('1234567');

  // Next
  await page.getByRole('button', { name: /next/i }).click();

});