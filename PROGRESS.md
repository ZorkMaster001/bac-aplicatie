# BacPro — Progres

Aplicație gamificată pentru pregătirea Bacalaureatului (stil „Școala Rutieră", dar pentru Bac).
Spec: `docs/superpowers/specs/2026-07-28-bacpro-demo-design.md` · Plan: `docs/superpowers/plans/2026-07-28-bacpro-demo.md`

## Status curent

✅ **Demo complet și verificat în emulator (Pixel 7, Expo Go).** Toate cele 12 task-uri din plan sunt gata.

## Făcut

- [x] Design + spec aprobat · Plan de implementare (12 task-uri)
- [x] Scaffold Expo SDK 57 (expo-router, TypeScript, Reanimated 4) + AsyncStorage, expo-notifications, react-native-svg, zustand
- [x] Temă vizuală minimalistă (indigo, carduri rotunjite, Ionicons outline↔filled)
- [x] Conținut: **72 întrebări Istorie** (12 × 6 capitole din programa reală) + explicații + script validare (`npm run validate`)
- [x] Gamification: XP + niveluri, streak zilnic, stele pe capitol (60/80/100%), 5 realizări
- [x] Store-uri persistate local (progres, setări, pro) — supraviețuiesc restartului
- [x] Onboarding (nume + sesiunea de Bac) → countdown + notificări
- [x] Acasă: countdown Bac, streak 🔥, bară XP animată, continuă, simulare, reclamă mock
- [x] Materii (Istorie activă; Română/Geografie/Mate „În curând" cu shake) + capitole cu stele
- [x] Quiz de învățare: 10 întrebări, feedback animat verde/roșu + explicație, XP
- [x] Simulare examen stil chestionar auto: 30 întrebări, timer 30 min cu auto-predare, grilă de navigare, notă 1–10, revizuirea greșelilor
- [x] Profil: statistici, realizări, toggle notificări, reset progres
- [x] Monetizare: 1 simulare/zi gratuit, 3 explicații gratuite la examen, paywall Pro **2 €/lună, 7 zile gratis** (mock, pregătit pentru RevenueCat), reclamele dispar la Pro

## Limitări cunoscute (demo)

- **Notificările nu merg în Expo Go** (Android SDK 53+) — serviciul devine no-op elegant; merg complet într-un development build (`npx expo run:android`).
- Reclamele și plata sunt mock-uri elegante în spatele interfețelor `AdService` / `MonetizationService` — se înlocuiesc cu AdMob / RevenueCat fără a atinge ecranele.
- Pro se activează local (nu există server); pentru a reveni la starea free, șterge datele aplicației Expo Go sau dezinstaleaz-o.

## Roadmap după demo

- AdMob real (banner + interstitial) — necesită dev build EAS + cont AdMob
- RevenueCat + abonament real în Play Store / App Store
- Materiile: Română, Geografie, Matematică (M1/M2)
- Backend + conturi utilizatori + sincronizare progres
- Clasamente și dueluri între utilizatori
- Build iOS + publicare în ambele store-uri
- Notificări push remote (campanii înainte de sesiune)

## Cum rulezi

```bash
npm install
npm run android   # emulator Android (sau scanează QR cu Expo Go: npm start)
npx tsx scripts/validate-content.ts   # validare conținut întrebări
```
