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
- [x] **Conturi reale cu Supabase Auth** (email + parolă): ecran de conectare/înregistrare, confirmare pe email, mesaje de eroare în română, deconectare din Profil
- [x] **Probele de bac în onboarding**: specializarea (13 opțiuni, pe filiere/profiluri) fixează proba obligatorie E)c, iar E)d se alege din lista profilului, cu sub-opțiuni pentru Informatică (limbaj), Chimie, Biologie și Fizică (arii de pregătire). Structura e verificată pe modelele oficiale 2026; se poate modifica din Profil → „Probele mele"
- [x] Onboarding (nume + sesiunea de Bac) salvat pe cont, în `user_metadata` — fără tabele, fără RLS de configurat → countdown + notificări
- [x] Acasă: countdown Bac, streak 🔥, bară XP animată, continuă, simulare, reclamă mock
- [x] Materii arată doar „Probele tale" — cele trei probe scrise notate: E)a Limba și literatura română (obligatorie pentru toți), E)c proba profilului și E)d proba la alegere. Istoria e jucabilă doar dacă e chiar E)c a elevului; altfel toate cardurile sunt „În curând", iar Istoria rămâne accesibilă din „Continuă să înveți" pe Acasă
- [x] Quiz de învățare: 10 întrebări, feedback animat verde/roșu + explicație, XP
- [x] Simulare examen stil chestionar auto: 30 întrebări, timer 30 min cu auto-predare, grilă de navigare, notă 1–10, revizuirea greșelilor
- [x] Profil: statistici, realizări, toggle notificări, deconectare și ștergerea completă a datelor (profil de pe cont + progres + setări + Pro + notificări programate), urmată de deconectare — rămâne doar contul
- [x] Monetizare: 1 simulare/zi gratuit, 3 explicații gratuite la examen, paywall Pro **2 €/lună, 7 zile gratis** (mock, pregătit pentru RevenueCat), reclamele dispar la Pro

## Limitări cunoscute (demo)

- **Notificările nu merg în Expo Go** (Android SDK 53+) — serviciul devine no-op elegant; merg complet într-un development build (`npx expo run:android`).
- Reclamele și plata sunt mock-uri elegante în spatele interfețelor `AdService` / `MonetizationService` — se înlocuiesc cu AdMob / RevenueCat fără a atinge ecranele.
- Pro se activează local (nu există server); pentru a reveni la starea free, șterge datele aplicației Expo Go sau dezinstaleaz-o.
- **Progresul (XP, serie, stele) rămâne local pe telefon**, nu urmează contul. Dacă intră alt cont pe același telefon, progresul se resetează, ca să nu moștenească XP-ul altcuiva.
- Proiectul Supabase cere confirmarea emailului, iar mailerul implicit e limitat la câteva mesaje pe oră. Pentru demo, oprește „Confirm email" din **Authentication → Sign In / Providers → Email**.

## Roadmap după demo

- Probele de competențe (A orală română, C limbă străină, D digitale) și, pentru minorități, E)b + B — momentan aplicația acoperă doar cele trei probe scrise notate

- AdMob real (banner + interstitial) — necesită dev build EAS + cont AdMob
- RevenueCat + abonament real în Play Store / App Store
- Materiile: Română, Geografie, Matematică (M1/M2)
- Sincronizarea progresului între dispozitive (tabel `progress` în Supabase + RLS)
- Clasamente și dueluri între utilizatori
- Build iOS + publicare în ambele store-uri
- Notificări push remote (campanii înainte de sesiune)

## Cum rulezi

```bash
npm install
cp .env.example .env   # apoi completează cheile Supabase
npm run android        # emulator Android (sau scanează QR cu Expo Go: npm start)
npx tsc --noEmit                      # verificarea principală
npx tsx scripts/validate-content.ts   # validare conținut întrebări
```

`.env` nu e urmărit de git — șablonul comis e `.env.example`, iar valorile se iau din
Supabase → Project Settings → API Keys. Sunt citite la pornirea Metro, așa că după ce le
modifici repornește cu `npx expo start --clear`.
