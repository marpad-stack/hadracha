const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const {
  injectOverlay, caption, hideCaption, highlight, hideHighlight, step,
  showLegend, hideLegend, typeMaskedEmail,
  showFullscreenImage, hideFullscreenImage, ensureActive, reapplyEmailMask, clearEmailMasks,
} = require('./tutorial-helpers');

const { REAL_EMAIL, SITE_PASSWORD } = require('./credentials');
const FAKE_EMAIL = 'test@test.co.il';

const waB64 = fs.readFileSync(path.join(__dirname, 'whatsapp-spotlight.png')).toString('base64');
const emailB64 = fs.readFileSync(path.join(__dirname, 'real-email-cropped.png')).toString('base64');
const forgotPwB64 = fs.readFileSync(path.join(__dirname, 'real-forgot-pw.png')).toString('base64');

async function typeSlowly(page, locator, text) {
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(text, { delay: 65 });
}

async function fillInstant(locator, text) {
  await locator.click();
  await locator.selectText();
  await locator.press('Delete');
  await locator.fill(text);
}

async function localFile(name) {
  return 'file:///' + path.resolve(__dirname, name).replace(/\\/g, '/');
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'videos/part1', size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // ---- Intro ----
  await page.goto(await localFile('intro.html'));
  await page.waitForTimeout(4200);

  // ---- Single real page load for the whole walkthrough ----
  await page.goto('https://marpad.online/');
  await page.waitForTimeout(1200);
  await injectOverlay(page);
  let p = await caption(page, 'בחלק הזה נראה את כל הדרכים האפשריות להתחברות לאתר');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const loginBtn = page.getByText('התחברות').first();
  await step(page, loginBtn, "לחיצה על כפתור 'התחברות' בפינה השמאלית העליונה", { clickAfter: true });
  await page.waitForTimeout(500);

  // ---- Quick preview montage of all 4 options ----
  await injectOverlay(page);
  p = await caption(page, 'קודם הצצה מהירה על כל 4 האפשרויות - ואז נפרט על כל אחת בנפרד');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const previewTargets = [
    { idx: 0, locator: page.getByText('כניסה עם Google') },
    { idx: 1, locator: page.getByText('קוד לוואטסאפ', { exact: true }) },
    { idx: 2, locator: page.getByText('קוד למייל', { exact: true }) },
    { idx: 3, locator: page.getByText('סיסמה', { exact: true }) },
  ];
  for (const t of previewTargets) {
    await showLegend(page, t.idx);
    await highlight(page, t.locator);
    await page.waitForTimeout(650);
  }
  await hideHighlight(page); await hideLegend(page);
  await page.waitForTimeout(300);

  // ---- Option 1: Google (detail) ----
  await showLegend(page, 0);
  const googleBtn = page.getByText('כניסה עם Google');
  await step(page, googleBtn, 'אפשרות 1: התחברות מהירה עם חשבון Google');

  // ---- Option 2: WhatsApp code ----
  await showLegend(page, 1);
  const waTab = page.getByText('קוד לוואטסאפ', { exact: true });
  await step(page, waTab, 'אפשרות 2: קבלת קוד חד-פעמי בוואטסאפ - לחיצה על הלשונית', { clickAfter: true });
  await showLegend(page, 1);
  await page.waitForTimeout(500);
  const waPhoneField = page.locator('input').first();
  await step(page, waPhoneField, "הזנת מספר טלפון, ולחיצה על 'שלחו לי קוד לוואטסאפ'");
  await hideHighlight(page); await hideCaption(page); await hideLegend(page);

  await showFullscreenImage(page, waB64);
  p = await caption(page, '👉 וכך בדיוק נראית הודעת הקוד שמתקבלת בוואטסאפ');
  await page.waitForTimeout(p + 1000);
  await hideCaption(page);
  await hideFullscreenImage(page);

  // ---- Option 3: Email code / link ----
  await showLegend(page, 2);
  const emailTab = page.getByText('קוד למייל', { exact: true });
  await emailTab.click();
  await page.waitForTimeout(500);
  const emailField1 = page.getByPlaceholder('your@email.com');
  await typeMaskedEmail(page, emailField1, REAL_EMAIL, FAKE_EMAIL);
  await highlight(page, emailField1);
  p = await caption(page, "אפשרות 3: הזנת כתובת מייל, ולחיצה על 'שלחו לי קוד כניסה'");
  await page.waitForTimeout(p);
  await hideHighlight(page); await hideCaption(page);

  p = await caption(page, 'טיפ חשוב: לעיתים ההודעה מגיעה לטאב "עדכונים" או לתיקיית ספאם ולא לתיבה הראשית - כדאי לבדוק שם אם היא לא מופיעה מיד');
  await page.waitForTimeout(p);
  await hideCaption(page); await hideLegend(page);

  await showFullscreenImage(page, emailB64);
  p = await caption(page, '👉 כך בדיוק נראה המייל שמתקבל: קישור ללחיצה ישירה, וגם קוד בן 8 ספרות');
  await page.waitForTimeout(p + 1000);
  await hideCaption(page);
  await hideFullscreenImage(page);

  // ---- Option 4: password login, forgot-password, and real submit ----
  await showLegend(page, 3);
  const pwTab = page.getByText('סיסמה', { exact: true });
  await pwTab.click();
  await page.waitForTimeout(500);
  p = await caption(page, 'אפשרות 4: התחברות עם מייל וסיסמה - הכי מהיר כשכבר קיימת סיסמה קבועה');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const emailField2 = page.getByPlaceholder('your@email.com');
  await typeMaskedEmail(page, emailField2, REAL_EMAIL, FAKE_EMAIL);
  await highlight(page, emailField2);
  p = await caption(page, 'הזנת כתובת המייל');
  await page.waitForTimeout(p);
  await hideHighlight(page); await hideCaption(page);

  // Forgot password sub-flow
  const forgotLink = page.getByText('שכחתי סיסמה', { exact: true });
  await step(page, forgotLink, 'איפוס סיסמה שנשכחה: אפשר תמיד ללחוץ כאן', { clickAfter: true });
  await page.waitForTimeout(1200);
  await hideLegend(page);

  await showFullscreenImage(page, forgotPwB64);
  p = await caption(page, '👉 כך בדיוק נראה המייל שמתקבל - לחיצה על הכפתור פותחת מסך לבחירת סיסמה חדשה');
  await page.waitForTimeout(p + 1200);
  await hideCaption(page);
  await hideFullscreenImage(page);
  await reapplyEmailMask(page, emailField2, FAKE_EMAIL);
  await showLegend(page, 3);

  p = await caption(page, 'במקרה שלנו הסיסמה כבר ידועה, אז פשוט נמשיך ונזין אותה');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const pwField = page.getByPlaceholder('הסיסמה שלך');
  await highlight(page, pwField);
  p = await caption(page, 'הזנת הסיסמה');
  await page.waitForTimeout(p);
  await typeSlowly(page, pwField, SITE_PASSWORD);
  await page.waitForTimeout(700);
  await hideCaption(page);
  await hideHighlight(page);

  const enterBtn = page.getByText('כניסה', { exact: true });
  await step(page, enterBtn, "לחיצה על 'כניסה'", { clickAfter: true });
  await hideLegend(page);
  await clearEmailMasks(page);
  await page.waitForTimeout(2200);

  console.log('URL after login:', page.url());

  // ---- Force-show the first-time profile setup screen ----
  await page.goto('https://marpad.online/onboarding');
  await page.waitForTimeout(1500);
  await injectOverlay(page);
  p = await caption(page, 'וכך נראה המסך שמופיע בכניסה הראשונה למערכת');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const phoneField = page.locator('input').nth(1);
  await step(page, phoneField, 'הזנת מספר טלפון');
  await fillInstant(phoneField, '050-0009988');
  await page.waitForTimeout(500);
  await hideHighlight(page); await hideCaption(page);

  const cityField = page.getByPlaceholder('עיר');
  await step(page, cityField, 'הזנת עיר מגורים');
  await fillInstant(cityField, 'ירושלים');
  await page.waitForTimeout(500);
  await hideHighlight(page); await hideCaption(page);

  const schoolField = page.getByPlaceholder('שם בית הספר');
  await step(page, schoolField, 'הזנת שם בית הספר');
  await fillInstant(schoolField, 'בית ספר לדוגמה');
  await page.waitForTimeout(500);
  await hideHighlight(page); await hideCaption(page);

  const sectorBtn = page.getByText('ממ״ד', { exact: true });
  await step(page, sectorBtn, 'בחירת המגזר החינוכי');
  await ensureActive(sectorBtn);
  await hideHighlight(page); await hideCaption(page); await page.waitForTimeout(400);

  const gradeA = page.getByText('כיתה א', { exact: true });
  await step(page, gradeA, 'בחירת הכיתות הרלוונטיות (אפשר לבחור כמה)');
  await ensureActive(gradeA);
  await hideHighlight(page); await hideCaption(page); await page.waitForTimeout(400);

  const roleBtn = page.getByText('מורה מקצועית', { exact: true });
  await step(page, roleBtn, 'בחירת התפקיד');
  await ensureActive(roleBtn);
  await hideHighlight(page); await hideCaption(page); await page.waitForTimeout(400);

  const subjectBtn = page.getByText('שפה', { exact: true });
  await step(page, subjectBtn, 'בחירת תחומי דעת רלוונטיים');
  await ensureActive(subjectBtn);
  await hideHighlight(page); await hideCaption(page); await page.waitForTimeout(400);

  const saveBtn = page.getByText('שמרי והמשיכי', { exact: true });
  await step(page, saveBtn, 'לאחר מילוי הפרטים, לחיצה על כפתור ההמשך', { clickAfter: true, extraPause: 500 });
  await page.waitForTimeout(3800);

  await injectOverlay(page);
  p = await caption(page, 'ההתחברות הושלמה בהצלחה - וזה עמוד הבית האישי');
  await page.waitForTimeout(p);
  await hideCaption(page);

  console.log('Final URL:', page.url());
  await context.close();
  await browser.close();
  console.log('Part 1 video saved.');
})();
