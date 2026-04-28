// import { test } from '@playwright/test';

// test.setTimeout(600000);

// // ================================
// // HELPER: PLAY ONE QUIZ SESSION
// // ================================

// async function playQuizSession(page, sessionNumber) {
//   console.log(`\n▶️  Session ${sessionNumber} — playing quiz...`);
//   let questionCount = 0;

//   while (true) {
//     await page.waitForTimeout(800);

//     // ── Check Level Completed ──
//     const levelCompleted = page.getByRole('button', { name: /Level Completed/i });
//     if (await levelCompleted.isVisible().catch(() => false)) {
//       console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
//       await levelCompleted.click();
//       await page.waitForTimeout(3000);
//       return true;
//     }

//     // ── Select random MCQ option ──
//     const mcqOptions = page.locator('button[class*="rounded-\\[32px\\]"]');
//     const mcqCount = await mcqOptions.count();

//     if (mcqCount >= 2) {
//       const visibleIndexes = [];
//       for (let i = 0; i < mcqCount; i++) {
//         const isVisible = await mcqOptions.nth(i).isVisible().catch(() => false);
//         if (isVisible) visibleIndexes.push(i);
//       }
//       if (visibleIndexes.length >= 1) {
//         const randomIndex = visibleIndexes[Math.floor(Math.random() * visibleIndexes.length)];
//         const text = (await mcqOptions.nth(randomIndex).textContent() || '').trim();
//         console.log(`   🎲 Q${questionCount + 1}: "${text}"`);
//         await mcqOptions.nth(randomIndex).click();
//         questionCount++;
//         await page.waitForTimeout(600);
//       }
//     }

//     // ── Click Enter ──
//     await page.waitForTimeout(500);
//     const enterBtn = page.getByRole('button', { name: /^Enter$/i });
//     if (await enterBtn.isVisible().catch(() => false)) {
//       await enterBtn.click();
//       await page.waitForTimeout(1000);
//     }

//     // ── Check Level Completed after Enter ──
//     if (await levelCompleted.isVisible().catch(() => false)) {
//       console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
//       await levelCompleted.click();
//       await page.waitForTimeout(3000);
//       return true;
//     }

//     // ── Handle More Info popup ──
//     await page.waitForTimeout(500);
//     const moreInfo = page.getByRole('button', { name: /More Info/i });
//     if (await moreInfo.isVisible().catch(() => false)) {
//       await moreInfo.click();
//       await page.waitForTimeout(500);
//       const closeInfo = page.getByRole('button', { name: /Close Info/i });
//       if (await closeInfo.isVisible().catch(() => false)) {
//         await closeInfo.click();
//         await page.waitForTimeout(500);
//       }
//     }

//     // ── Check Level Completed after More Info ──
//     if (await levelCompleted.isVisible().catch(() => false)) {
//       console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
//       await levelCompleted.click();
//       await page.waitForTimeout(3000);
//       return true;
//     }

//     // ── Click Next ──
//     await page.waitForTimeout(500);
//     const nextBtn = page.getByRole('button', { name: /Next/i });
//     if (await nextBtn.isVisible().catch(() => false)) {
//       await nextBtn.click();
//       await page.waitForTimeout(800);
//     }

//     // ── Check Level Completed after Next ──
//     if (await levelCompleted.isVisible().catch(() => false)) {
//       console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
//       await levelCompleted.click();
//       await page.waitForTimeout(3000);
//       return true;
//     }
//   }
// }

// // ================================
// // HELPER: CLICK PLAY QUIZ IN POPUP
// // ================================

// async function clickPlayQuiz(page) {
//   console.log(`   ⏳ Waiting for Play Quiz popup...`);
//   await page.waitForTimeout(2000);

//   try {
//     await page.getByText('Play Quiz').waitFor({ state: 'visible', timeout: 8000 });
//     await page.getByText('Play Quiz').click();
//     await page.waitForTimeout(1500);
//     console.log(`   ✔️  Play Quiz clicked!`);
//     return true;
//   } catch {
//     const div = page.locator('div').filter({ hasText: /^Play Quiz$/ }).first();
//     if (await div.isVisible().catch(() => false)) {
//       await div.click();
//       await page.waitForTimeout(1500);
//       console.log(`   ✔️  Play Quiz clicked (fallback)!`);
//       return true;
//     }
//     console.warn(`   ❌ Play Quiz not found`);
//     return false;
//   }
// }

// // ================================
// // HELPER: HANDLE CONSTELLATION SCREEN
// // After all sessions done:
// //   1. Type a name in "give it a name" input
// //   2. Click "Begin new Chapter!" button
// // ================================

// async function handleConstellationScreen(page) {
//   console.log('\n🌟 Checking for constellation screen...');
//   await page.waitForTimeout(2000);

//   // Check if constellation screen is visible
//   const constellationText = page.getByText(/completed this chapter/i);
//   if (await constellationText.isVisible().catch(() => false)) {
//     console.log('   ✔️  Constellation screen detected!');

//     // Type a name in the input field
//     const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="give" i]');
//     if (await nameInput.isVisible().catch(() => false)) {
//       const randomName = `Star${Date.now().toString().slice(-4)}`;
//       console.log(`   ✏️  Typing constellation name: "${randomName}"`);
//       await nameInput.fill(randomName);
//       await page.waitForTimeout(1000);
//     }

//     // Click "Begin new Chapter!" button
//     const beginBtn = page.getByRole('button', { name: /Begin new Chapter/i });
//     if (await beginBtn.isVisible().catch(() => false)) {
//       console.log('   🚀  Clicking "Begin new Chapter!"');
//       await beginBtn.click();
//       await page.waitForTimeout(2000);
//       return true;
//     }
//   }

//   return false;
// }

// // ================================
// // MAIN TEST
// // ================================

// test('FinSaathi — Complete All 4 Sessions + Constellation', async ({ page }) => {

//   // ── Open Website ──
//   console.log('\n🌐 Opening FinSaathi...');
//   await page.goto('https://finsaathi.mgmt.iisc.ac.in/');
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   console.log('✔️  Landing page');

//   // ── Education Level ──
//   await page.locator('div').filter({ hasText: /^Masters21\+$/ }).nth(1).click();
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   console.log('✔️  Education: Masters 21+');

//   // ── Register ──
//   const email = `test${Date.now()}@mail.com`;
//   console.log(`✔️  Registering: ${email}`);
//   await page.getByRole('button', { name: 'Email Email' }).click();
//   await page.getByRole('textbox', { name: 'Enter Email ID' }).fill(email);
//   await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
//   await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');
//   await page.locator('div').filter({ hasText: /^Next$/ }).nth(1).click();
//   console.log('✔️  Registered');

//   // ── Onboarding ──
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   console.log('✔️  Onboarding done');

//   // ── Topics ──
//   await page.getByRole('button', { name: 'Introduction to Personal' }).waitFor();
//   await page.getByRole('button', { name: 'Introduction to Personal' }).click();
//   await page.getByRole('button', { name: 'Crypto-Topic' }).click();
//   await page.getByRole('button', { name: 'Tax Strategy' }).click();
//   await page.getByRole('button', { name: 'Wealth Preservation' }).click();
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   console.log('✔️  Topics selected');

//   // ── Employment ──
//   await page.getByText('I am a ....I am a').click();
//   await page.getByText('Full-time Employee').click();
//   await page.getByRole('button', { name: 'Next Next' }).click();
//   console.log('✔️  Employment: Full-time Employee');

//   // ── Time ──
//   await page.getByRole('button', { name: '-5 mins' }).click();
//   await page.getByRole('button', { name: 'Done Next' }).click();
//   console.log('✔️  Time: -5 mins');

//   // ── Certificate ──
//   const certificate = page.locator('.w-full > .flex-1').first();
//   await certificate.waitFor({ state: 'visible' });
//   await certificate.click();
//   await page.getByRole('button', { name: 'Play now!!' }).click();
//   console.log('✔️  Certificate opened');

//   // ── Start Game → MAP ──
//   await page.getByRole('button', { name: 'Play Play now' }).click();
//   await page.waitForTimeout(2000);
//   console.log('✔️  On map!\n');

//   // ════════════════════════════════════════
//   // SESSION 1 — directly click Play Quiz div (working approach)
//   // ════════════════════════════════════════
//   console.log('\n🎮 Opening Session 1...');
//   await page.waitForTimeout(2000);
//   await page.locator('div').filter({ hasText: /^Play Quiz$/ }).nth(2).click();
//   await page.waitForTimeout(1500);
//   console.log('✔️  Session 1 quiz started!');
//   await playQuizSession(page, 1);

//   // ════════════════════════════════════════
//   // SESSIONS 2, 3, 4
//   // After each session → map reloads → "Continue to play" node unlocks
//   // Click node → popup → Play Quiz → play
//   // ════════════════════════════════════════

//   for (let session = 2; session <= 4; session++) {
//     console.log(`\n🗺️  Map — looking for Session ${session} node...`);
//     await page.waitForTimeout(4000);

//     // Click "Continue to play" unlocked node
//     const continueNode = page.locator('div, button').filter({ hasText: /^Continue to play$/i });
//     const count = await continueNode.count();
//     console.log(`   Found ${count} "Continue to play" node(s)`);

//     let nodeClicked = false;

//     if (count > 0) {
//       for (let i = count - 1; i >= 0; i--) {
//         const node = continueNode.nth(i);
//         const isVisible = await node.isVisible().catch(() => false);
//         if (isVisible) {
//           console.log(`   ✔️  Clicking "Continue to play"`);
//           await node.click();
//           await page.waitForTimeout(1000);
//           nodeClicked = true;
//           break;
//         }
//       }
//     }

//     // Fallback: try "Play now"
//     if (!nodeClicked) {
//       const playNow = page.locator('div, button').filter({ hasText: /^Play now$/i });
//       if (await playNow.last().isVisible().catch(() => false)) {
//         console.log(`   ✔️  Clicking "Play now" (fallback)`);
//         await playNow.last().click();
//         await page.waitForTimeout(1000);
//         nodeClicked = true;
//       }
//     }

//     if (!nodeClicked) {
//       console.log(`   🏁 No more unlocked nodes — stopping at session ${session}`);
//       break;
//     }

//     // Popup → click Play Quiz
//     const started = await clickPlayQuiz(page);
//     if (!started) break;

//     // Play the session
//     await playQuizSession(page, session);

//     // After last session, handle constellation screen
//     if (session === 4) {
//       await handleConstellationScreen(page);
//     }
//   }

//   // Also check constellation after all sessions
//   // (in case it appears after session 4)
//   await handleConstellationScreen(page);

//   console.log('\n🎉 All done!');
//   console.log(`📧 Account: ${email}`);
// });



import { test, expect } from '@playwright/test';

test.setTimeout(600000);

// ================================
// HELPER: PLAY ONE QUIZ SESSION
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
        console.log(`   🎲 Q${questionCount + 1}: "${text}"`);
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
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
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
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
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
      console.log(`✅ Session ${sessionNumber} completed! (${questionCount} questions answered)`);
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
  console.log(`   ⏳ Waiting for Play Quiz popup...`);
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
// HELPER: HANDLE CONSTELLATION SCREEN
// After all sessions done:
//   1. Type a name in "give it a name" input
//   2. Click "Begin new Chapter!" button
// ================================

async function handleConstellationScreen(page) {
  console.log('\n🌟 Checking for constellation screen...');
  await page.waitForTimeout(2000);

  // Check if constellation screen is visible
  const constellationText = page.getByText(/completed this chapter/i);
  if (await constellationText.isVisible().catch(() => false)) {
    console.log('   ✔️  Constellation screen detected!');

    // Type a name in the input field
    const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="give" i]');
    if (await nameInput.isVisible().catch(() => false)) {
      const randomName = `Star${Date.now().toString().slice(-4)}`;
      console.log(`   ✏️  Typing constellation name: "${randomName}"`);
      await nameInput.fill(randomName);
      await page.waitForTimeout(1000);
    }

    // Click "Begin new Chapter!" button
    const beginBtn = page.getByRole('button', { name: /Begin new Chapter/i });
    if (await beginBtn.isVisible().catch(() => false)) {
      console.log('   🚀  Clicking "Begin new Chapter!"');
      await beginBtn.click();
      await page.waitForTimeout(2000);
      return true;
    }
  }

  return false;
}


test('FinSaathi — Complete All 4 Sessions + Constellation', async ({ page }) => {

  // ── Open Website ──
  console.log('\n🌐 Opening FinSaathi...');
  await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

  // ================================
  // 1. LANGUAGE SELECTION
  // ================================
  await page.waitForTimeout(2000);
  const langNext = page.getByRole('button', { name: /Next/i });
  if (await langNext.isVisible().catch(() => false)) {
    await langNext.click();
    console.log('✔️ Language selected');
  }

  // ================================
  // 2. TOPIC SELECTION (BEFORE LOGIN)
  // ================================
  await page.waitForTimeout(2000);

  const topics = [
    'Introduction to Personal',
    'Crypto',
    'Tax Strategy',
    'Wealth Preservation'
  ];

  for (const topic of topics) {
    const topicBtn = page.getByRole('button', { name: new RegExp(topic, 'i') });
    if (await topicBtn.isVisible().catch(() => false)) {
      await topicBtn.click();
      console.log(`✔️ Topic selected: ${topic}`);
    }
  }

  await page.getByRole('button', { name: /Next/i }).click();

  // ================================
  // 3. LOGIN → SIGNUP
  // ================================
  await page.waitForTimeout(2000);

  const signupBtn = page.getByRole('button', { name: /sign\s*up/i });
  if (await signupBtn.isVisible().catch(() => false)) {
    await signupBtn.click();
    console.log('✔️ Signup clicked');
  }

  await page.getByRole('button', { name: /email/i }).click();

  const email = `test${Date.now()}@mail.com`;
  console.log(`✔️ Registering: ${email}`);

  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');

  await page.getByRole('button', { name: /Next|Continue/i }).click();
  console.log('✔️ Registered');

  // ================================
  // 4. PLAYGROUP SELECTION
  // ================================
await page.waitForTimeout(2000);

console.log('⏳ Waiting for playgroup options...');

// Wait until all playgroups are visible
await page.waitForSelector('img[alt="Masters"]');

// Get all playgroup images
const playgroups = page.locator('img[alt="Beginner"], img[alt="Intermediate"], img[alt="Masters"]');

const count = await playgroups.count();

if (count > 0) {
  const randomIndex = Math.floor(Math.random() * count);
  const selected = playgroups.nth(randomIndex);

  const altText = await selected.getAttribute('alt');

  console.log(`🎲 Selecting playgroup: ${altText}`);

  await selected.click();
} else {
  console.warn('⚠️ No playgroups found!');
}

// Click Next
await page.getByRole('button', { name: /Next/i }).click();
  // ================================
  // 5. PROFILE SETUP
  // ================================
 await page.waitForTimeout(2000);

console.log('⏳ Handling "What do you do?" dropdown...');

// Step 1: Click ONLY the dropdown box (not label)
const dropdown = page.locator('div').filter({ hasText: /^I am a/i }).first();

await dropdown.click();
console.log('✔️ Dropdown opened');

// Step 2: Wait for options
await page.waitForSelector('text=Employee');

// Step 3: Select option
await page.getByText('Employee').click();
console.log('✔️ Selected: Employee');

// Step 4: Wait for Next to be enabled (IMPORTANT)
const nextBtn = page.getByRole('button', { name: /Next/i });

await nextBtn.waitFor({ state: 'visible' });
await expect(nextBtn).toBeEnabled();   // <-- THIS FIXES YOUR ERROR

await nextBtn.click();
console.log('✔️ Next clicked');
  // ================================
  // 6. TIME SELECTION
  // ================================
  await page.waitForTimeout(2000);

  const timeOption = page.getByText(/-?5\s*mins/i);
  if (await timeOption.isVisible().catch(() => false)) {
    await timeOption.click();
  }

  await page.getByRole('button', { name: /Done|Next/i }).click();
  console.log('✔️ Time selected');

  // ================================
  // 7. ENTER GAME (UNCHANGED)
  // ================================
  await page.waitForTimeout(3000);

  const certificate = page.locator('.w-full > .flex-1').first();
  await certificate.waitFor({ state: 'visible' });
  await certificate.click();

  await page.getByRole('button', { name: /Play/i }).click();
  await page.getByRole('button', { name: /Play/i }).click();

  await page.waitForTimeout(2000);
  console.log('✔️ On map!\n');

  // ================================
  // ✅ REST OF YOUR CODE (UNCHANGED)
  // ================================

  // Session 1
  console.log('\n🎮 Opening Session 1...');
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Play Quiz$/ }).nth(2).click();
  await page.waitForTimeout(1500);
  console.log('✔️ Session 1 quiz started!');
  await playQuizSession(page, 1);

  // Sessions 2–4
  for (let session = 2; session <= 4; session++) {
    console.log(`\n🗺️ Map — looking for Session ${session} node...`);
    await page.waitForTimeout(4000);

    const continueNode = page.locator('div, button').filter({ hasText: /^Continue to play$/i });
    const count = await continueNode.count();

    let nodeClicked = false;

    for (let i = count - 1; i >= 0; i--) {
      const node = continueNode.nth(i);
      if (await node.isVisible().catch(() => false)) {
        await node.click();
        await page.waitForTimeout(1000);
        nodeClicked = true;
        break;
      }
    }

    if (!nodeClicked) {
      const playNow = page.locator('div, button').filter({ hasText: /^Play now$/i });
      if (await playNow.last().isVisible().catch(() => false)) {
        await playNow.last().click();
        await page.waitForTimeout(1000);
        nodeClicked = true;
      }
    }

    if (!nodeClicked) break;

    const started = await clickPlayQuiz(page);
    if (!started) break;

    await playQuizSession(page, session);

    if (session === 4) {
      await handleConstellationScreen(page);
    }
  }

  await handleConstellationScreen(page);

  console.log('\n🎉 All done!');
  console.log(`📧 Account: ${email}`);
});