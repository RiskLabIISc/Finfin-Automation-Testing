import { test, expect } from '@playwright/test';

test('User can proceed after selecting language', async ({ page }) => {

  // Open application
  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  // Verify language page
  await expect(page.getByText('What language do you prefer?')).toBeVisible();

  // Select language (English is default but we click anyway)
  await page.getByText('English').click();

  // Click Next
  await page.getByRole('button', { name: /next/i }).click();

  // Verify Player Group page opened
  await expect(page.getByText('Choose your Player group')).toBeVisible();

});