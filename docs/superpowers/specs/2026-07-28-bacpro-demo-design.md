# BacPro — Demo Design (2026-07-28)

Aplicație React Native gamificată pentru pregătirea Bacalaureatului, în stilul aplicațiilor de chestionare auto („Școala Rutieră"), dar pentru materiile de bac. Acest document acoperă **demo-ul**: materia Istorie completă, gamification, monetizare mock, notificări locale reale.

## Obiectiv

Un demo care rulează în emulatorul Android pe Windows (via Expo), arată complet și profesionist, și e pregătit structural pentru integrări reale ulterioare (AdMob, RevenueCat, backend).

## Stack

- **Expo (SDK curent, managed workflow)** + **TypeScript**
- **expo-router** — navigare pe fișiere (tabs + stack)
- **react-native-reanimated** — animații
- **Zustand + AsyncStorage** — state global persistat local (progres, streak, XP, setări, pro)
- **expo-notifications** — notificări locale reale
- **@expo/vector-icons / Ionicons** — iconițe outline în repaus, filled când sunt active (tab bar, butoane)

Fără backend în demo. Tot conținutul este JSON local.

## Design vizual

- Minimalist modern: fundal deschis (#FAFAFA-ish), un singur accent **indigo**, carduri rotunjite (border-radius mare), umbre subtile, tipografie mare și aerisită.
- Micro-animații: scale la apăsarea butoanelor, feedback verde/roșu animat la răspuns, inele de progres animate, bară XP care se umple, celebrare la finalul testului.
- Iconițe Ionicons: perechi `*-outline` / filled — outline inactiv, filled activ.

## Ecrane

1. **Onboarding** — nume + data Bacului (default: sesiunea iunie următoare) → pornește countdown și notificări. Se arată o singură dată.
2. **Acasă (tab)** — countdown „X zile până la Bac", flacără streak, nivel + bară XP animată, buton „Continuă" (ultimul capitol în lucru), banner reclamă mock.
3. **Materii (tab)** — Istorie activă; Română, Geografie, Matematică ca „În curând" (dezactivate, cu badge).
4. **Capitole Istorie** — pe programa reală de bac: Romanitatea românilor; Autonomii locale și instituții centrale; Statul român modern; Constituțiile României; România postbelică; România și concertul european / relații internaționale. Fiecare capitol: progres + stele (0–3, după acuratețe).
5. **Quiz de învățare** — 10 întrebări/rundă din capitolul ales; 4 variante; feedback instant cu explicație; XP la final.
6. **Simulare examen** — stil chestionar auto: 30 întrebări din toate capitolele, timer 30 min, grilă de navigare între întrebări (poți sări/reveni), notă estimată la final (scala 1–10, prag promovare 5). Free: 1 simulare/zi; Pro: nelimitat.
7. **Rezultat** — scor animat, notă, XP câștigat, răspunsuri greșite cu explicații (explicații complete = Pro; free vede primele 3).
8. **Profil (tab)** — statistici (întrebări răspunse, acuratețe), realizări (badge-uri), calendar streak, buton Pro, reset progres.
9. **Paywall Pro** — 2€/lună, 7 zile gratis. Beneficii: fără reclame, explicații detaliate complete, simulări nelimitate, statistici avansate. Buton mock care activează Pro local (flag), în spatele unei interfețe `MonetizationService` pregătită pentru RevenueCat.

## Gamification

- **XP**: +10/răspuns corect în învățare, bonus la rundă perfectă; simularea dă XP proporțional cu nota.
- **Niveluri**: praguri XP crescătoare (ex. nivel n cere ~100·n XP).
- **Streak**: zile consecutive cu cel puțin o rundă terminată; flacără pe Acasă; reminder seara dacă streak-ul e în pericol.
- **Stele pe capitol**: 0–3 după cea mai bună acuratețe (≥60%/≥80%/100%).
- **Realizări**: set mic (prima rundă, primul 10, streak 7 zile, prima simulare promovată etc.).

## Conținut

- ~70 întrebări de Istorie scrise pe programa de bac, distribuite pe cele 6 capitole, fiecare cu: id, capitol, text, 4 variante, indexul răspunsului corect, explicație, dificultate.
- **Script de validare** (`scripts/validate-content.ts`, rulabil cu `npx tsx`): fiecare întrebare are exact 4 variante, exact un răspuns corect valid, id unic, explicație nevidă, capitol existent.

## Monetizare & notificări (demo)

- **Reclame**: componentă `AdBanner` mock cu design elegant, în spatele unei interfețe `AdService` — swap ulterior la AdMob fără rescriere. Pro le ascunde.
- **Pro**: `MonetizationService` cu implementare mock (persistă flag local). API compatibil conceptual cu RevenueCat (getOffers / purchase / restore / isPro).
- **Notificări locale reale**: (1) reminder streak zilnic seara; (2) countdown Bac („Mai sunt X zile!") la intervale; programate cu expo-notifications, configurabile din Profil.

## Arhitectură

```
app/                    # expo-router
  (tabs)/               # Acasă, Materii, Profil
  quiz/[chapterId].tsx  # quiz învățare
  exam.tsx, results.tsx, paywall.tsx, onboarding.tsx
src/
  components/           # AnswerButton, ProgressRing, StreakFlame, AdBanner, XpBar...
  stores/               # useProgressStore, useSettingsStore, useProStore
  services/             # notifications.ts, monetization.ts, ads.ts
  data/                 # istorie.json + tipuri
  theme/                # culori, spacing, tipografie
scripts/validate-content.ts
PROGRESS.md             # status + roadmap, ținut la zi
```

## Erori & edge cases

- Progresul se salvează la fiecare răspuns (nu doar la final).
- Ieșire din quiz/simulare → dialog de confirmare; simularea abandonată consumă încercarea zilnică.
- Timer expirat în simulare → auto-submit cu răspunsurile date.
- Permisiune notificări refuzată → aplicația merge normal, toggle-ul din Profil arată starea.

## Testare

- Script de validare conținut (obligatoriu, rulat înainte de commit-ul conținutului).
- TypeScript strict.
- Verificare manuală în emulator pe fluxurile principale (onboarding → învățare → simulare → paywall).

## În afara demo-ului (roadmap în PROGRESS.md)

AdMob real, RevenueCat + IAP, restul materiilor, backend + conturi, clasamente/duel, iOS build, publicare în store-uri.
