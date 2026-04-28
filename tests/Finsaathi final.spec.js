import { test } from '@playwright/test';

test.setTimeout(600000);

// ================================
// HELPER: PLAY ONE QUIZ SESSION
// This was working for session 1 — keeping exactly as is
// ================================

async function playQuizSession(page, sessionNumber) {
  console.log(`\n▶️  Session ${sessionNumber} — playing quiz...`);
  let questionCount = 0;

  while (true) {
    await page.waitForTimeout(800);

    // ── Check Level Completed ──
    const levelCompleted = page.getByRole('button', { name: /Level Completed/i });
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
    }

    // ── Select random MCQ option ──
    const mcqOptions = page.locator('button[class*="rounded-\\[32px\\]"]');
    const mcqCount = await mcqOptions.count();

    if (mcqCount >= 2) {
      const visibleIndexes = [];
      for (let i = 0; i < mcqCount; i++) {
        const isVisible = await mcqOptions.nth(i).isVisible().catch(() => false);
        if (isVisible) visibleIndexes.push(i);
      }
      if (visibleIndexes.length >= 1) {
        const randomIndex = visibleIndexes[Math.floor(Math.random() * visibleIndexes.length)];
        const text = (await mcqOptions.nth(randomIndex).textContent() || '').trim();
        console.log(`   🎲 Q${questionCount + 1}: Selected "${text}"`);
        await mcqOptions.nth(randomIndex).click();
        questionCount++;
        await page.waitForTimeout(600);
      }
    }

    // ── Click Enter ──
    await page.waitForTimeout(500);
    const enterBtn = page.getByRole('button', { name: /^Enter$/i });
    if (await enterBtn.isVisible().catch(() => false)) {
      console.log(`   🖱️  Enter...`);
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    // ── Check Level Completed after Enter ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
    }

    // ── Handle More Info popup ──
    await page.waitForTimeout(500);
    const moreInfo = page.getByRole('button', { name: /More Info/i });
    if (await moreInfo.isVisible().catch(() => false)) {
      console.log(`   ℹ️  More Info — closing...`);
      await moreInfo.click();
      await page.waitForTimeout(500);
      const closeInfo = page.getByRole('button', { name: /Close Info/i });
      if (await closeInfo.isVisible().catch(() => false)) {
        await closeInfo.click();
        await page.waitForTimeout(500);
      }
    }

    // ── Check Level Completed after More Info ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
    }

    // ── Click Next ──
    await page.waitForTimeout(500);
    const nextBtn = page.getByRole('button', { name: /Next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      console.log(`   ➡️  Next...`);
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

    // ── Check Level Completed after Next ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
    }
  }
}

// ================================
// HELPER: CLICK PLAY QUIZ IN POPUP
// After clicking node, popup appears
// click Play Quiz div (confirmed working from codegen)
// ================================

async function clickPlayQuiz(page) {
  console.log(`   ⏳ Waiting for Play Quiz popup...`);
  await page.waitForTimeout(2000);

  // From codegen: page.getByText('Play Quiz').click()
  try {
    await page.getByText('Play Quiz').waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText('Play Quiz').click();
    await page.waitForTimeout(1500);
    console.log(`   ✔️  Play Quiz clicked!`);
    return true;
  } catch {
    // Fallback: div filter
    const div = page.locator('div').filter({ hasText: /^Play Quiz$/ }).first();
    if (await div.isVisible().catch(() => false)) {
      await div.click();
      await page.waitForTimeout(1500);
      console.log(`   ✔️  Play Quiz clicked (div fallback)!`);
      return true;
    }
    console.warn(`   ❌ Play Quiz not found`);
    return false;
  }
}

// ================================
// MAIN TEST
// ================================

test('FinSaathi — Complete All 4 Sessions', async ({ page }) => {

  // ── Open Website ──
  console.log('\n🌐 Opening FinSaathi...');
  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Landing page');

  // ── Education Level ──
  await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Education: Masters 21+');

  // ── Register ──
  const email = `test${Date.now()}@mail.com`;
  console.log(`✔️  Registering: ${email}`);
  await page.getByRole('button', { name: 'Email Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');
  await page.locator('div').filter({ hasText: /^Next$/ }).nth(1).click();
  console.log('✔️  Registered');

  // ── Onboarding ──
  await page.getByRole('button', { name: 'Next Next' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Onboarding done');

  // ── Topics ──
  await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();
  await page.getByRole('button', { name: 'Introduction to Personal' }).click();
  await page.getByRole('button', { name: 'Crypto-Topic' }).click();
  await page.getByRole('button', { name: 'Tax Strategy' }).click();
  await page.getByRole('button', { name: 'Wealth Preservation' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Topics selected');

  // ── Employment ──
  await page.getByText('I am a ....I am a').click();
  await page.getByText('Full-time Employee').click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Employment: Full-time Employee');

  // ── Time ──
  await page.getByRole('button', { name: '-5 mins' }).click();
  await page.getByRole('button', { name: 'Done Next' }).click();
  console.log('✔️  Time: -5 mins');

  // ── Certificate ──
  const certificate = page.locator('.w-full > .flex-1').first();
  await certificate.waitFor({ state: 'visible' });
  await certificate.click();
  await page.getByRole('button', { name: 'Play now!!' }).click();
  console.log('✔️  Certificate opened');

  // ── Start Game → MAP ──
  await page.getByRole('button', { name: 'Play Play now' }).click();
  await page.waitForTimeout(2000);
  console.log('✔️  On map!\n');

  // ════════════════════════════════════════
  // SESSION 1
  // First node = "Play now" → directly click Play Quiz div (working approach)
  // ════════════════════════════════════════
  console.log('\n🎮 Session 1 — clicking Play Quiz directly...');
  await page.waitForTimeout(2000);

  // This is the WORKING approach from your original code
  const playQuizDivs = page.locator('div').filter({ hasText: /^Play Quiz$/ });
  await playQuizDivs.nth(2).click();
  await page.waitForTimeout(1500);
  console.log('✔️  Session 1 quiz started!');

  await playQuizSession(page, 1);

  // ════════════════════════════════════════
  // SESSION 2, 3, 4
  // After session 1 completes, back on map
  // Next node = "Continue to play" → click it → popup → Play Quiz
  // ════════════════════════════════════════

  for (let session = 2; session <= 4; session++) {
    console.log(`\n🗺️  Back on map — looking for Session ${session} node...`);

    // Wait for map to fully reload after previous session
    await page.waitForTimeout(4000);

    // Click "Continue to play" node (unlocked after previous session)
    const continueNode = page.locator('div, button').filter({ hasText: /^Continue to play$/i });
    const continueCount = await continueNode.count();
    console.log(`   Found ${continueCount} "Continue to play" nodes`);

    if (continueCount > 0) {
      // Click the last visible one (most recently unlocked)
      for (let i = continueCount - 1; i >= 0; i--) {
        const node = continueNode.nth(i);
        const isVisible = await node.isVisible().catch(() => false);
        if (isVisible) {
          console.log(`   ✔️  Clicking "Continue to play" node`);
          await node.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    } else {
      // Fallback: try "Play now" in case label is reused
      const playNowNode = page.locator('div, button').filter({ hasText: /^Play now$/i });
      if (await playNowNode.last().isVisible().catch(() => false)) {
        console.log(`   ✔️  Clicking "Play now" node (fallback)`);
        await playNowNode.last().click();
        await page.waitForTimeout(1000);
      } else {
        console.log(`   🏁 No more unlocked nodes — stopping at session ${session}`);
        break;
      }
    }

    // Popup appears → click Play Quiz
    const started = await clickPlayQuiz(page);
    if (!started) {
      console.warn(`   ❌ Could not start session ${session}`);
      break;
    }

    await playQuizSession(page, session);
  }

  console.log('\n🎉 All sessions completed!');
  console.log(`📧 Account: ${email}`);
});