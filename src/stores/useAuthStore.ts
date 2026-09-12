import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { getSpecializare, isProbaDId, type ProbaDId, type SpecializareId } from '../data/bac';
import { useProgressStore } from './useProgressStore';

export interface Profile {
  name: string;
  bacDate: string;
  specializareId: SpecializareId;
  probaD: ProbaDId;
  // Normalizat mereu la listă: Fizica are două arii, restul o singură valoare.
  probaDOptiune: string[];
}

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User) => void;
}

// Profilul trăiește în user_metadata — fără tabele, fără RLS de configurat.
// supabase-js persistă tot obiectul user, deci numele și data Bacului sunt
// disponibile și offline, la pornirea aplicației.
// Atenție: user_metadata conține din oficiu email/sub, deci verificăm exact
// cheile noastre, nu dacă obiectul e gol.
export function optiuneList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string');
  return typeof raw === 'string' && raw ? [raw] : [];
}

export function profileFrom(user: User | null): Profile | null {
  const meta = user?.user_metadata;
  const name = meta?.name;
  const bacDate = meta?.bac_date;
  if (typeof name !== 'string' || !name.trim()) return null;
  if (typeof bacDate !== 'string' || !bacDate) return null;

  // Specializarea fixează E)c și restrânge lista de la E)d, deci profilul nu e
  // complet fără ea. Un id necunoscut (dată veche sau stricată) trimite
  // utilizatorul înapoi în onboarding, în loc să pice mai târziu.
  const spec = getSpecializare(meta?.bac_specializare);
  if (!spec) return null;

  const probaD = meta?.bac_proba_d;
  if (!isProbaDId(probaD) || !spec.probaD.includes(probaD)) return null;

  return {
    name,
    bacDate,
    specializareId: spec.id,
    probaD,
    probaDOptiune: optiuneList(meta?.bac_proba_d_optiune),
  };
}

// Progresul e local pe telefon. Dacă intră alt cont pe același dispozitiv,
// pornește de la zero în loc să moștenească XP-ul altcuiva.
//
// Store-ul de progres se hidratează asincron din AsyncStorage, la fel ca
// sesiunea Supabase. Dacă am revendica înainte de hidratare, valorile
// persistate ar suprascrie imediat rezultatul și schimbarea de cont ar trece
// neobservată — deci așteptăm hidratarea când e cazul.
function claimProgress(user: User | null) {
  if (!user) return;
  const { persist } = useProgressStore;
  if (persist.hasHydrated()) {
    useProgressStore.getState().claimFor(user.id);
    return;
  }
  const unsubscribe = persist.onFinishHydration(() => {
    useProgressStore.getState().claimFor(user.id);
    unsubscribe();
  });
}

// Nepersistat intenționat: sesiunea e ținută de supabase-js în AsyncStorage.
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  user: null,
  profile: null,

  setSession: (session) => {
    const user = session?.user ?? null;
    claimProgress(user);
    set({
      status: user ? 'signedIn' : 'signedOut',
      user,
      profile: profileFrom(user),
    });
  },

  setUser: (user) => {
    claimProgress(user);
    set({ status: 'signedIn', user, profile: profileFrom(user) });
  },
}));
