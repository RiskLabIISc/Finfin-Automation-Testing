console.log('\n🌐 Opening FinSaathi...');
await page.goto('https://finsaathi.mgmt.iisc.ac.in/');

// ================================
// 1. LANGUAGE SELECTION
// ================================
await page.waitForTimeout(2000);
const langNext = page.getByRole('button', { name: /Next/i });
if (await langNext.isVisible().catch(() => false)) {
  await langNext.click();
  console.log('✔️ Language selected (English default)');
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

// Click Next after selecting topics
const topicNext = page.getByRole('button', { name: /Next/i });
if (await topicNext.isVisible().catch(() => false)) {
  await topicNext.click();
}

// ================================
// 3. LOGIN → SIGNUP
// ================================
await page.waitForTimeout(2000);

// Click Signup (NEW STEP)
const signupBtn = page.getByRole('button', { name: /sign\s*up/i });
if (await signupBtn.isVisible().catch(() => false)) {
  await signupBtn.click();
  console.log('✔️ Navigated to Signup');
}

// Continue with Email signup
await page.getByRole('button', { name: /email/i }).click();

const email = `test${Date.now()}@mail.com`;
console.log(`✔️ Registering: ${email}`);

await page.getByRole('textbox', { name: /email/i }).fill(email);
await page.getByRole('textbox', { name: /password/i }).fill('123456');
await page.getByRole('textbox', { name: /confirm/i }).fill('123456');

// Click Next / Continue
await page.getByRole('button', { name: /Next|Continue/i }).click();

// ================================
// 4. PLAYGROUP SELECTION
// ================================
await page.waitForTimeout(2000);

const mastersOption = page.getByText(/Masters/i);
if (await mastersOption.isVisible().catch(() => false)) {
  await mastersOption.click();
  console.log('✔️ Playgroup selected: Masters');
}

// Next
await page.getByRole('button', { name: /Next/i }).click();

// ================================
// 5. PROFILE SETUP
// ================================
await page.waitForTimeout(2000);

const profession = page.getByText(/Full[- ]?time Employee/i);
if (await profession.isVisible().catch(() => false)) {
  await profession.click();
}

await page.getByRole('button', { name: /Next/i }).click();

// ================================
// 6. TIME SELECTION
// ================================
await page.waitForTimeout(2000);

const timeOption = page.getByText(/-?5\s*mins/i);
if (await timeOption.isVisible().catch(() => false)) {
  await timeOption.click();
}

await page.getByRole('button', { name: /Done|Next/i }).click();

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
