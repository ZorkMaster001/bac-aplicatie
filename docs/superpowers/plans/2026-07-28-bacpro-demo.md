# BacPro Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gamified React Native (Expo) demo app for the Romanian Bacalaureat — History subject fully playable with learning quizzes, exam simulation, XP/streak gamification, mock ads, mock Pro paywall, and real local notifications.

**Architecture:** Expo managed workflow with expo-router (tabs + stacks). All content is local JSON validated by a script. Global state in Zustand stores persisted to AsyncStorage. Monetization and ads sit behind service interfaces with mock implementations so real AdMob/RevenueCat can be swapped in later without rewrites.

**Tech Stack:** Expo SDK (latest, `default` template = TypeScript + expo-router), react-native-reanimated, zustand, @react-native-async-storage/async-storage, expo-notifications, react-native-svg, Ionicons (@expo/vector-icons).

## Global Constraints

- Language of ALL user-facing copy: **Romanian** (diacritics required).
- Design: light minimalist — bg `#F7F7FA`, cards `#FFFFFF`, accent indigo `#4F46E5`, success `#16A34A`, error `#DC2626`, radius 16–24, Ionicons outline↔filled pairing (outline inactive, filled active).
- No backend, no real payments, no real ad SDK in the demo. Notifications are real but **local only**.
- Verification per task: `npx tsc --noEmit` passes; content task also runs `npx tsx scripts/validate-content.ts`.
- Commit at the end of every task. No jest in demo; correctness of content enforced by validation script, logic kept in pure helpers.
- Grade formula everywhere: `nota = 1 + 9 * (corecte / total)`, rounded to 2 decimals; pass threshold 5.
- XP rules: +10 per correct answer in learning; perfect 10/10 run bonus +50; exam XP = `round(nota * 20)`. Level from XP: cumulative threshold `100·n` per level (see `levelFromXp`).
- Free limits: 1 exam simulation per day; only first 3 wrong-answer explanations in exam results; ads visible. Pro removes all three.

---

### Task 1: Scaffold Expo app + theme + PROGRESS.md

**Files:**
- Create: Expo app at repo root (`app/`, `package.json`, etc. via create-expo-app `default` template)
- Create: `src/theme/index.ts`
- Create: `PROGRESS.md`

**Interfaces:**
- Produces: `theme` export — `colors` (bg, card, text, textMuted, accent, accentSoft, success, successSoft, error, errorSoft, gold, border), `spacing(n)=4·n`, `radius = {md:16, lg:24}`, `type = {h1:28, h2:22, body:16, small:13}` — used by every screen/component.

- [ ] **Step 1: Scaffold** — Run `npx create-expo-app@latest . --template default --no-install` then `npm install`. Template ships expo-router + TS + tabs. Delete example screens' body content later per task; keep structure now. If create-expo-app refuses non-empty dir, scaffold into `tmp-app/` and move contents up (preserve `.git`, `LICENSE`, `docs/`).
- [ ] **Step 2: Install deps** — `npx expo install react-native-reanimated @react-native-async-storage/async-storage expo-notifications react-native-svg` and `npm install zustand`.
- [ ] **Step 3: Theme** — Write `src/theme/index.ts`:

```ts
export const colors = {
  bg: '#F7F7FA', card: '#FFFFFF', text: '#17171C', textMuted: '#6E6E7A',
  accent: '#4F46E5', accentSoft: '#EEF0FE', success: '#16A34A', successSoft: '#EAF8F0',
  error: '#DC2626', errorSoft: '#FDEEEE', gold: '#F59E0B', border: '#ECECF1',
};
export const spacing = (n: number) => n * 4;
export const radius = { md: 16, lg: 24 };
export const type = { h1: 28, h2: 22, body: 16, small: 13 };
```

- [ ] **Step 4: PROGRESS.md** — Create with sections: `## Status curent`, `## Făcut`, `## De făcut (demo)` (list Tasks 2–12 as unchecked), `## Roadmap după demo` (AdMob real, RevenueCat, Română/Geografie/Mate, backend + conturi, clasamente, iOS, store release). Keep updated at every task end.
- [ ] **Step 5: Verify + commit** — `npx tsc --noEmit` passes. `git add -A; git commit -m "feat: scaffold Expo app with theme and progress tracker"`.

### Task 2: Content — types, 70 History questions, validation script

**Files:**
- Create: `src/data/types.ts`, `src/data/chapters.ts`, `src/data/istorie.json`, `src/data/index.ts`
- Create: `scripts/validate-content.ts`

**Interfaces:**
- Produces: `Question { id: string; chapterId: ChapterId; text: string; options: string[]; correctIndex: number; explanation: string; difficulty: 1|2|3 }`; `ChapterId = 'romanitatea'|'autonomii'|'stat-modern'|'constitutii'|'postbelica'|'relatii-int'`; `CHAPTERS: { id: ChapterId; title: string; icon: keyof typeof Ionicons.glyphMap; iconActive: string; blurb: string }[]`; `getQuestionsByChapter(id): Question[]`; `getExamQuestions(n=30): Question[]` (shuffled, spread across chapters, seeded by `Date.now()`).

- [ ] **Step 1: Write types + chapters** — `chapters.ts` titles: Romanitatea românilor; Autonomii locale și instituții centrale; Statul român modern; Constituțiile României; România postbelică; România și relațiile internaționale. Icons (outline/filled pairs): `earth-outline/earth`, `shield-outline/shield`, `flag-outline/flag`, `document-text-outline/document-text`, `time-outline/time`, `globe-outline/globe`.
- [ ] **Step 2: Write validation script first** (it is the test):

```ts
// scripts/validate-content.ts — run: npx tsx scripts/validate-content.ts
import questions from '../src/data/istorie.json';
import { CHAPTERS } from '../src/data/chapters';
const ids = new Set<string>(); const errors: string[] = [];
const perChapter: Record<string, number> = {};
for (const q of questions as any[]) {
  if (!q.id || ids.has(q.id)) errors.push(`id lipsă/duplicat: ${q.id}`);
  ids.add(q.id);
  if (!CHAPTERS.some(c => c.id === q.chapterId)) errors.push(`${q.id}: capitol invalid ${q.chapterId}`);
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`${q.id}: trebuie exact 4 variante`);
  if (new Set(q.options).size !== 4) errors.push(`${q.id}: variante duplicate`);
  if (![0,1,2,3].includes(q.correctIndex)) errors.push(`${q.id}: correctIndex invalid`);
  if (!q.explanation?.trim()) errors.push(`${q.id}: explicație lipsă`);
  if (![1,2,3].includes(q.difficulty)) errors.push(`${q.id}: dificultate invalidă`);
  perChapter[q.chapterId] = (perChapter[q.chapterId] ?? 0) + 1;
}
for (const c of CHAPTERS) if ((perChapter[c.id] ?? 0) < 10) errors.push(`capitol ${c.id}: sub 10 întrebări (${perChapter[c.id] ?? 0})`);
if ((questions as any[]).length < 70) errors.push(`total sub 70 (${(questions as any[]).length})`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${(questions as any[]).length} întrebări valide.`);
```

- [ ] **Step 3: Run script → expect FAIL** (no JSON yet / empty array).
- [ ] **Step 4: Author 72 questions** (12 per chapter) in `istorie.json`, factually correct per the real Bac programa, each with a genuine 1–2 sentence explanation. Example shape:

```json
{ "id": "rom-01", "chapterId": "romanitatea", "difficulty": 1,
  "text": "În ce an a avut loc cucerirea Daciei de către Traian?",
  "options": ["101–102 d.Hr.", "105–106 d.Hr.", "271 d.Hr.", "87 d.Hr."],
  "correctIndex": 1,
  "explanation": "Al doilea război daco-roman (105–106 d.Hr.) s-a încheiat cu transformarea celei mai mari părți a Daciei în provincie romană." }
```

- [ ] **Step 5: Run script → expect PASS.** Also `npx tsc --noEmit`.
- [ ] **Step 6: Commit** — `git commit -m "feat: history question bank with validation script"`.

### Task 3: Stores (progress, settings, pro) + gamification helpers

**Files:**
- Create: `src/stores/persist.ts` (zustand `persist` + AsyncStorage adapter)
- Create: `src/lib/gamification.ts`, `src/lib/dates.ts`
- Create: `src/stores/useProgressStore.ts`, `src/stores/useSettingsStore.ts`, `src/stores/useProStore.ts`

**Interfaces:**
- Produces `src/lib/gamification.ts`: `levelFromXp(xp): { level: number; intoLevel: number; needed: number }` (thresholds 100·n cumulative); `starsForAccuracy(acc): 0|1|2|3` (≥0.6→1, ≥0.8→2, 1.0→3); `gradeFromScore(correct, total): number`; `xpForRun(correct, total): number` (10·correct, +50 if perfect and total≥10); `xpForExam(nota): number`.
- Produces `src/lib/dates.ts`: `todayKey(): string` ('YYYY-MM-DD' local); `daysUntil(iso: string): number`; `nextBacDate(): string` (next June 15 in the future).
- Produces `useProgressStore`: state `{ xp, streakCount, lastActiveDay, chapters: Record<ChapterId,{bestAccuracy:number; runs:number}>, answered, correct, examDay, examsToday, achievements: string[] }`; actions `addAnswer(correct)`, `completeRun(chapterId, correct, total)` (updates bestAccuracy, xp, streak via todayKey, unlocks achievements), `completeExam(nota)`, `canStartExam(isPro): boolean`, `registerExamStart()`, `resetAll()`.
- Produces `useSettingsStore`: `{ name, bacDate, onboarded, notificationsEnabled, setName, setBacDate, completeOnboarding, setNotificationsEnabled }`.
- Produces `useProStore`: `{ isPro, activatePro(), deactivatePro() }`.
- Achievement ids: `first-run`, `perfect-run`, `streak-7`, `first-exam-pass`, `level-5`.

- [ ] **Step 1: Write pure helpers** (`gamification.ts`, `dates.ts`) exactly per the interfaces above.
- [ ] **Step 2: Sanity-check helpers** with a throwaway `npx tsx -e` one-liner: `levelFromXp(0).level===1`, `levelFromXp(100).level===2`, `gradeFromScore(30,30)===10`, `gradeFromScore(0,30)===1`, `starsForAccuracy(0.8)===2`. Fix until all true.
- [ ] **Step 3: Write the three stores** with `persist(..., { name: 'bacpro-progress' | 'bacpro-settings' | 'bacpro-pro', storage: createJSONStorage(() => AsyncStorage) })`. Streak logic in `completeRun`: if `lastActiveDay === todayKey()` keep; else if it was yesterday → `streakCount+1`; else → `streakCount = 1`.
- [ ] **Step 4: Verify + commit** — `npx tsc --noEmit`; `git commit -m "feat: persisted stores and gamification logic"`.

### Task 4: Services — notifications, ads, monetization (mock)

**Files:**
- Create: `src/services/notifications.ts`, `src/services/monetization.ts`, `src/services/ads.ts`

**Interfaces:**
- `notifications.ts`: `requestPermission(): Promise<boolean>`; `rescheduleAll(bacDate: string): Promise<void>` — cancels all, then schedules (a) daily streak reminder 19:30 „🔥 Nu-ți pierde seria! O rundă scurtă și ești safe.", (b) one-off „📚 Mai sunt X zile până la Bac!" at 30/14/7/3/1 days before `bacDate` at 09:00; `cancelAll()`. Uses `expo-notifications` with `setNotificationHandler` shown in-app.
- `monetization.ts`: `export interface MonetizationService { getOffer(): { priceMonthly: string; trialDays: number }; purchase(): Promise<boolean>; restore(): Promise<boolean> }`; `export const monetization: MonetizationService` = mock returning `{ priceMonthly: '2 €', trialDays: 7 }`, `purchase()` waits 1200ms then `useProStore.getState().activatePro()` and resolves true.
- `ads.ts`: `export interface AdService { shouldShowAds(): boolean }` — mock returns `!useProStore.getState().isPro`.

- [ ] **Step 1: Implement all three files** per interfaces (notifications guard: skip scheduling if permission denied; wrap in try/catch so emulator without permission never crashes).
- [ ] **Step 2: Verify + commit** — `npx tsc --noEmit`; `git commit -m "feat: notification, ads and monetization services"`.

### Task 5: Router skeleton + shared UI primitives

**Files:**
- Modify: `app/_layout.tsx` (root Stack, onboarding redirect), `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx` (Acasă stub), `app/(tabs)/materii.tsx`, `app/(tabs)/profil.tsx` (stubs), `app/onboarding.tsx` (stub), `app/quiz/[chapterId].tsx`, `app/exam.tsx`, `app/results.tsx`, `app/paywall.tsx` (stubs)
- Create: `src/components/Screen.tsx`, `src/components/Card.tsx`, `src/components/PressableScale.tsx`, `src/components/AdBanner.tsx`
- Delete: template example screens/components not used.

**Interfaces:**
- `PressableScale` — `{ onPress, disabled?, style?, children }`: Reanimated press-in scale to 0.97 with spring back; base building block for ALL buttons.
- `Screen` — SafeArea + bg + padding wrapper `{ children, scroll?: boolean }`.
- `Card` — white card, radius.lg, subtle shadow, `{ style?, children, onPress? }` (wraps PressableScale when onPress given).
- `AdBanner` — if `shouldShowAds()` false → null; else 60px card „🎯 Reclamă · Locul tău aici" + subtle „Scapă de reclame cu Pro →" link to `/paywall`.
- Tab bar: Ionicons outline↔filled — Acasă `home-outline/home`, Materii `library-outline/library`, Profil `person-outline/person`; active tint `colors.accent`, labels Romanian.
- Root layout: if `!onboarded` → `<Redirect href="/onboarding" />`; Stack screens for quiz/exam/results/paywall with `headerShown: false`, paywall as `presentation: 'modal'`.

- [ ] **Step 1: Build primitives** (`PressableScale` with `useSharedValue` + `withSpring`; `Screen`; `Card`; `AdBanner`).
- [ ] **Step 2: Rewrite router files**, stubs render screen title only. Remove template leftovers.
- [ ] **Step 3: Boot check** — `npx expo start --android` (or `--web` fallback if emulator absent): tabs switch, icons flip outline→filled, onboarding redirect fires. Then `npx tsc --noEmit`.
- [ ] **Step 4: Commit** — `git commit -m "feat: navigation skeleton and UI primitives"`.

### Task 6: Onboarding

**Files:**
- Modify: `app/onboarding.tsx`

**Interfaces:**
- Consumes: `useSettingsStore` (`setName`, `setBacDate`, `completeOnboarding`), `notifications.requestPermission/rescheduleAll`, `nextBacDate()`.

- [ ] **Step 1: Implement 2-step pager** (state-driven, animated with Reanimated `FadeInRight`): step 1 — hero icon `school-outline`, title „Pregătește-te de Bac ca la un joc", TextInput nume; step 2 — data Bacului (default `nextBacDate()`, editable year/month/day chips), buton „Începe" → save settings, `completeOnboarding()`, request permission + `rescheduleAll(bacDate)`, `router.replace('/(tabs)')`.
- [ ] **Step 2: Manual check** in emulator (fresh install path: use `resetAll` later; for now clear app data). `npx tsc --noEmit`.
- [ ] **Step 3: Commit** — `git commit -m "feat: onboarding flow"`.

### Task 7: Home (Acasă)

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `src/components/XpBar.tsx`, `src/components/StreakFlame.tsx`, `src/components/CountdownCard.tsx`

**Interfaces:**
- `XpBar` — `{ xp: number }`: uses `levelFromXp`; animated fill width (withTiming 600ms), shows „Nivel N · X/Y XP".
- `StreakFlame` — `{ count: number }`: `flame` filled icon gold when count>0 else `flame-outline` muted; count label „zile la rând".
- `CountdownCard` — `{ bacDate: string }`: big number `daysUntil(bacDate)`, „zile până la Bac", accent gradient-free indigo card with white text.
- Home layout: greeting „Salut, {name} 👋", CountdownCard, row [StreakFlame | XpBar], „Continuă să înveți" Card → last active chapter (or first) linking `/quiz/[chapterId]`, „Simulare examen" Card → `/exam` with `document-text-outline` icon, AdBanner at bottom.

- [ ] **Step 1: Build the three components + compose the screen.** Entrance: staggered `FadeInDown.delay(i*80)` per card.
- [ ] **Step 2: Manual check** — XP bar animates, countdown correct vs device date. `npx tsc --noEmit`.
- [ ] **Step 3: Commit** — `git commit -m "feat: home screen with countdown, streak and XP"`.

### Task 8: Materii + Capitole

**Files:**
- Modify: `app/(tabs)/materii.tsx`
- Create: `app/istorie.tsx` (chapter list), `src/components/StarRow.tsx`

**Interfaces:**
- Materii grid (2 col): Istorie card active (icon `time-outline`, overall % progress ring text) → `/istorie`; Română/Geografie/Matematică cards with `lock-closed-outline` + badge „În curând", 50% opacity, onPress shows small shake animation (Reanimated sequence ±4px), not navigation.
- `StarRow` — `{ stars: 0|1|2|3 }`: three `star`/`star-outline` icons, gold when earned.
- `/istorie`: list of `CHAPTERS` Cards — icon, title, blurb, `StarRow(starsForAccuracy(bestAccuracy))`, „X întrebări", chevron; tap → `/quiz/[chapterId]`.

- [ ] **Step 1: Implement both screens.**
- [ ] **Step 2: Manual check + `npx tsc --noEmit`.**
- [ ] **Step 3: Commit** — `git commit -m "feat: subjects and history chapters screens"`.

### Task 9: Learning quiz + AnswerButton + run results

**Files:**
- Modify: `app/quiz/[chapterId].tsx`
- Create: `src/components/AnswerButton.tsx`, `src/components/QuizProgressBar.tsx`

**Interfaces:**
- `AnswerButton` — `{ label, state: 'idle'|'selected-correct'|'selected-wrong'|'reveal-correct'|'disabled', onPress }`: card-style option; correct → successSoft bg + success border + `checkmark-circle` icon; wrong → errorSoft/error + `close-circle`; wrong answer shakes (translateX sequence).
- Quiz flow: session = 10 random questions from chapter (shuffle once on mount). Per question: tap → lock, color states, `addAnswer(correct)`, show explanation panel (`SlideInDown`) with „Explicație" + text, button „Următoarea". After 10 → `completeRun(chapterId, correct, 10)` then `router.replace({ pathname: '/results', params: { mode: 'run', correct, total: 10, chapterId } })`.
- Exit guard: back press → `Alert.alert('Sigur ieși?', 'Progresul rundei se pierde.')`.
- `QuizProgressBar` — `{ index, total }` animated segment fill.

- [ ] **Step 1: Build AnswerButton + progress bar.**
- [ ] **Step 2: Build quiz screen state machine** (`idx`, `answers[]`, `phase: 'answering'|'feedback'`).
- [ ] **Step 3: Manual play-through of a full run** in emulator; verify XP/streak update on Home. `npx tsc --noEmit`.
- [ ] **Step 4: Commit** — `git commit -m "feat: learning quiz with animated feedback"`.

### Task 10: Exam simulation + results screen

**Files:**
- Modify: `app/exam.tsx`, `app/results.tsx`
- Create: `src/components/QuestionGrid.tsx`, `src/components/TimerPill.tsx`

**Interfaces:**
- Exam intro screen state: rules card (30 întrebări, 30 min, notă minimă 5), „Începe simularea" → checks `canStartExam(isPro)`; if false → inline card „Ai folosit simularea gratuită de azi" + CTA `/paywall`; else `registerExamStart()` and start.
- `TimerPill` — `{ secondsLeft }` mm:ss, turns error-red under 5 min; parent ticks via `setInterval`, auto-submits at 0.
- `QuestionGrid` — `{ total: 30, currentIndex, answers: (number|null)[], onJump(i) }`: wrap of numbered chips — filled accent = answered, outlined accent = current, gray outline = empty.
- Exam screen: question + 4 AnswerButtons (selectable, changeable, NO feedback), prev/next, grid toggle (bottom sheet style expand), „Predă testul" with confirm Alert. On submit: compute correct, `nota = gradeFromScore`, `completeExam(nota)`, → `/results?mode=exam&correct=&total=30`.
- `/results`: animated score count-up (Reanimated), big nota badge (success if ≥5 else error), „+X XP", stars for run mode; exam mode lists wrong answers with explanations — free tier shows first 3 then a locked Card „Deblochează toate explicațiile cu Pro" → `/paywall`. Buttons: „Încă o rundă" / „Acasă".

- [ ] **Step 1: Build TimerPill + QuestionGrid.**
- [ ] **Step 2: Build exam flow** (intro → running → submit path, timer auto-submit, daily gate).
- [ ] **Step 3: Build results screen** for both modes.
- [ ] **Step 4: Manual full exam play-through** (shorten timer mentally, don't ship debug values). `npx tsc --noEmit`.
- [ ] **Step 5: Commit** — `git commit -m "feat: exam simulation with timer, grid navigation and results"`.

### Task 11: Profil + realizări + notificări

**Files:**
- Modify: `app/(tabs)/profil.tsx`
- Create: `src/components/AchievementBadge.tsx`

**Interfaces:**
- Profil: header (avatar circle with initial, name, „Nivel N"), stats row (întrebări răspunse, acuratețe %, cea mai bună notă), achievements grid (`AchievementBadge { id, title, icon, unlocked }` — 5 achievements from Task 3 list; locked = outline icon + 40% opacity), notifications toggle (Switch → `setNotificationsEnabled` + `rescheduleAll`/`cancelAll`), Pro status Card (activ ✓ / „Treci la Pro" → `/paywall`), „Resetează progresul" (confirm Alert → `resetAll`).

- [ ] **Step 1: Implement screen + badge component.**
- [ ] **Step 2: Manual check + `npx tsc --noEmit`.**
- [ ] **Step 3: Commit** — `git commit -m "feat: profile with achievements and notification controls"`.

### Task 12: Paywall + final polish + PROGRESS.md update

**Files:**
- Modify: `app/paywall.tsx`, `PROGRESS.md`

**Interfaces:**
- Paywall (modal): close X, `sparkles` icon hero, „BacPro Pro", benefit rows (each Ionicon + text: fără reclame; explicații complete; simulări nelimitate; statistici avansate), price card „2 €/lună · primele 7 zile gratuite", CTA `PressableScale` „Începe perioada gratuită" → `monetization.purchase()` with loading spinner → success state „Ești Pro! 🎉" auto-dismiss; „Restaurează achizițiile" link.

- [ ] **Step 1: Implement paywall.**
- [ ] **Step 2: Full demo pass in emulator:** onboarding → home → learn run → exam (hit free gate on 2nd) → paywall → pro removes ads/gates → profile. Fix visual nits found.
- [ ] **Step 3: Run `npx tsx scripts/validate-content.ts` + `npx tsc --noEmit`.**
- [ ] **Step 4: Update PROGRESS.md** — mark demo tasks done, note known limitations, roadmap next steps.
- [ ] **Step 5: Commit** — `git commit -m "feat: pro paywall and demo polish"`.
