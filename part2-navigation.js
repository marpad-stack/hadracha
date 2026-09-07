const path = require('path');
const { chromium } = require('playwright');
const {
  injectOverlay, caption, hideCaption, highlight, hideHighlight, step,
  showLegend, hideLegend, highlightRect,
} = require('./tutorial-helpers');
const { REAL_EMAIL, SITE_PASSWORD } = require('./credentials');

async function localFile(name) {
  return 'file:///' + path.resolve(__dirname, name).replace(/\\/g, '/');
}

async function silentLogin(page) {
  await page.goto('https://marpad.online/');
  await page.waitForTimeout(1000);
  await page.getByText('התחברות').first().click();
  await page.waitForTimeout(500);
  await page.getByText('סיסמה', { exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByPlaceholder('your@email.com').fill(REAL_EMAIL);
  await page.getByPlaceholder('הסיסמה שלך').fill(SITE_PASSWORD);
  await page.getByText('כניסה', { exact: true }).click();
  await page.waitForTimeout(2500);
}

async function getResultCount(page) {
  return page.evaluate(() => {
    const matches = [...document.querySelectorAll('*')]
      .map(e => e.textContent.trim())
      .filter(t => /^\d+\s*תוצאות$/.test(t));
    return matches[0] || '';
  });
}

async function waitForImages(page, timeout = 2500) {
  try {
    await page.waitForFunction(() => {
      const imgs = [...document.querySelectorAll('img')].slice(0, 12);
      return imgs.every(img => img.complete && img.naturalWidth > 0);
    }, { timeout });
  } catch (e) { /* proceed anyway if some images never finish */ }
  await page.waitForTimeout(300);
}

const NAV_LEGEND = ['כותרות בעמוד הבית', 'עולמות תוכן', 'חיפוש'];

const WORLDS = [
  { name: 'גיל הרך', url: '/worlds/early' },
  { name: 'יסודי (א-ו)', url: '/worlds/elem' },
  { name: 'חטיבה ותיכון (ז-י"ב)', url: '/worlds/hs' },
  { name: 'חינוך מיוחד', url: '/worlds/special' },
  { name: 'חדר מורים', url: '/worlds/staff' },
  { name: 'הורים / קשר עם בוגרים / פרסום כללי', url: '/worlds/parents' },
  { name: 'הסדרות המיוחדות', url: '/worlds/series', expand: true },
  { name: 'פרשת השבוע', url: '/worlds/parsha' },
  { name: 'שיעורי מקצוע', url: '/worlds/subjects' },
  { name: 'חגים ומועדים', url: '/worlds/holidays' },
  { name: 'ממ"דף', url: '/worlds/mamdaf' },
  { name: 'תקופת חירום ולמידה מרחוק', url: '/worlds/emergency' },
  { name: 'חוויות הקיץ', url: '/worlds/summer' },
];

const FILTERS = [
  { label: 'מגזר', desc: 'ממלכתי, ממ״ד, חרדי, חב״ד, כללי' },
  { label: 'כיתות', desc: 'גיל הרך, ועד כיתה י׳' },
  { label: 'קהל יעד', desc: 'תלמידים, מורים, הורים, בוגרי בית הספר, מרחב בית ספרי' },
  { label: 'חודש', desc: 'תשרי, כסלו, אדר, ניסן, תמוז, אב' },
  { label: 'פורמט למידה', desc: 'פרונטלית, אינטראקטיבית, עצמאית, חוץ-כיתתית' },
  { label: 'ליב״ה ומקצועות כלליים', desc: 'למשל מדעים ושפה' },
  { label: 'מקצועות יהדות', desc: 'פרשת השבוע, תנ״ך, דינים, מועדי ישראל' },
  { label: 'סוג מערך', desc: 'מערך שיעור, יצירה, דפי צביעה, משחק, פתק, מצגת, דף עבודה, חוברת, קיר תוכן, ערכה' },
  { label: 'ניקוד', desc: 'מנוקד או לא מנוקד' },
  { label: 'סוג קבצים', desc: 'PDF, PPTX, JPG, PNG' },
  { label: 'סדרה', desc: 'סדרות מסודרות לפי נושא, כמו חגים, ממד״ף ופרשת השבוע' },
];

const QUICK_SEARCHES = ['מבצע כיתתי', 'עיצובי קירות', 'כישורי חיים', 'ניקיון', 'אסיפות הורים', 'תעודות'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'videos/part2', size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // ---- Intro ----
  await page.goto(await localFile('intro2.html'));
  await page.waitForTimeout(4200);

  await silentLogin(page);
  await injectOverlay(page);
  let p = await caption(page, 'לפני שממשיכים - חשוב לוודא שהתחברת לחשבון (כפי שנראה בחלק 1)');
  await page.waitForTimeout(p);
  await hideCaption(page);

  p = await caption(page, 'בחלק הזה נראה שלוש דרכים למצוא מערכים: מהעמוד הראשי, דרך עולמות תוכן, ודרך חיפוש');
  await page.waitForTimeout(p);
  await hideCaption(page);

  for (let i = 0; i < 3; i++) {
    await showLegend(page, i, NAV_LEGEND, '3 דרכים למצוא מערכים');
    await page.waitForTimeout(650);
  }
  await hideLegend(page);

  // =========================================================
  // 1) HOME PAGE HEADINGS
  // =========================================================
  await showLegend(page, 0, NAV_LEGEND, '3 דרכים למצוא מערכים');
  p = await caption(page, 'דרך 1: כותרות ושורות נושאיות בעמוד הבית');
  await page.waitForTimeout(p);
  await hideCaption(page);

  await page.mouse.wheel(0, 550);
  await page.waitForTimeout(600);
  const worldsHeading = page.getByText('עולמות תוכן', { exact: true }).first();
  await step(page, worldsHeading, 'מיד מתחת לחיפוש מופיעה שורת "עולמות תוכן" - תצוגה מקדימה של הקטגוריות הראשיות');

  // sweep through every row heading currently rendered, brisk pace
  let lastHeadingText = null;
  for (let i = 0; i < 9; i++) {
    await page.mouse.wheel(0, 520);
    await page.waitForTimeout(550);
    const info = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('h2,h3')];
      const vh = window.innerHeight;
      const visible = hs.filter(h => { const r = h.getBoundingClientRect(); return r.top > 80 && r.top < vh - 220 && r.width > 0; });
      if (!visible.length) return null;
      const h = visible[0];
      const hr = h.getBoundingClientRect();
      return { text: h.textContent.trim(), rect: { x: hr.x, y: hr.y, width: hr.width, height: hr.height } };
    });
    if (!info || info.text === lastHeadingText) continue;
    lastHeadingText = info.text;
    await injectOverlay(page);
    await highlightRect(page, info.rect);
    if (info.text.includes('פרשת השבוע')) {
      p = await caption(page, `השורה "${info.text}" מתעדכנת אוטומטית כל שבוע לפי הפרשה הנוכחית - תמיד רלוונטית`);
    } else {
      p = await caption(page, `שורה נוספת: "${info.text}" - גם בה אפשר לגלול אופקית או ללחוץ "הצג הכל"`);
    }
    await page.waitForTimeout(Math.min(p, 2400));
    await hideCaption(page); await hideHighlight(page);
  }

  // click "show all" on one themed row
  const rowInfo = await page.evaluate(() => {
    const hs = [...document.querySelectorAll('h2,h3')];
    const vh = window.innerHeight;
    const visible = hs.filter(h => { const r = h.getBoundingClientRect(); return r.top > 80 && r.top < vh - 220 && r.width > 0; });
    if (!visible.length) return null;
    const h = visible[0];
    const hr = h.getBoundingClientRect();
    const buttons = [...document.querySelectorAll('button')].filter(b => b.textContent.includes('הצג הכל'));
    let best = null, bestDist = Infinity;
    for (const b of buttons) {
      const br = b.getBoundingClientRect();
      if (br.width === 0) continue;
      const dist = Math.abs(br.top - hr.top);
      if (dist < bestDist) { bestDist = dist; best = br; }
    }
    return {
      heading: h.textContent,
      buttonRect: best ? { x: best.x, y: best.y, width: best.width, height: best.height } : null,
    };
  });

  if (rowInfo && rowInfo.buttonRect) {
    await injectOverlay(page);
    await highlightRect(page, rowInfo.buttonRect);
    p = await caption(page, `לחיצה על "הצג הכל" ליד "${rowInfo.heading}" פותחת את הרשימה המלאה של כל המערכים באותו נושא`);
    await page.waitForTimeout(p);
    const cx = rowInfo.buttonRect.x + rowInfo.buttonRect.width / 2;
    const cy = rowInfo.buttonRect.y + rowInfo.buttonRect.height / 2;
    await hideCaption(page); await hideHighlight(page);
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(2200);
    await waitForImages(page);
    await injectOverlay(page);
    p = await caption(page, 'וכך נראית הרשימה המלאה - עם אותו אזור סינון מפורט שנפרט עליו בהמשך, בחלק החיפוש');
    await page.waitForTimeout(p);
    await hideCaption(page);
  }

  await hideLegend(page);
  p = await caption(page, 'יש עשרות שורות כאלה בעמוד הבית, שמתחלפות לפי החגים והתקופה בשנה - תמיד שווה לגלול ולבדוק מה חדש');
  await page.waitForTimeout(p);
  await hideCaption(page);

  // =========================================================
  // 2) עולמות תוכן - all 13 worlds, drilling to real lesson cards
  // =========================================================
  await page.goto('https://marpad.online/worlds');
  await page.waitForTimeout(1500);
  await injectOverlay(page);
  await showLegend(page, 1, NAV_LEGEND, '3 דרכים למצוא מערכים');
  p = await caption(page, 'דרך 2: עולמות תוכן - כל האתר מסודר כאן ב-13 עולמות נושאיים, מגיל הרך ועד חדר המורים');
  await page.waitForTimeout(p);
  await hideCaption(page);

  const toggle = page.getByText('רק הכיתות שלי', { exact: false }).first();
  if (await toggle.count()) {
    await step(page, toggle, 'המתג הזה מסנן ומציג רק תוכן שמתאים לכיתות שהוגדרו בפרופיל');
  }

  for (const world of WORLDS) {
    await page.goto('https://marpad.online' + world.url);
    await page.waitForTimeout(1300);
    await waitForImages(page);
    await injectOverlay(page);
    await showLegend(page, 1, NAV_LEGEND, '3 דרכים למצוא מערכים');
    const heading = page.getByText(world.name, { exact: true }).first();
    await highlight(page, heading);
    p = await caption(page, world.expand
      ? `"${world.name}" - עולם עצום עם מאות סדרות מיוחדות ומושקעות, לכל הגילאים`
      : `עולם "${world.name}"`);
    await page.waitForTimeout(Math.min(p, world.expand ? 2600 : 1800));
    await hideCaption(page); await hideHighlight(page);

    // drill down through sub-category tiles until reaching real lesson cards (results page)
    let drilled = false;
    let firstClickText = null;
    for (let depth = 0; depth < 3; depth++) {
      const isResultsPage = await page.getByText('סינון תוצאות', { exact: true }).count();
      if (isResultsPage) { drilled = true; break; }
      const tile = await page.evaluate(() => {
        const candidates = [...document.querySelectorAll('a,button')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.top > 300 && r.width > 100 && r.height > 100 && r.width < 500;
        });
        if (!candidates.length) return null;
        const el = candidates[0];
        const r = el.getBoundingClientRect();
        return { text: el.textContent.trim().slice(0, 30), rect: { x: r.x, y: r.y, width: r.width, height: r.height } };
      });
      if (!tile) break;
      if (depth === 0) {
        firstClickText = tile.text;
        await highlightRect(page, tile.rect);
        p = await caption(page, `לחיצה על תת-קטגוריה כמו "${tile.text}" ממשיכה לפרט לפי נושא`);
        await page.waitForTimeout(Math.min(p, 2200));
        await hideHighlight(page); await hideCaption(page);
      }
      try {
        await page.mouse.click(tile.rect.x + tile.rect.width / 2, tile.rect.y + tile.rect.height / 2);
        await page.waitForTimeout(1400);
        await waitForImages(page);
      } catch (e) { break; }
    }

    if (drilled) {
      await injectOverlay(page);
      const card = page.locator('h3').first();
      if (await card.count()) {
        await highlight(page, card);
        p = await caption(page, world.expand
          ? 'וכך זה נראה בפועל - כרטיס מערך אמיתי, מוכן להורדה ושימוש'
          : 'וכאן כבר רואים כרטיסי מערכים אמיתיים, מוכנים להורדה ושימוש');
        await page.waitForTimeout(Math.min(p, world.expand ? 2600 : 1800));
        await hideCaption(page); await hideHighlight(page);
      }
    }
  }

  await hideLegend(page);

  // =========================================================
  // 3) חיפוש
  // =========================================================
  await page.goto('https://marpad.online/');
  await page.waitForTimeout(1000);
  await injectOverlay(page);
  await showLegend(page, 2, NAV_LEGEND, '3 דרכים למצוא מערכים');
  const searchNav = page.getByText('חיפוש', { exact: true }).first();
  await step(page, searchNav, 'דרך 3: חיפוש - הכי מהיר כשיודעים בדיוק מה מחפשים', { clickAfter: true });
  await page.waitForTimeout(1000);

  await injectOverlay(page);
  const hotTopics = page.getByText('נושאים חמים', { exact: false }).first();
  if (await hotTopics.count()) {
    await step(page, hotTopics, 'מסך החיפוש מציע גם נושאים פופולריים ללחיצה ישירה, בלי להקליד כלום');
  }

  // ---- Full detailed search: שבת ----
  const searchBox = page.getByPlaceholder('חפשי נושא, מערך, פעילות, חג, מקצוע...');
  await highlight(page, searchBox);
  p = await caption(page, 'דוגמה מפורטת: מקלידים "שבת"');
  await page.waitForTimeout(p);
  await searchBox.click();
  await searchBox.pressSequentially('שבת', { delay: 65 });
  await page.waitForTimeout(500);
  await hideHighlight(page); await hideCaption(page);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2800);

  const count1 = await getResultCount(page);
  await injectOverlay(page);
  p = await caption(page, `${count1}! כל תוצאה מוצגת ככרטיס עם תמונה, כותרת, תיאור קצר ותגיות שמסבירות למה היא מתאימה`);
  await page.waitForTimeout(p);
  await hideCaption(page);

  const filterHeading = page.getByText('סינון תוצאות', { exact: true }).first();
  await step(page, filterHeading, 'בצד יש אזור סינון מפורט מאוד - נעבור על כל הקטגוריות אחת אחת');

  for (const f of FILTERS) {
    const el = page.getByText(f.label, { exact: true }).first();
    const foundCount = await el.count();
    if (!foundCount) { console.log('FILTER NOT FOUND:', f.label); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await el.click({ force: true }).catch((e) => console.log('FILTER CLICK FAILED:', f.label, e.message.slice(0, 60)));
    await page.waitForTimeout(400);
    await highlight(page, el);
    const box = await el.boundingBox();
    if (!box) console.log('FILTER NO BOUNDING BOX:', f.label);
    p = await caption(page, `${f.label}: ${f.desc}`);
    await page.waitForTimeout(Math.max(p, 2400));
    await hideHighlight(page); await hideCaption(page);
  }

  const sortDropdown = page.getByText('רלוונטיות', { exact: false }).first();
  if (await sortDropdown.count()) {
    await step(page, sortDropdown, 'ואפשר גם למיין את התוצאות: רלוונטיות, חדש ביותר, לפי שם, או לפי שכבת גיל');
  }
  await hideLegend(page);

  // ---- Quick pass: variety of domains ----
  await injectOverlay(page);
  p = await caption(page, 'ואותה שיטת חיפוש וסינון עובדת בדיוק אותו דבר לכל נושא - כמה דוגמאות מהירות:');
  await page.waitForTimeout(p);
  await hideCaption(page);

  for (const term of QUICK_SEARCHES) {
    await page.goto('https://marpad.online/search?q=' + encodeURIComponent(term));
    await page.waitForTimeout(2200);
    await waitForImages(page);
    const count = await getResultCount(page);
    await injectOverlay(page);
    await showLegend(page, 2, NAV_LEGEND, '3 דרכים למצוא מערכים');
    p = await caption(page, `"${term}" - ${count}`);
    await page.waitForTimeout(Math.min(p, 2200));
    await hideCaption(page);
  }
  await hideLegend(page);

  // ---- Closing ----
  await injectOverlay(page);
  p = await caption(page, 'אפשר לחפש כל תחום, כל סוג מערך וכל נושא - ותמיד למצוא בדיוק את מה שצריך');
  await page.waitForTimeout(p);
  await hideCaption(page);

  p = await caption(page, 'לסיכום: אפשר למצוא כל מערך בשלוש דרכים - מהעמוד הראשי, דרך עולמות התוכן, או בחיפוש מדויק');
  await page.waitForTimeout(p + 800);
  await hideCaption(page);

  console.log('Final URL:', page.url());
  await context.close();
  await browser.close();
  console.log('Part 2 video saved.');
})();
