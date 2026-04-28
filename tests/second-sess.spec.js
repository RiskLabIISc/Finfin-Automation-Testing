// import { test, expect } from '@playwright/test';

// test.setTimeout(180000);

// test('User completes a full game session', async ({ page }) => {

//   await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

//   await page.getByRole('button', { name: 'Next Next' }).click();

//   await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
//   await page.getByRole('button', { name: 'Next Next' }).click();

//   const email = `test${Date.now()}@mail.com`;

//   await page.getByRole('button', { name: 'Email Email' }).click();
//   await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
//   await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
//   await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');

//   await page.locator('div').filter({ hasText: /^Next$/ }).nth(1).click();

//   await page.getByRole('button', { name: 'Next Next' }).click();
//   await page.getByRole('button', { name: 'Next Next' }).click();

//   // Wait until topics appear
//   await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();

//   await page.getByRole('button', { name: 'Introduction to Personal' }).click();
//   await page.getByRole('button', { name: 'Crypto-Topic' }).click();
//   await page.getByRole('button', { name: 'Tax Strategy' }).click();
//   await page.getByRole('button', { name: 'Wealth Preservation' }).click();

//   await page.getByRole('button', { name: 'Next Next' }).click();

//   await page.getByText('I am a ....I am a').click();
//   await page.getByText('Full-time Employee').click();

//   await page.getByRole('button', { name: 'Next Next' }).click();

//   await page.getByRole('button', { name: '-5 mins' }).click();
//   await page.getByRole('button', { name: 'Done Next' }).click();

//   // Open certificate
//   const certificate = page.locator('.w-full > .flex-1').first();
//   await certificate.waitFor({ state: 'visible' });
//   await certificate.click();

//   // Open certificate landing page
//   await page.getByRole('button', { name: 'Play now!!' }).click();

//   // Start game
//   await page.getByRole('button', { name: 'Play Play now' }).click();

//   // Open first session
//   await page.locator('div').filter({ hasText: /^Play Quiz$/ }).nth(2).click();

//   // Question 1
//   await page.getByRole('button', { name: /Less than ₹/ }).click();
//   await page.getByRole('button', { name: /Enter Next/ }).click();
//   await page.getByRole('button', { name: /Next/i }).click();

//   // Question 2
//   await page.getByRole('button', { name: /Exactly the same as/ }).click();
//   await page.getByRole('button', { name: /Enter Next/ }).click();
//   await page.getByRole('button', { name: /Next/i }).click();

//   // Question 3
//   await page.getByRole('button', { name: /Do not know/ }).click();
//   await page.getByRole('button', { name: /Enter Next/ }).click();

//   // Info popup
//   await page.getByRole('button', { name: /More Info/ }).first().click();
//   await page.getByRole('button', { name: /Close Info/ }).click();

//   // Continue
//   await page.getByRole('button', { name: /Next/i }).click();

//   // Level completion
//   await page.getByRole('button', { name: /Level Completed/i }).click();

// });









import { test, expect } from '@playwright/test';

test.setTimeout(180000);

test('User completes a full game session', async ({ page }) => {

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

  // Wait for topics
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

  // Open certificate page
  await page.getByRole('button', { name: 'Play now!!' }).click();

  // Start game
  await page.getByRole('button', { name: 'Play Play now' }).click();

  // Open quiz
  await page.locator('div').filter({ hasText: /^Play Quiz$/ }).nth(2).click();

  // ================================
  // QUIZ AUTOMATION LOOP
  // ================================

  while (true) {

    // Stop when level completed appears
    const levelCompleted = page.getByRole('button', { name: /Level Completed/i });

    if (await levelCompleted.isVisible().catch(() => false)) {
      await levelCompleted.click();
      break;
    }

    // Wait for options
    const options = page.locator('button').filter({
      hasText: /₹|same|know|Yes|No|Less|More|Exactly/i
    });

    if (await options.count() > 0) {
      await options.first().click();
    }

    // Click Enter
    const enterButton = page.getByRole('button', { name: /Enter/i });
    if (await enterButton.isVisible().catch(() => false)) {
      await enterButton.click();
    }

    // Handle More Info popup if it appears
    const moreInfo = page.getByRole('button', { name: /More Info/i });

    if (await moreInfo.isVisible().catch(() => false)) {
      await moreInfo.click();
      await page.getByRole('button', { name: /Close Info/i }).click();
    }

    // Click Next
    const nextButton = page.getByRole('button', { name: /Next/i });

    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
    }

  }

  // ================================
// OPEN SECOND SESSION
// ================================

// Wait until second session is visible
const secondSession = page.locator('div').filter({ hasText: /^Play Quiz$/ }).nth(3);

await secondSession.waitFor({ state: 'visible' });
await secondSession.click();
// ================================
// SECOND QUIZ AUTOMATION LOOP
// ================================

while (true) {

  const levelCompleted = page.getByRole('button', { name: /Level Completed/i });

  if (await levelCompleted.isVisible().catch(() => false)) {
    await levelCompleted.click();
    break;
  }

  const options = page.locator('button').filter({
    hasText: /₹|same|know|Yes|No|Less|More|Exactly/i
  });

  if (await options.count() > 0) {
    await options.first().click();
  }

  const enterButton = page.getByRole('button', { name: /Enter/i });

  if (await enterButton.isVisible().catch(() => false)) {
    await enterButton.click();
  }

  const moreInfo = page.getByRole('button', { name: /More Info/i });

  if (await moreInfo.isVisible().catch(() => false)) {
    await moreInfo.click();
    await page.getByRole('button', { name: /Close Info/i }).click();
  }

  const nextButton = page.getByRole('button', { name: /Next/i });

  if (await nextButton.isVisible().catch(() => false)) {
    await nextButton.click();
  }

}

});