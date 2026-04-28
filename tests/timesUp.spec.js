import { test } from '@playwright/test';

test.setTimeout(1800000); // 30 minutes

// ================================
// HELPER: CHECK GAME OVER
// Detects "Times up!!" popup (current)
// and future lifeline-out popup
// ================================

async function isGameOver(page) {
  const gameOverPatterns = [
    // Current: exact text from screenshot
    /Times up!!/i,
    /Times up/i,
    // Future lifeline patterns (developer said wording may change)
    /out of lives/i,
    /no lives left/i,
    /no more lives/i,
    /out of lifeline/i,
    /no lifeline/i,
    /lifelines? (over|ended|finished|ran out)/i,
    /game over/i,
    /session (over|ended)/i,
    /come back (tomorrow|later)/i,
    /daily limit/i,
  ];

  for (const pattern of gameOverPatterns) {
    const el = page.getByText(pattern).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent() || '').trim();
      console.log(`\n⛔ GAME OVER detected: "${text}"`);

      // Click Back button to close popup gracefully
      await page.waitForTimeout(1000);
      const backBtn = page.getByRole('button', { name: /^Back$/i });
      if (await backBtn.isVisible().catch(() => false)) {
        console.log('   ↩️  Clicking Back to exit...');
        await backBtn.click();
        await page.waitForTimeout(2000);
      }

      return true;
    }
  }

  return false;
}

// ================================
// HELPER: PLAY ONE QUIZ SESSION
// ================================

async function playQuizSession(page, chapterNumber, sessionNumber) {
  console.log(`   ▶️  Chapter ${chapterNumber} / Session ${sessionNumber} — playing...`);
  let questionCount = 0;

  while (true) {
    await page.waitForTimeout(800);

    // ── Check Game Over ──
    if (await isGameOver(page)) return 'gameover';

    // ── Check Level Completed ──
    const levelCompleted = page.getByRole('button', { name: /Level Completed/i });
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
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
        console.log(`      🎲 Q${questionCount + 1}: "${text}"`);
        await mcqOptions.nth(randomIndex).click();
        questionCount++;
        await page.waitForTimeout(600);
      }
    }

    // ── Click Enter ──
    await page.waitForTimeout(500);
    if (await isGameOver(page)) return 'gameover';
    const enterBtn = page.getByRole('button', { name: /^Enter$/i });
    if (await enterBtn.isVisible().catch(() => false)) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    // ── Check after Enter ──
    if (await isGameOver(page)) return 'gameover';
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }

    // ── Handle More Info popup ──
    await page.waitForTimeout(500);
    const moreInfo = page.getByRole('button', { name: /More Info/i });
    if (await moreInfo.isVisible().catch(() => false)) {
      await moreInfo.click();
      await page.waitForTimeout(500);
      const closeInfo = page.getByRole('button', { name: /Close Info/i });
      if (await closeInfo.isVisible().catch(() => false)) {
        await closeInfo.click();
        await page.waitForTimeout(500);
      }
    }

    // ── Check after More Info ──
    if (await isGameOver(page)) return 'gameover';
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }

    // ── Click Next ──
    await page.waitForTimeout(500);
    const nextBtn = page.getByRole('button', { name: /Next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

    // ── Check after Next ──
    if (await isGameOver(page)) return 'gameover';
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }
  }
}

// ================================
// HELPER: CLICK PLAY QUIZ IN POPUP
// ================================

async function clickPlayQuiz(page) {
  await page.waitForTimeout(2000);
  try {
    await page.getByText('Play Quiz').waitFor({ state: 'visible', timeout: 8000 });
    await page.getByText('Play Quiz').click();
    await page.waitForTimeout(1500);
    console.log(`   ✔️  Play Quiz clicked!`);
    return true;
  } catch {
    const div = page.locator('div').filter({ hasText: /^Play Quiz$/ }).first();
    if (await div.isVisible().catch(() => false)) {
      await div.click();
      await page.waitForTimeout(1500);
      console.log(`   ✔️  Play Quiz clicked (fallback)!`);
      return true;
    }
    console.warn(`   ❌ Play Quiz not found`);
    return false;
  }
}

// ================================
// HELPER: CLICK UNLOCKED NODE ON MAP
// ================================

async function clickUnlockedNode(page) {
  await page.waitForTimeout(3000);

  const nodeLabels = [
    /^Play now$/i,
    /^Continue to play$/i,
    /^Continue$/i,
    /^Resume$/i,
  ];

  for (const label of nodeLabels) {
    const nodes = page.locator('div, button').filter({ hasText: label });
    const count = await nodes.count();
    if (count === 0) continue;

    for (let i = count - 1; i >= 0; i--) {
      const node = nodes.nth(i);
      const isVisible = await node.isVisible().catch(() => false);
      if (!isVisible) continue;
      const text = (await node.textContent() || '').trim();
      console.log(`   ✔️  Clicking node: "${text}"`);
      await node.click();
      await page.waitForTimeout(1000);
      return true;
    }
  }

  return false;
}

// ================================
// HELPER: HANDLE CONSTELLATION SCREEN
// ================================

async function handleConstellationScreen(page) {
  await page.waitForTimeout(2000);

  const constellationText = page.getByText(/completed this chapter/i);
  if (await constellationText.isVisible().catch(() => false)) {
    console.log('\n   🌟 Constellation screen!');

    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="give" i]');
    if (await nameInput.isVisible().catch(() => false)) {
      const randomName = `Star${Date.now().toString().slice(-4)}`;
      await nameInput.fill(randomName);
      console.log(`   ✏️  Named: "${randomName}"`);
      await page.waitForTimeout(1000);
    }

    const beginBtn = page.getByRole('button', { name: /Begin new Chapter/i });
    if (await beginBtn.isVisible().catch(() => false)) {
      console.log('   🚀  Begin new Chapter!');
      await beginBtn.click();
      await page.waitForTimeout(3000);
      return true;
    }
  }

  return false;
}

// ================================
// HELPER: PLAY ALL SESSIONS IN ONE CHAPTER
// ================================

async function playAllSessionsInChapter(page, chapterNumber) {
  console.log(`\n📖 ══════ CHAPTER ${chapterNumber} ══════`);
  let sessionNumber = 1;

  while (true) {
    console.log(`\n   🗺️  Looking for Session ${sessionNumber} node...`);

    if (await isGameOver(page)) return 'gameover';

    // Session 1 of Chapter 1: direct Play Quiz div (working approach)
    if (sessionNumber === 1 && chapterNumber === 1) {
      await page.waitForTimeout(2000);
      const playQuizDivs = page.locator('div').filter({ hasText: /^Play Quiz$/ });
      const count = await playQuizDivs.count();
      if (count > 2) {
        await playQuizDivs.nth(2).click();
        await page.waitForTimeout(1500);
        console.log('   ✔️  Session 1 quiz opened!');
      } else {
        const nodeClicked = await clickUnlockedNode(page);
        if (!nodeClicked) return 'done';
        const started = await clickPlayQuiz(page);
        if (!started) return 'done';
      }
    } else {
      const nodeClicked = await clickUnlockedNode(page);
      if (!nodeClicked) {
        console.log(`   🏁 No more nodes in Chapter ${chapterNumber}`);
        break;
      }
      if (await isGameOver(page)) return 'gameover';
      const started = await clickPlayQuiz(page);
      if (!started) break;
    }

    // Play the session
    const result = await playQuizSession(page, chapterNumber, sessionNumber);
    if (result === 'gameover') return 'gameover';

    sessionNumber++;

    // Check for constellation after each session
    const constellationHandled = await handleConstellationScreen(page);
    if (constellationHandled) {
      console.log(`\n   🎊 Chapter ${chapterNumber} fully completed!`);
      return 'done';
    }
  }

  // Final constellation check
  const constellationHandled = await handleConstellationScreen(page);
  if (constellationHandled) {
    console.log(`\n   🎊 Chapter ${chapterNumber} fully completed!`);
    return 'done';
  }

  return 'done';
}

// ================================
// MAIN TEST
// ================================

test('FinSaathi — Complete All Chapters & Sessions', async ({ page }) => {

  console.log('\n🌐 Opening FinSaathi...');
  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Landing page');

  await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Education: Masters 21+');

  const email = `test${Date.now()}@mail.com`;
  console.log(`✔️  Registering: ${email}`);
  await page.getByRole('button', { name: 'Email Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');
  await page.locator('div').filter({ hasText: /^Next$/ }).nth(1).click();
  console.log('✔️  Registered');

  await page.getByRole('button', { name: 'Next Next' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Onboarding done');

  await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();
  await page.getByRole('button', { name: 'Introduction to Personal' }).click();
  await page.getByRole('button', { name: 'Crypto-Topic' }).click();
  await page.getByRole('button', { name: 'Tax Strategy' }).click();
  await page.getByRole('button', { name: 'Wealth Preservation' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Topics selected');

  await page.getByText('I am a ....I am a').click();
  await page.getByText('Full-time Employee').click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  console.log('✔️  Employment: Full-time Employee');

  await page.getByRole('button', { name: '-5 mins' }).click();
  await page.getByRole('button', { name: 'Done Next' }).click();
  console.log('✔️  Time: -5 mins');

  const certificate = page.locator('.w-full > .flex-1').first();
  await certificate.waitFor({ state: 'visible' });
  await certificate.click();
  await page.getByRole('button', { name: 'Play now!!' }).click();
  console.log('✔️  Certificate opened');

  await page.getByRole('button', { name: 'Play Play now' }).click();
  await page.waitForTimeout(2000);
  console.log('✔️  On map!\n');

  // ════════════════════════════════════════
  // LOOP THROUGH ALL CHAPTERS
  // ════════════════════════════════════════

  let chapterNumber = 1;
  const MAX_CHAPTERS = 20;

  while (chapterNumber <= MAX_CHAPTERS) {
    const result = await playAllSessionsInChapter(page, chapterNumber);

    if (result === 'gameover') {
      console.log(`\n⛔ Game over after Chapter ${chapterNumber}`);
      console.log('ℹ️  Time/lifelines ran out — test stopped gracefully');
      break;
    }

    chapterNumber++;
    console.log(`\n➡️  Moving to Chapter ${chapterNumber}...`);
    await page.waitForTimeout(3000);
  }

  console.log(`\n🎉 Test finished! Completed ${chapterNumber - 1} chapter(s)`);
  console.log(`📧 Account: ${email}`);
});