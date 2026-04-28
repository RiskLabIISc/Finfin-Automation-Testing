import { test, expect } from '@playwright/test';

test('User can select Masters player group and proceed', async ({ page }) => {

  // Open application
  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  // Select language
  await page.getByText('English').click();

  // Click Next
  await page.getByRole('button', { name: /next/i }).click();

  // Verify player group page
  await expect(page.getByText('Choose your Player group')).toBeVisible();

  // Select Masters
  await page.getByText('Masters').click();

  // Click Next
  await page.getByRole('button', { name: /next/i }).click();

  // Verify signup page appears
  await expect(page.getByText('Let us create your profile')).toBeVisible();

});