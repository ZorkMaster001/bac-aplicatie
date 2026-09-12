import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type AuthError } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    'Lipsesc EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY. ' +
      'Verifică fișierul .env și repornește Metro cu `npx expo start --clear`.'
  );
}

// Sesiunea stă în AsyncStorage, ca toate celelalte store-uri ale aplicației.
// detectSessionInUrl e pentru OAuth pe web — pe mobil nu există bară de adrese.
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase răspunde în engleză, interfața e integral în română.
// Codurile de mai jos sunt verificate direct pe proiect (vezi /auth/v1).
const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email sau parolă greșită.',
  email_not_confirmed:
    'Confirmă-ți emailul înainte să intri în cont — verifică-ți inboxul.',
  user_already_exists: 'Există deja un cont cu acest email.',
  email_exists: 'Există deja un cont cu acest email.',
  weak_password: 'Parola trebuie să aibă cel puțin 6 caractere.',
  same_password: 'Parola nouă trebuie să fie diferită de cea veche.',
  over_email_send_rate_limit:
    'Prea multe emailuri trimise. Încearcă din nou peste câteva minute.',
  over_request_rate_limit: 'Prea multe încercări. Mai așteaptă puțin.',
  validation_failed: 'Verifică datele introduse.',
  signup_disabled: 'Înregistrările sunt oprite momentan.',
};

export function authErrorMessage(error: AuthError | null): string {
  if (!error) return 'Ceva n-a mers. Încearcă din nou.';
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (/network|fetch|timeout/i.test(error.message))
    return 'Nu există conexiune la internet.';
  return 'Ceva n-a mers. Încearcă din nou.';
}
