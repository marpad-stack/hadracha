# Marpad Tutorial Video Project - Status

## Where things stand (updated during session)

**Part 1 - כל דרכי ההתחברות: DONE.**
Final videos in `videos/part1/`:
- `חלק1-איכות-גבוהה.mp4` (high quality)
- `חלק1-לוואטסאפ.mp4` (compact, for sending via WhatsApp)
Script: `part1-login.js`. Reviewed frame-by-frame and approved.

**Part 2 - איך למצוא מערכים (ניווט/עולמות תוכן/חיפוש): IN PROGRESS, NOT YET APPROVED.**
Script: `part2-navigation.js`. A full 11:01 recording was produced on 2026-09-08 and
reviewed by the user. Exports in `videos/part2/`:
- `חלק2-איכות-גבוהה.mp4` (31.4MB)
- `חלק2-לוואטסאפ.mp4` (7.5MB)
**NOT approved** - the user watched it and gave 9 specific corrections, listed below.
These are the next thing to work on.

### Part 2 scope, as most recently agreed with the user:
1. Opening: mention that the viewer should confirm they're logged in (see Part 1).
2. Home page section: sweep through most/all row headings (not just 1-2), highlight
   the quick-filter pills on a "show all" landing page, special emphasis on
   "פרשת השבוע" (updates weekly). **"המשך מהיכן שהפסקת" row is explicitly SKIPPED
   for now** - the user will send a real screenshot of it from her own account (it
   didn't appear on the test account even after simulating views) to be composited
   in later, same technique as the real email/WhatsApp captures in Part 1.
3. עולמות תוכן: ALL 13 worlds (not just 6) - גיל הרך, יסודי, חטיבה ותיכון,
   חינוך מיוחד, חדר מורים, הורים, **הסדרות המיוחדות (589 מערכים - needs extra
   emphasis)**, פרשת השבוע, שיעורי מקצוע, חגים ומועדים, ממ"דף, תקופת חירום,
   חוויות הקיץ. For each: drill down through sub-category tiles until reaching
   real lesson-plan cards (some worlds need 1 click, some need 2 - script handles
   this dynamically by checking for the "סינון תוצאות" filter sidebar as the
   signal that real results were reached).
4. חיפוש: full detailed filter walkthrough (all 11 filter categories) on the
   search term "שבת", then a quick pass (query + live result count only) through:
   מבצע כיתתי, עיצובי קירות, כישורי חיים, ניקיון, אסיפות הורים, תעודות.
5. Must be gender-neutral phrasing throughout (avoid "אתן/אתם", use forms like
   "התחברת"/"שכחת" that read the same for any gender). Must feel professional,
   no stuck/flickering/overlapping UI, nothing "written strangely."

### USER'S 9 CORRECTIONS on the 2026-09-08 recording (NOT yet implemented - START HERE):
1. **Cut the login.** The first seconds show the login happening. The video should
   open with the user already logged in.
2. **Drop the parenthetical** "(כפי שנראה בחלק 1)" from the opening caption.
3. **The legend intro flip is too fast.** The 3-step flip through the legend at the
   start is unclear and ugly - either show it steadily or drop the flip.
4. **~20 unclear seconds near the start.** It highlights the "עולמות תוכן" row while
   the legend says "כותרות בעמוד הבית" - mismatched, and nothing useful is being
   shown. It should scroll further down and present this in an orderly way.
5. **Pacing.** Not too long, not too fast - each segment long enough to see and
   understand, without dragging.
6. **The first 5.5 minutes drag** with no clear explanation of the main headings.
   What it SHOULD do: move through at a normal pace and show *logically* that there
   are headings for the current//upcoming season, each with lesson plans grouped
   conveniently under it; and demonstrate ONCE, inside a single heading, that there
   are internal filter buttons that make it easier.
7. **עולמות תוכן runs far too fast.**
8. **Cover the various series** - פרשת השבוע and the like.
9. **Search is relatively good.** But when it moves to the filters on the right,
   something about the presentation is not clear enough.

### Bugs found and fixed on 2026-09-08 (these produced the recording above):
- **Row headings were never highlighted.** The home-page sweep matched
  `querySelectorAll('h2,h3')` and took the first visible match. The site uses H2 for
  row headings (only 8 on the home page) and H3 for card titles (~524 of them), so
  it was highlighting random cards. Now matches H2 only. Verified against the live
  DOM before re-recording.
- **The highlight box flew across the screen** between targets - it had
  `transition: all 0.45s` in `tutorial-helpers.js`. Now transitions opacity only, so
  it fades in and out in place without animating position.
- **Highlight box landed off-target.** Rects were measured immediately after a
  `mouse.wheel` scroll, before the scroll settled and images finished loading. Now
  each heading is scrolled to centre with `scrollIntoView({behavior:'instant'})`,
  the page is allowed to settle, and the rect is re-measured just before highlighting.
- **Duplicate style tags.** `injectOverlay` ran `addStyleTag` on every call (dozens
  per run). Now guarded with a `data-tut-styled` flag on the document element.
- **"הצג הכל" was searched for as `<button>` only**; the site may render them as
  links. Now searches `button,a`.

### Bugs found and fixed in the earlier session:
- Filter-loop was silently skipping 2 of 11 categories ("פורמט למידה",
  "ליב״ה ומקצועות כלליים") because Playwright's click was failing an internal
  stability check and the failure was being swallowed silently. Fixed with
  `{ force: true }` on the click, verified all 11 now work (tested standalone).
- Hardcoded result counts in captions (can drift over time) replaced with a
  `getResultCount()` helper that reads the live count from the page.
- Added `waitForImages()` helper to avoid highlighting cards whose thumbnails
  haven't finished loading yet (was causing "broken image" look).

### Home page structure, as measured on the live site 2026-09-08:
The home page has exactly **8 H2 row headings** (and ~524 H3 card titles). At the
time of measurement the rows were: `📚 עולמות תוכן`, `פתיחת שנה`, `סביבות למידה`,
`חודש אלול`, `ראש השנה`, `חגי תשרי: צום גדליה, עשרת ימי תשובה, יום כיפור וסוכות`,
`חודש תשרי`, `חדש באתר: המערכים האחרונים שעלו`. There were 8 "הצג הכל" controls.
**Note: there is currently no "פרשת השבוע" row on the home page** (it is holiday
season), even though the brief asks for special emphasis on it - it only appears as
its own content world. Rows change with the season, so never hardcode this list.

### Open / unresolved when the session was paused:
- RESOLVED: the earlier complaint that it "didn't mark the headings" and was
  "a mess" turned out to be the H2/H3 and `transition: all` bugs listed above.
- **The 9 corrections above are the live to-do list.** Most of them are about
  pacing and about the home-page section being long but uninformative.
- Still waiting on the user to send a real screenshot of her own account's
  "המשך מהיכן שהפסקת" row, to composite into Part 2 later.

## Environment notes (for a fresh session / different computer)
- Real login credentials are in `credentials.js` (gitignored, not committed -
  copy `credentials.example.js` to `credentials.js` and fill in real values
  on a fresh checkout).
- Site: https://marpad.online/ (Hebrew, RTL, "הארה למעשה" educational content platform).
- Node + Playwright (`channel: 'chrome'`, using the system-installed Chrome
  rather than downloading Chromium, because Chromium's own download was
  blocked by network security software on the original machine).
- Video recording via Playwright's built-in `recordVideo` (produces .webm).
  This requires an ffmpeg binary at
  `%LOCALAPPDATA%\ms-playwright\ffmpeg-1011\ffmpeg-win64.exe`, because
  Playwright's own `npx playwright install ffmpeg` download was network-blocked.
  **Redo this on every new machine.** Confirmed working recipe (2026-09-08):
  ```powershell
  npm install
  $d = "$env:LOCALAPPDATA\ms-playwright\ffmpeg-1011"
  New-Item -ItemType Directory -Force -Path $d
  Copy-Item .\node_modules\ffmpeg-static\ffmpeg.exe "$d\ffmpeg-win64.exe"
  ```
  The `1011` revision number must match `ffmpeg`'s `revision` in
  `node_modules/playwright-core/browsers.json` - check it rather than assuming.
  Note npm 11+ blocks package install scripts by default, so `ffmpeg-static`'s
  postinstall may not run; verify `node_modules/ffmpeg-static/ffmpeg.exe` exists
  (~79MB) before copying.
- Git is installed but **not on PATH** in fresh shells on the Windows machine.
  Either use the full path `C:\Program Files\Git\cmd\git.exe`, or refresh PATH:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
  The same applies right after any `winget install` - shells opened earlier keep
  the stale PATH.
- Converting the recorded .webm to the two MP4 deliverables:
  ```powershell
  $ff = ".\node_modules\ffmpeg-static\ffmpeg.exe"
  & $ff -y -i in.webm -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -movflags +faststart "חלק2-איכות-גבוהה.mp4"
  & $ff -y -i in.webm -vf "scale=960:540" -c:v libx264 -preset medium -crf 29 -pix_fmt yuv420p -movflags +faststart "חלק2-לוואטסאפ.mp4"
  ```
- `node_modules/ffmpeg-static/ffmpeg.exe` is also used directly (via
  `./node_modules/ffmpeg-static/ffmpeg.exe`) for all post-processing: cropping
  screenshots, building the blur/spotlight composite for the WhatsApp capture,
  and converting final .webm output to .mp4.
- `tutorial-helpers.js` has the shared overlay/caption/legend/highlight system
  used by both part1 and part2 scripts - reusable for future parts too.
- Real captured assets already in the folder: `real-email-cropped.png`,
  `real-forgot-pw.png`, `whatsapp-spotlight.png` - these are real screenshots
  from the user's own accounts (cropped/blurred to remove unrelated personal
  info) and are already safe to reuse/composite into videos.

## Remaining parts (from the user's original brief, not started yet)
- **Part 3**: small but important tips - add to favorites, find a
  previously-used lesson plan that "disappeared" (this is likely the same
  "המשך מהיכן שהפסקת" feature from Part 2), how to send feedback/comments on
  a lesson plan.
- **Part 4**: full orientation inside a single lesson plan (מערך) - pick one
  with lots of folders/materials, explain title/description/details, how to
  view/download/share, and all features. Verify everything shown actually
  works before including it.
- **Final pass**: the user asked for a review pass at the end to catch
  anything missing from the whole tutorial series.
