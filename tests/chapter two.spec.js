import { test } from '@playwright/test';

test.setTimeout(1800000); // 30 minutes — enough for all chapters

// ================================
// HELPER: PLAY ONE QUIZ SESSION
// Flow: Select option → Enter → feedback → Next → repeat
// Until Level Completed appears
// ================================

async function playQuizSession(page, chapterNumber, sessionNumber) {
  console.log(`   ▶️  Chapter ${chapterNumber} / Session ${sessionNumber} — playing...`);
  let questionCount = 0;

  while (true) {
    await page.waitForTimeout(800);

    // ── Check Level Completed ──
    const levelCompleted = page.getByRole('button', { name: /Level Completed/i });
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
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
        console.log(`      🎲 Q${questionCount + 1}: "${text}"`);
        await mcqOptions.nth(randomIndex).click();
        questionCount++;
        await page.waitForTimeout(600);
      }
    }

    // ── Click Enter ──
    await page.waitForTimeout(500);
    const enterBtn = page.getByRole('button', { name: /^Enter$/i });
    if (await enterBtn.isVisible().catch(() => false)) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    // ── Check Level Completed after Enter ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
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

    // ── Check Level Completed after More Info ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
    }

    // ── Click Next ──
    await page.waitForTimeout(500);
    const nextBtn = page.getByRole('button', { name: /Next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

    // ── Check Level Completed after Next ──
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return true;
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
// Returns true if a node was found and clicked
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
// After all sessions in a chapter:
//   1. Type a name
//   2. Click "Begin new Chapter!"
// Returns true if constellation was handled
// ================================

async function handleConstellationScreen(page) {
  await page.waitForTimeout(2000);

  const constellationText = page.getByText(/completed this chapter/i);
  if (await constellationText.isVisible().catch(() => false)) {
    console.log('\n   🌟 Constellation screen — naming it...');

    // Type name in input
    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="give" i]');
    if (await nameInput.isVisible().catch(() => false)) {
      const randomName = `Star${Date.now().toString().slice(-4)}`;
      await nameInput.fill(randomName);
      console.log(`   ✏️  Named: "${randomName}"`);
      await page.waitForTimeout(1000);
    }

    // Click Begin new Chapter!
    const beginBtn = page.getByRole('button', { name: /Begin new Chapter/i });
    if (await beginBtn.isVisible().catch(() => false)) {
      console.log('   🚀  Clicking "Begin new Chapter!"');
      await beginBtn.click();
      await page.waitForTimeout(3000);
      return true;
    }
  }

  return false;
}

// ================================
// HELPER: PLAY ALL SESSIONS IN ONE CHAPTER
// Keeps clicking nodes and playing until no more nodes
// Then handles constellation screen
// ================================

async function playAllSessionsInChapter(page, chapterNumber) {
  console.log(`\n📖 ══════ CHAPTER ${chapterNumber} ══════`);
  let sessionNumber = 1;

  while (true) {
    console.log(`\n   🗺️  Looking for Session ${sessionNumber} node...`);

    // Session 1: use working direct approach
    if (sessionNumber === 1 && chapterNumber === 1) {
      await page.waitForTimeout(2000);
      const playQuizDivs = page.locator('div').filter({ hasText: /^Play Quiz$/ });
      const count = await playQuizDivs.count();
      if (count > 2) {
        await playQuizDivs.nth(2).click();
        await page.waitForTimeout(1500);
        console.log('   ✔️  Session 1 quiz opened directly!');
      } else {
        // Fallback to node click
        const nodeClicked = await clickUnlockedNode(page);
        if (!nodeClicked) break;
        const started = await clickPlayQuiz(page);
        if (!started) break;
      }
    } else {
      // All other sessions: click node → Play Quiz popup
      const nodeClicked = await clickUnlockedNode(page);
      if (!nodeClicked) {
        console.log(`   🏁 No more nodes in Chapter ${chapterNumber}`);
        break;
      }
      const started = await clickPlayQuiz(page);
      if (!started) break;
    }

    // Play the quiz session
    await playQuizSession(page, chapterNumber, sessionNumber);
    sessionNumber++;

    // After each session check if constellation appeared
    // (it appears after the LAST session of a chapter)
    const constellationHandled = await handleConstellationScreen(page);
    if (constellationHandled) {
      console.log(`\n   🎊 Chapter ${chapterNumber} fully completed!`);
      return true; // Chapter done — move to next chapter
    }
  }

  // Check constellation one more time after loop ends
  const constellationHandled = await handleConstellationScreen(page);
  if (constellationHandled) {
    console.log(`\n   🎊 Chapter ${chapterNumber} fully completed!`);
    return true;
  }

  return false;
}

// ================================
// MAIN TEST
// ================================

test('FinSaathi — Complete All Chapters & Sessions', async ({ page }) => {

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
  console.log('✔️  On map!');

  // ════════════════════════════════════════
  // LOOP THROUGH ALL CHAPTERS
  // After each chapter → constellation → Begin new Chapter → next chapter map
  // Keep going until no more chapters
  // ════════════════════════════════════════

  let chapterNumber = 1;
  const MAX_CHAPTERS = 20; // Safety limit

  while (chapterNumber <= MAX_CHAPTERS) {
    const chapterDone = await playAllSessionsInChapter(page, chapterNumber);

    if (!chapterDone) {
      console.log(`\n🏁 No more chapters found after chapter ${chapterNumber}`);
      break;
    }

    chapterNumber++;
    console.log(`\n➡️  Moving to Chapter ${chapterNumber}...`);
    await page.waitForTimeout(3000);
  }

  console.log(`\n🎉🎉 ALL DONE! Completed ${chapterNumber - 1} chapter(s)!`);
  console.log(`📧 Account: ${email}`);
});