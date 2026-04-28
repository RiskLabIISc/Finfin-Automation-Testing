import { test } from '@playwright/test';

test.setTimeout(1800000); // 30 minutes

// ================================
// HELPER: CHECK GAME OVER
// ================================

async function isGameOver(page) {
  const gameOverPatterns = [
    /Times up!!/i,
    /Times up/i,
    /no more hearts/i,
    /hearts? (over|ran out|finished|empty)/i,
    /out of lives/i,
    /no lives left/i,
    /no more lives/i,
    /out of lifeline/i,
    /no lifeline/i,
    /game over/i,
    /come back (tomorrow|later)/i,
    /daily limit/i,
  ];

  for (const pattern of gameOverPatterns) {
    const el = page.getByText(pattern).first();
    if (await el.isVisible().catch(() => false)) {
      const text = (await el.textContent() || '').trim();
      console.log(`\n⛔ GAME OVER: "${text}"`);
      await page.waitForTimeout(1500);

      // From HTML: <button><img alt="Back">Back</button>
      const backSelectors = [
        page.locator('button:has(img[alt="Back"])'),
        page.locator('button').filter({ hasText: 'Back' }).first(),
        page.locator('img[alt="Back"]'),
        page.getByRole('button', { name: /back/i }),
      ];

      for (const backBtn of backSelectors) {
        if (await backBtn.isVisible().catch(() => false)) {
          console.log('   ↩️  Clicking Back...');
          await backBtn.click();
          await page.waitForTimeout(2000);
          console.log('   ✔️  Back clicked');
          return true;
        }
      }

      console.warn('   ⚠️  Back button not found');
      return true;
    }
  }
  return false;
}

// ================================
// HELPER: HANDLE CERTIFICATE POPUP
// After all topics + chapters complete:
// "Certificate is yours!" popup appears
// → Navigate to Home
// → Then explore profile
// ================================

async function handleCertificatePopup(page) {
  await page.waitForTimeout(2000);

  // From screenshot: "This Certificate is yours!!" with "Explore more certifications ▶"
  const certVisible =
    await page.getByText(/This Certificate is yours/i).first().isVisible().catch(() => false) ||
    await page.getByText(/certificate is yours/i).first().isVisible().catch(() => false) ||
    await page.getByText(/Victory is yours/i).first().isVisible().catch(() => false);

  if (certVisible) {
    console.log('\n🏆 Certificate popup detected!');
    await page.screenshot({ path: 'test-results/certificate-popup.png' });
    console.log('   📸 certificate-popup.png saved');

    // From screenshot: "Explore more certifications ▶" → goes to Home
    const exploreBtn = page.getByRole('button', { name: /Explore more certifications/i });
    if (await exploreBtn.isVisible().catch(() => false)) {
      console.log('   🏠 Clicking "Explore more certifications"...');
      await exploreBtn.click();
      await page.waitForTimeout(3000);
      console.log('   ✔️  On Home/certifications page');
      return true;
    }

    // Fallback: Home button
    const homeBtn = page.getByRole('button', { name: /^Home$/i });
    if (await homeBtn.isVisible().catch(() => false)) {
      await homeBtn.click();
      await page.waitForTimeout(3000);
      return true;
    }
  }

  return false;
}

// ================================
// HELPER: NAVIGATE TO PROFILE FROM HOME
// From Home page → click username/profile → profile opens
// ================================

async function navigateToProfile(page) {
  console.log('\n   🖱️  Navigating to profile from Home...');
  await page.waitForTimeout(2000);

  // Click username in top right
  // Username is "test" + digits, short text
  const allElements = page.locator('div, span, button');
  const totalCount = await allElements.count();

  for (let i = 0; i < totalCount; i++) {
    const el = allElements.nth(i);
    const isVisible = await el.isVisible().catch(() => false);
    if (!isVisible) continue;
    const text = (await el.textContent() || '').trim();
    if (/^test\d+$/i.test(text) && text.length < 30) {
      console.log(`   ✔️  Clicking username: "${text}"`);
      await el.click();
      await page.waitForTimeout(2000);
      if (await page.getByText('Earned').isVisible().catch(() => false)) {
        return true;
      }
    }
  }

  // Fallback: coordinate click top right
  const viewport = page.viewportSize();
  if (viewport) {
    await page.mouse.click(viewport.width - 110, 107);
    await page.waitForTimeout(2000);
    if (await page.getByText('Earned').isVisible().catch(() => false)) {
      return true;
    }
  }

  return false;
}

// ================================
// HELPER: EXPLORE PROFILE
// Profile sections: Earned, Streak, Constellations, Achievements
// My Topics, My Progress
// Each: click → screenshot → Go back
// ================================

async function exploreProfile(page) {
  console.log('\n👤 ══════ PROFILE EXPLORATION ══════');
  await page.waitForTimeout(2000);

  // ── Navigate to profile ──
  const profileOpened = await navigateToProfile(page);
  if (!profileOpened) {
    console.warn('   ⚠️  Could not open profile');
    return;
  }

  console.log('   ✔️  Profile page opened!');
  await page.screenshot({ path: 'test-results/01-profile-main.png' });
  console.log('   📸 01-profile-main.png');

  // ── Explore each section ──
  const sections = [
    { name: 'Earned',         text: 'Earned' },
    { name: 'Streak',         text: 'Streak' },
    { name: 'Constellations', text: 'Constellations' },
    { name: 'Achievements',   text: 'Achievements' },
    { name: 'My Topics',      text: 'My Topics' },
    { name: 'My Progress',    text: 'My Progress' },
  ];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`\n   📌 Exploring "${section.name}"...`);

    const el = page.getByText(section.text, { exact: true }).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click();
      await page.waitForTimeout(2000);

      const filename = `test-results/0${i + 2}-profile-${section.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename });
      console.log(`   📸 ${filename}`);

      // Go back to profile
      await page.waitForTimeout(500);
      const goBack = page.getByText('Go back', { exact: false }).first();
      if (await goBack.isVisible().catch(() => false)) {
        await goBack.click();
        await page.waitForTimeout(2000);
        console.log(`   ↩️  Back on profile`);
      } else {
        await page.goBack();
        await page.waitForTimeout(2000);
      }
    } else {
      console.warn(`   ⚠️  "${section.name}" not visible`);
    }
  }

  console.log('\n   ✅ Profile exploration completed!');
  console.log('   📁 Screenshots saved in test-results/');
}

// ================================
// HELPER: PLAY ONE QUIZ SESSION
// ================================

async function playQuizSession(page, chapterNumber, sessionNumber) {
  console.log(`   ▶️  Chapter ${chapterNumber} / Session ${sessionNumber} — playing...`);
  let questionCount = 0;

  while (true) {
    await page.waitForTimeout(800);
    if (await isGameOver(page)) return 'gameover';

    const levelCompleted = page.getByRole('button', { name: /Level Completed/i });
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }

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

    await page.waitForTimeout(500);
    if (await isGameOver(page)) return 'gameover';
    const enterBtn = page.getByRole('button', { name: /^Enter$/i });
    if (await enterBtn.isVisible().catch(() => false)) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    if (await isGameOver(page)) return 'gameover';
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }

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

    if (await isGameOver(page)) return 'gameover';
    if (await levelCompleted.isVisible().catch(() => false)) {
      console.log(`   ✅ Session ${sessionNumber} done! (${questionCount} questions)`);
      await levelCompleted.click();
      await page.waitForTimeout(3000);
      return 'done';
    }

    await page.waitForTimeout(500);
    const nextBtn = page.getByRole('button', { name: /Next/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

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
// HELPER: CLICK PLAY QUIZ
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
      return true;
    }
    return false;
  }
}

// ================================
// HELPER: CLICK UNLOCKED NODE
// ================================

async function clickUnlockedNode(page) {
  await page.waitForTimeout(3000);
  const nodeLabels = [/^Play now$/i, /^Continue to play$/i, /^Continue$/i, /^Resume$/i];

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
// After all sessions in chapter:
// Type name → "Begin new Chapter!" OR last one shows certificate
// ================================

async function handleConstellationScreen(page) {
  await page.waitForTimeout(2000);
  const el = page.getByText(/completed this chapter/i);
  if (await el.isVisible().catch(() => false)) {
    console.log('\n   🌟 Constellation screen!');

    // Type constellation name
    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="give" i]');
    if (await nameInput.isVisible().catch(() => false)) {
      const randomName = `Star${Date.now().toString().slice(-4)}`;
      await nameInput.fill(randomName);
      console.log(`   ✏️  Named: "${randomName}"`);
      await page.waitForTimeout(1000);
    }

    // Check if certificate popup already visible
    if (await page.getByText(/certificate is yours/i).isVisible().catch(() => false)) {
      console.log('\n   🏆 CERTIFICATE IS YOURS!');
      await page.screenshot({ path: 'test-results/certificate-popup.png' });
      return 'certificate';
    }

    // Try ALL possible buttons on constellation screen
    const constellationButtons = [
      { locator: page.getByRole('button', { name: /Begin new Chapter/i }), label: 'Begin new Chapter', result: 'next_chapter' },
      { locator: page.getByRole('button', { name: /Finished/i }),          label: 'Finished',          result: 'next_chapter' },
      { locator: page.getByRole('button', { name: /Finish/i }),            label: 'Finish',            result: 'certificate' },
      { locator: page.getByRole('button', { name: /Done/i }),              label: 'Done',              result: 'certificate' },
      { locator: page.getByRole('button', { name: /Complete/i }),          label: 'Complete',          result: 'certificate' },
      { locator: page.getByRole('button', { name: /Get Certificate/i }),   label: 'Get Certificate',   result: 'certificate' },
      { locator: page.getByRole('button', { name: /Claim/i }),             label: 'Claim',             result: 'certificate' },
      { locator: page.getByRole('button', { name: /Continue/i }),          label: 'Continue',          result: 'next_chapter' },
      { locator: page.getByRole('button', { name: /Next/i }),              label: 'Next',              result: 'next_chapter' },
      { locator: page.getByRole('button', { name: /Home/i }),              label: 'Home',              result: 'certificate' },
    ];

    for (const btn of constellationButtons) {
      if (await btn.locator.isVisible().catch(() => false)) {
        const btnLabel = btn.label;
        console.log('   🚀  Clicking "' + btnLabel + '"...');
        await btn.locator.click();
        await page.waitForTimeout(3000);

        // Check if certificate appeared after clicking
        if (await page.getByText(/certificate is yours/i).isVisible().catch(() => false)) {
          console.log('\n   🏆 CERTIFICATE IS YOURS!');
          await page.screenshot({ path: 'test-results/certificate-popup.png' });
          return 'certificate';
        }

        return btn.result;
      }
    }

    // Debug: print all visible buttons
    console.warn('   ⚠️  No button found on constellation. Visible buttons:');
    const allBtns = page.locator('button');
    const btnCount = await allBtns.count();
    for (let i = 0; i < btnCount; i++) {
      const b = allBtns.nth(i);
      const isVis = await b.isVisible().catch(() => false);
      if (!isVis) continue;
      const t = (await b.textContent() || '').trim();
      if (t) console.warn('      [' + i + '] "' + t + '"');
    }
  }
  return null;
}

// ================================
// HELPER: PLAY ALL SESSIONS IN CHAPTER
// ================================

async function playAllSessionsInChapter(page, chapterNumber) {
  console.log(`\n📖 ══════ CHAPTER ${chapterNumber} ══════`);
  let sessionNumber = 1;

  while (true) {
    console.log(`\n   🗺️  Looking for Session ${sessionNumber} node...`);
    if (await isGameOver(page)) return 'gameover';

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
      if (!nodeClicked) break;
      if (await isGameOver(page)) return 'gameover';
      const started = await clickPlayQuiz(page);
      if (!started) break;
    }

    const result = await playQuizSession(page, chapterNumber, sessionNumber);
    if (result === 'gameover') return 'gameover';

    sessionNumber++;

    const constellationResult = await handleConstellationScreen(page);
    if (constellationResult === 'certificate') return 'certificate';
    if (constellationResult === 'next_chapter') return 'done';
  }

  const constellationResult = await handleConstellationScreen(page);
  if (constellationResult === 'certificate') return 'certificate';
  if (constellationResult === 'next_chapter') return 'done';

  return 'done';
}

// ================================
// MAIN TEST
// ================================

test('FinSaathi — Complete All Topics + Profile Explore', async ({ page }) => {

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

  await page.getByRole('button', { name: 'Next Next' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();

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

  const certificate = page.locator('.w-full > .flex-1').first();
  await certificate.waitFor({ state: 'visible' });
  await certificate.click();
  await page.getByRole('button', { name: 'Play now!!' }).click();

  await page.getByRole('button', { name: 'Play Play now' }).click();
  await page.waitForTimeout(2000);
  console.log('✔️  On map!\n');

  // ════════════════════════════════════════
  // LOOP THROUGH ALL CHAPTERS
  // ════════════════════════════════════════

  let chapterNumber = 1;
  const MAX_CHAPTERS = 50;
  let endReason = 'unknown';

  while (chapterNumber <= MAX_CHAPTERS) {
    const result = await playAllSessionsInChapter(page, chapterNumber);

    if (result === 'gameover') {
      console.log(`\n⛔ Game over after Chapter ${chapterNumber}`);
      endReason = 'gameover';
      break;
    }

    if (result === 'certificate') {
      console.log(`\n🏆 All topics completed after Chapter ${chapterNumber}!`);
      endReason = 'certificate';
      break;
    }

    chapterNumber++;
    console.log(`\n➡️  Moving to Chapter ${chapterNumber}...`);
    await page.waitForTimeout(3000);
  }

  // ════════════════════════════════════════
  // AFTER GAME — NAVIGATE HOME + PROFILE
  // ════════════════════════════════════════

  if (endReason === 'certificate') {
    // Certificate popup → click Home → go to profile
    console.log('\n🏠 Navigating to Home from certificate...');
    await handleCertificatePopup(page);
    await exploreProfile(page);

  } else if (endReason === 'gameover') {
    // Already on map after Back click → go directly to profile
    console.log('\n🏠 Navigating to Home then Profile...');

    // Click Home button on map
    const homeBtn = page.getByRole('button', { name: /^Home$/i });
    if (await homeBtn.isVisible().catch(() => false)) {
      await homeBtn.click();
      await page.waitForTimeout(2000);
    }

    await exploreProfile(page);
  }

  console.log(`\n🎉 Test finished! Completed ${chapterNumber} chapter(s)`);
  console.log(`📧 Account: ${email}`);
});