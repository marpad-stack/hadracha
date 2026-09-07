async function injectOverlay(page) {
  await page.addStyleTag({
    content: `
      #tut-highlight-box {
        position: fixed; z-index: 999998; pointer-events: none;
        border: 4px solid #FFD400; border-radius: 12px;
        box-shadow: 0 0 0 4px rgba(107,27,120,0.55), 0 0 24px 6px rgba(255,212,0,0.7);
        transition: all 0.45s cubic-bezier(.4,0,.2,1);
        opacity: 0;
      }
      #tut-highlight-box.show { opacity: 1; }
      #tut-caption-bar {
        position: fixed; left: 0; right: 0; bottom: 0; width: 100%; pointer-events: none;
        background: linear-gradient(180deg, rgba(75,21,84,0.92), #3a1042 60%);
        color: #fff; padding: 22px 40px 26px; box-sizing: border-box;
        font-family: Arial, sans-serif; font-size: 30px; font-weight: 800; line-height: 1.35;
        direction: rtl; text-align: center;
        box-shadow: 0 -6px 30px rgba(0,0,0,0.45); z-index: 999999;
        border-top: 5px solid #FFD400;
        opacity: 0; transform: translateY(16px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      #tut-caption-bar.show { opacity: 1; transform: translateY(0); }
      #tut-caption-bar .tut-icon { margin-left: 10px; }
      #tut-legend {
        position: fixed; top: 24px; left: 24px; z-index: 999999; pointer-events: none;
        background: rgba(43,10,48,0.88); border: 2px solid #FFD400; border-radius: 16px;
        padding: 16px 20px; font-family: Arial, sans-serif; direction: rtl; text-align: right;
        box-shadow: 0 6px 20px rgba(0,0,0,0.35); opacity: 0; transition: opacity 0.3s ease;
      }
      #tut-legend.show { opacity: 1; }
      #tut-legend .tut-legend-title { color: #FFD400; font-size: 15px; font-weight: 800; margin-bottom: 8px; }
      #tut-legend .tut-legend-item { color: rgba(255,255,255,0.55); font-size: 17px; font-weight: 600; padding: 3px 0; transition: all 0.3s ease; }
      #tut-legend .tut-legend-item.active { color: #fff; font-size: 20px; font-weight: 800; }
      #tut-legend .tut-legend-item.active .tut-legend-num { background:#FFD400; color:#3a1042; }
      #tut-legend .tut-legend-num { display:inline-block; width:20px; height:20px; line-height:20px; text-align:center; border-radius:50%; background:rgba(255,255,255,0.25); color:#fff; font-size:12px; margin-left:8px; }
      .tut-email-mask { position:fixed; z-index:999997; background:#fff; display:flex; align-items:center; direction:ltr; font-family:Arial, sans-serif; border-radius:4px; }
    `
  });
  await page.evaluate(() => {
    if (!document.getElementById('tut-highlight-box')) {
      const box = document.createElement('div');
      box.id = 'tut-highlight-box';
      document.body.appendChild(box);
    }
    if (!document.getElementById('tut-caption-bar')) {
      const cap = document.createElement('div');
      cap.id = 'tut-caption-bar';
      document.body.appendChild(cap);
    }
    if (!document.getElementById('tut-legend')) {
      const leg = document.createElement('div');
      leg.id = 'tut-legend';
      document.body.appendChild(leg);
    }
  });
}

async function caption(page, text) {
  const pause = Math.min(5200, Math.max(2600, text.length * 75));
  await page.evaluate((t) => {
    const cap = document.getElementById('tut-caption-bar');
    cap.innerHTML = '<span class="tut-icon">👉</span>' + t;
    cap.classList.add('show');
  }, text);
  return pause;
}

async function hideCaption(page) {
  await page.evaluate(() => {
    document.getElementById('tut-caption-bar').classList.remove('show');
  });
}

async function highlight(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -140));
  await new Promise(r => setTimeout(r, 250));
  const box = await locator.boundingBox();
  if (!box) return;
  await page.evaluate((b) => {
    const el = document.getElementById('tut-highlight-box');
    el.style.left = (b.x - 8) + 'px';
    el.style.top = (b.y - 8) + 'px';
    el.style.width = (b.width + 16) + 'px';
    el.style.height = (b.height + 16) + 'px';
    el.classList.add('show');
  }, box);
}

async function highlightRect(page, rect) {
  await page.evaluate((b) => {
    const el = document.getElementById('tut-highlight-box');
    el.style.left = (b.x - 8) + 'px';
    el.style.top = (b.y - 8) + 'px';
    el.style.width = (b.width + 16) + 'px';
    el.style.height = (b.height + 16) + 'px';
    el.classList.add('show');
  }, rect);
}

async function hideHighlight(page) {
  await page.evaluate(() => {
    document.getElementById('tut-highlight-box').classList.remove('show');
  });
}

const LEGEND_ITEMS = ['Google', 'קוד בוואטסאפ', 'קוד במייל', 'מייל וסיסמה'];
const LEGEND_TITLE_DEFAULT = '4 דרכים להתחברות';

async function showLegend(page, activeIndex, items = LEGEND_ITEMS, title = LEGEND_TITLE_DEFAULT) {
  await page.evaluate(({ items, active, title }) => {
    const leg = document.getElementById('tut-legend');
    leg.innerHTML = '<div class="tut-legend-title">' + title + '</div>' +
      items.map((it, i) => `<div class="tut-legend-item${i === active ? ' active' : ''}"><span class="tut-legend-num">${i + 1}</span>${it}</div>`).join('');
    leg.classList.add('show');
  }, { items, active: activeIndex, title });
}

async function hideLegend(page) {
  await page.evaluate(() => {
    const leg = document.getElementById('tut-legend');
    if (leg) leg.classList.remove('show');
  });
}

async function step(page, locator, text, { clickAfter = false, extraPause = 0 } = {}) {
  await injectOverlay(page);
  await highlight(page, locator);
  const pause = await caption(page, text);
  await page.waitForTimeout(pause + extraPause);
  if (clickAfter) {
    await locator.click();
    await hideHighlight(page);
    await hideCaption(page);
    await page.waitForTimeout(500);
  }
}

async function maskStaticText(page, realText, fakeText) {
  const rects = await page.evaluate((real) => {
    const results = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(real)) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          results.push({ x: r.x, y: r.y, w: r.width, h: r.height });
        }
      }
    }
    return results;
  }, realText);
  for (const r of rects) {
    await page.evaluate(({ r, fake }) => {
      const cover = document.createElement('div');
      cover.className = 'tut-email-mask';
      cover.style.left = r.x + 'px';
      cover.style.top = r.y + 'px';
      cover.style.width = r.w + 'px';
      cover.style.height = r.h + 'px';
      cover.style.fontSize = Math.max(13, r.h * 0.62) + 'px';
      cover.style.color = '#333';
      cover.style.justifyContent = 'center';
      cover.textContent = fake;
      document.body.appendChild(cover);
    }, { r, fake: fakeText });
  }
}

async function typeMaskedEmail(page, locator, realEmail, fakeEmail) {
  await page.evaluate(() => {
    document.querySelectorAll('.tut-email-mask').forEach(el => el.remove());
  });
  await locator.click();
  await locator.fill('');
  const box = await locator.boundingBox();
  await page.evaluate((b) => {
    const cover = document.createElement('div');
    cover.id = 'tut-email-typing-mask';
    cover.className = 'tut-email-mask';
    cover.style.left = b.x + 'px';
    cover.style.top = b.y + 'px';
    cover.style.width = b.width + 'px';
    cover.style.height = b.height + 'px';
    cover.style.fontSize = Math.max(14, b.height * 0.4) + 'px';
    cover.style.color = '#333';
    cover.style.paddingRight = '14px';
    cover.style.boxSizing = 'border-box';
    document.body.appendChild(cover);
  }, box);

  for (let i = 1; i <= fakeEmail.length; i++) {
    await page.evaluate((partial) => {
      const cover = document.getElementById('tut-email-typing-mask');
      if (cover) cover.textContent = partial;
    }, fakeEmail.slice(0, i));
    await page.waitForTimeout(55);
  }
  await locator.fill(realEmail);
}

async function showFullscreenImage(page, base64Png) {
  await page.evaluate(() => {
    document.querySelectorAll('.tut-email-mask').forEach(el => el.remove());
  });
  await page.evaluate((b64) => {
    let overlay = document.getElementById('tut-fullscreen-capture');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tut-fullscreen-capture';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:999995;background:#2b0a30;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.35s ease;';
      const img = document.createElement('img');
      img.id = 'tut-fullscreen-img';
      img.style.cssText = 'max-width:88%;max-height:78%;border-radius:14px;border:3px solid #FFD400;box-shadow:0 12px 40px rgba(0,0,0,0.5);';
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }
    document.getElementById('tut-fullscreen-img').src = 'data:image/png;base64,' + b64;
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.style.opacity = '1';
  }, base64Png);
}

async function hideFullscreenImage(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById('tut-fullscreen-capture');
    if (overlay) overlay.style.opacity = '0';
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const overlay = document.getElementById('tut-fullscreen-capture');
    if (overlay) overlay.remove();
  });
}

async function reapplyEmailMask(page, locator, fakeEmail) {
  await page.evaluate(() => {
    document.querySelectorAll('.tut-email-mask').forEach(el => el.remove());
  });
  const box = await locator.boundingBox();
  if (!box) return;
  await page.evaluate(({ b, fake }) => {
    const cover = document.createElement('div');
    cover.id = 'tut-email-typing-mask';
    cover.className = 'tut-email-mask';
    cover.style.left = b.x + 'px';
    cover.style.top = b.y + 'px';
    cover.style.width = b.width + 'px';
    cover.style.height = b.height + 'px';
    cover.style.fontSize = Math.max(14, b.height * 0.4) + 'px';
    cover.style.color = '#333';
    cover.style.paddingRight = '14px';
    cover.style.boxSizing = 'border-box';
    cover.textContent = fake;
    document.body.appendChild(cover);
  }, { b: box, fake: fakeEmail });
}

async function clearEmailMasks(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.tut-email-mask').forEach(el => el.remove());
  });
}

async function ensureActive(locator) {
  const cls = await locator.getAttribute('class');
  if (!cls || !cls.includes('bg-primary-pale')) {
    await locator.click();
  }
}

module.exports = {
  injectOverlay, caption, hideCaption, highlight, hideHighlight, step,
  showLegend, hideLegend, LEGEND_ITEMS, maskStaticText, typeMaskedEmail,
  showFullscreenImage, hideFullscreenImage, ensureActive, reapplyEmailMask, clearEmailMasks,
  highlightRect,
};
