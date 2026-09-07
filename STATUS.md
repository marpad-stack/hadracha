# Marpad Tutorial Video Project - Status

## Where things stand (updated during session)

**Part 1 - כל דרכי ההתחברות: DONE.**
Final videos in `videos/part1/`:
- `חלק1-איכות-גבוהה.mp4` (high quality)
- `חלק1-לוואטסאפ.mp4` (compact, for sending via WhatsApp)
Script: `part1-login.js`. Reviewed frame-by-frame and approved.

**Part 2 - איך למצוא מערכים (ניווט/עולמות תוכן/חיפוש): IN PROGRESS, NOT YET APPROVED.**
Script: `part2-navigation.js`. Latest webm not yet produced/reviewed (recording was
stopped mid-run by user request - see below). No approved MP4 exports yet for Part 2.

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

### Bugs already found and fixed in part2-navigation.js during this session:
- Filter-loop was silently skipping 2 of 11 categories ("פורמט למידה",
  "ליב״ה ומקצועות כלליים") because Playwright's click was failing an internal
  stability check and the failure was being swallowed silently. Fixed with
  `{ force: true }` on the click, verified all 11 now work (tested standalone).
- Hardcoded result counts in captions (can drift over time) replaced with a
  `getResultCount()` helper that reads the live count from the page.
- Added `waitForImages()` helper to avoid highlighting cards whose thumbnails
  haven't finished loading yet (was causing "broken image" look).

### Open / unresolved when the session was paused:
- The user said the latest attempt "read the lines wrong" / wasn't good
  (message: "זה ממש לא טוב והוא לא קרא את השורות כמו שצריך") but the session
  was paused before she could clarify exactly what was wrong. **First thing
  next session: ask her to clarify what specifically was wrong** before
  re-recording blindly - possibly the drill-down captions/logic for the 13
  worlds (untested end-to-end at full length before the stop), or something
  about how a specific line/caption was read/phrased.
- The recording that was running (via `node part2-navigation.js`) was killed
  mid-run at the user's request - no video was produced from that run. The
  `videos/part2/` folder may contain a partial/incomplete .webm from the
  killed process - **check and probably delete before the next real run.**
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
  This required manually placing an `ffmpeg-static` binary at
  `%LOCALAPPDATA%\ms-playwright\ffmpeg-1011\ffmpeg-win64.exe` on the machine
  where this was set up, because Playwright's own `npx playwright install
  ffmpeg` download was also network-blocked. **On a different computer this
  may need to be redone** - check if that file exists; if not, `npm install`
  the `ffmpeg-static` package (already in package.json) and copy its bundled
  `ffmpeg.exe` to that path, or find another way to get Playwright video
  recording working there.
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
