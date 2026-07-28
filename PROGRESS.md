# BacPro — Progres

Aplicație gamificată pentru pregătirea Bacalaureatului (stil „Școala Rutieră", dar pentru Bac).
Spec: `docs/superpowers/specs/2026-07-28-bacpro-demo-design.md` · Plan: `docs/superpowers/plans/2026-07-28-bacpro-demo.md`

## Status curent

🚧 În lucru — Task 1 (scaffold) în curs.

## Făcut

- [x] Design + spec aprobat
- [x] Plan de implementare (12 task-uri)
- [x] Scaffold Expo SDK 57 (template default: expo-router, TypeScript, Reanimated) + dependențe (AsyncStorage, expo-notifications, react-native-svg, zustand)
- [x] Temă vizuală (`src/theme/index.ts`)

## De făcut (demo)

- [ ] Task 2: Conținut — 72 întrebări Istorie + script de validare
- [ ] Task 3: Store-uri persistate + logică gamification (XP, niveluri, streak, stele)
- [ ] Task 4: Servicii — notificări locale, reclame mock, monetizare mock
- [ ] Task 5: Navigare (tab-uri Acasă/Materii/Profil) + componente de bază
- [ ] Task 6: Onboarding (nume + data Bacului)
- [ ] Task 7: Ecran Acasă (countdown Bac, streak, XP, continuă)
- [ ] Task 8: Materii + capitole Istorie cu stele
- [ ] Task 9: Quiz de învățare cu feedback animat + explicații
- [ ] Task 10: Simulare examen (30 întrebări, timer, grilă navigare, notă)
- [ ] Task 11: Profil + realizări + control notificări
- [ ] Task 12: Paywall Pro (2 €/lună, 7 zile gratis) + polish final

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
