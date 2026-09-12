import { profileFrom } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/useProgressStore';
import { useProStore } from '../stores/useProStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { cancelAll } from './notifications';
import { authErrorMessage, supabase } from './supabase';

export type WipeResult = { ok: true } | { ok: false; message: string };

// Șterge tot ce ține de utilizator și îl deconectează. Supraviețuiește doar
// contul în sine (email + parolă), ca să se poată reconecta.
//
// Ce se șterge: profilul de pe cont (nume, data Bacului), progresul complet
// (XP, serie, stele, realizări, statistici), setările locale, statutul Pro și
// notificările programate pe telefon.
export async function wipeAllDataAndSignOut(): Promise<WipeResult> {
  // Profilul stă pe server, deci se șterge cât timp sesiunea e încă validă —
  // adică înaintea deconectării.
  const { data, error: profileError } = await supabase.auth.updateUser({
    data: {
      name: null,
      bac_date: null,
      bac_specializare: null,
      bac_proba_d: null,
      bac_proba_d_optiune: null,
    },
  });
  // Mai bine deloc decât pe jumătate: dacă profilul nu se poate șterge
  // (de exemplu fără internet), datele locale rămân neatinse.
  if (profileError) return { ok: false, message: authErrorMessage(profileError) };

  // Verificăm pe răspunsul serverului, cu exact aceeași regulă folosită de
  // poarta din (tabs): dacă profilul ar supraviețui, am șterge datele locale
  // degeaba și utilizatorul ar sări peste onboarding la următoarea conectare.
  if (data.user && profileFrom(data.user) !== null) {
    return { ok: false, message: 'Profilul nu a putut fi șters de pe cont. Încearcă din nou.' };
  }

  // Reminderele sunt programate pe dispozitiv, pornind de la data Bacului.
  await cancelAll();

  useProgressStore.getState().wipe();
  useSettingsStore.getState().setNotificationsEnabled(false);
  useProStore.getState().deactivatePro();

  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    return {
      ok: false,
      message: `Datele au fost șterse, dar deconectarea nu a reușit: ${authErrorMessage(
        signOutError
      )}`,
    };
  }
  return { ok: true };
}
