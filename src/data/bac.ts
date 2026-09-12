import type { Ionicons } from '@expo/vector-icons';

// Structura probelor de bacalaureat, verificată pe modelele oficiale 2026
// (subiecte.edu.ro/2026/bacalaureat/modeledesubiecte/probescrise).
//
//   E)a  Limba și literatura română — obligatorie pentru toți.
//   E)b  Limba și literatura maternă — doar pentru minoritățile naționale.
//   E)c  Proba obligatorie a profilului — NU se alege, o fixează specializarea.
//   E)d  Proba la alegere — singura alegere reală, din lista profilului.
//
// Reforma („bacalaureat diferențiat") intră în vigoare abia din 2030, deci
// structura de mai jos e valabilă pentru sesiunile până atunci.

type IoniconName = keyof typeof Ionicons.glyphMap;

export type ProbaCId = 'matematica' | 'istorie';

// Exact aceste patru programe apar în modelele oficiale 2026.
export type MatePrograma = 'M_mate-info' | 'M_st-nat' | 'M_tehnologic' | 'M_pedagogic';

export type ProbaDId =
  | 'fizica'
  | 'chimie'
  | 'biologie'
  | 'informatica'
  | 'geografie'
  | 'logica'
  | 'psihologie'
  | 'economie'
  | 'sociologie'
  | 'filosofie';

export type SpecializareId =
  | 'mate-info'
  | 'st-nat'
  | 'filologie'
  | 'st-sociale'
  | 'teh-servicii'
  | 'teh-tehnic'
  | 'teh-resurse'
  | 'voc-militar-mi'
  | 'voc-artistic'
  | 'voc-teologic'
  | 'voc-sportiv'
  | 'voc-pedagogic-inv'
  | 'voc-pedagogic-alt';

export interface Specializare {
  id: SpecializareId;
  label: string;
  group: string;
  probaC: ProbaCId;
  matePrograma?: MatePrograma;
  probaD: ProbaDId[];
}

// Listele de la E)d, pe profiluri. Atenție la diferența ușor de ratat:
// profilul uman are Sociologie, cel vocațional nu.
const D_REAL: ProbaDId[] = ['fizica', 'chimie', 'biologie', 'informatica'];
const D_UMAN: ProbaDId[] = ['geografie', 'logica', 'psihologie', 'economie', 'sociologie', 'filosofie'];
const D_SERVICII: ProbaDId[] = ['geografie', 'logica', 'psihologie', 'economie'];
const D_TEHNIC: ProbaDId[] = ['fizica', 'chimie', 'biologie'];
const D_VOCATIONAL: ProbaDId[] = ['geografie', 'logica', 'psihologie', 'economie', 'filosofie'];

const G_REAL = 'Teoretic — real';
const G_UMAN = 'Teoretic — uman';
const G_TEH = 'Tehnologic';
const G_VOC = 'Vocațional';

export const SPECIALIZARI: Specializare[] = [
  { id: 'mate-info', label: 'Matematică-informatică', group: G_REAL, probaC: 'matematica', matePrograma: 'M_mate-info', probaD: D_REAL },
  { id: 'st-nat', label: 'Științe ale naturii', group: G_REAL, probaC: 'matematica', matePrograma: 'M_st-nat', probaD: D_REAL },

  { id: 'filologie', label: 'Filologie', group: G_UMAN, probaC: 'istorie', probaD: D_UMAN },
  { id: 'st-sociale', label: 'Științe sociale', group: G_UMAN, probaC: 'istorie', probaD: D_UMAN },

  { id: 'teh-servicii', label: 'Servicii', group: G_TEH, probaC: 'matematica', matePrograma: 'M_tehnologic', probaD: D_SERVICII },
  { id: 'teh-tehnic', label: 'Tehnic', group: G_TEH, probaC: 'matematica', matePrograma: 'M_tehnologic', probaD: D_TEHNIC },
  { id: 'teh-resurse', label: 'Resurse naturale și protecția mediului', group: G_TEH, probaC: 'matematica', matePrograma: 'M_tehnologic', probaD: D_TEHNIC },

  { id: 'voc-militar-mi', label: 'Militar — matematică-informatică', group: G_VOC, probaC: 'matematica', matePrograma: 'M_mate-info', probaD: D_REAL },
  { id: 'voc-pedagogic-inv', label: 'Pedagogic — învățători-educatoare', group: G_VOC, probaC: 'matematica', matePrograma: 'M_pedagogic', probaD: D_VOCATIONAL },
  { id: 'voc-pedagogic-alt', label: 'Pedagogic — altă specializare', group: G_VOC, probaC: 'istorie', probaD: D_VOCATIONAL },
  { id: 'voc-artistic', label: 'Artistic', group: G_VOC, probaC: 'istorie', probaD: D_VOCATIONAL },
  { id: 'voc-teologic', label: 'Teologic', group: G_VOC, probaC: 'istorie', probaD: D_VOCATIONAL },
  { id: 'voc-sportiv', label: 'Sportiv', group: G_VOC, probaC: 'istorie', probaD: D_VOCATIONAL },
];

export const SPECIALIZARE_GROUPS = [G_REAL, G_UMAN, G_TEH, G_VOC];

export interface Disciplina {
  label: string;
  // Nume scurt pentru rânduri înguste (Acasă, Profil).
  short?: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

// E)a — Limba și literatura română. Obligatorie pentru toți, indiferent de
// filieră, profil sau specializare, deci nu se alege și nu se întreabă nimic.
export const PROBA_A: Disciplina = {
  label: 'Limba și literatura română',
  short: 'Română',
  icon: 'book-outline',
  iconActive: 'book',
};

export function shortLabel(d: Disciplina): string {
  return d.short ?? d.label;
}

export const PROBE_D: Record<ProbaDId, Disciplina> = {
  fizica: { label: 'Fizică', icon: 'nuclear-outline', iconActive: 'nuclear' },
  chimie: { label: 'Chimie', icon: 'flask-outline', iconActive: 'flask' },
  biologie: { label: 'Biologie', icon: 'leaf-outline', iconActive: 'leaf' },
  informatica: { label: 'Informatică', icon: 'code-slash-outline', iconActive: 'code-slash' },
  geografie: { label: 'Geografie', icon: 'map-outline', iconActive: 'map' },
  logica: { label: 'Logică și argumentare', icon: 'git-branch-outline', iconActive: 'git-branch' },
  psihologie: { label: 'Psihologie', icon: 'happy-outline', iconActive: 'happy' },
  economie: { label: 'Economie', icon: 'cash-outline', iconActive: 'cash' },
  sociologie: { label: 'Sociologie', icon: 'people-outline', iconActive: 'people' },
  filosofie: { label: 'Filosofie', icon: 'bulb-outline', iconActive: 'bulb' },
};

export const PROBE_C: Record<ProbaCId, Disciplina> = {
  matematica: { label: 'Matematică', icon: 'calculator-outline', iconActive: 'calculator' },
  istorie: { label: 'Istorie', icon: 'time-outline', iconActive: 'time' },
};

export interface SubOptionChoice {
  value: string;
  label: string;
  hint?: string;
}

export interface SubOption {
  title: string;
  note?: string;
  pick: number; // câte variante se aleg
  choices: SubOptionChoice[];
}

// Doar Informatică, Chimie și Biologie se declară la înscriere — au subiecte
// separate în modelele oficiale. Fizica are UN singur subiect cu patru arii,
// din care candidatul rezolvă două alese în sală, deci aici e doar o
// preferință de studiu, nu o declarație.
export const SUB_OPTIONS: Partial<Record<ProbaDId, SubOption>> = {
  informatica: {
    title: 'Limbajul de programare',
    note: 'Programa (mate-info sau științe ale naturii) urmează specializarea, nu se alege.',
    pick: 1,
    choices: [
      { value: 'c', label: 'C/C++' },
      { value: 'pascal', label: 'Pascal' },
    ],
  },
  chimie: {
    title: 'Ce chimie dai?',
    pick: 1,
    choices: [
      { value: 'anorganica', label: 'Chimie anorganică' },
      { value: 'organica', label: 'Chimie organică' },
    ],
  },
  biologie: {
    title: 'Ce programă de biologie?',
    pick: 1,
    choices: [
      { value: 'veg-anim', label: 'Biologie vegetală și animală', hint: 'clasele IX–X' },
      { value: 'anatomie', label: 'Anatomie și fiziologie umană, genetică și ecologie umană', hint: 'clasele XI–XII' },
    ],
  },
  fizica: {
    title: 'Ce arii vrei să pregătești?',
    note: 'Subiectul are patru arii și rezolvi două. Alegerea se face în sală — asta rămâne doar preferința ta de studiu.',
    pick: 2,
    choices: [
      { value: 'mecanica', label: 'A. Mecanică' },
      { value: 'termodinamica', label: 'B. Elemente de termodinamică' },
      { value: 'curent', label: 'C. Producerea și utilizarea curentului continuu' },
      { value: 'optica', label: 'D. Optică' },
    ],
  },
};

export function getSpecializare(id: string | null | undefined): Specializare | null {
  return SPECIALIZARI.find((s) => s.id === id) ?? null;
}

// E)c nu se stochează niciodată: e o funcție de specializare.
export function probaCLabel(spec: Specializare): string {
  const base = PROBE_C[spec.probaC].label;
  return spec.matePrograma ? `${base} · ${spec.matePrograma}` : base;
}

export function isProbaDId(value: string | null | undefined): value is ProbaDId {
  return !!value && value in PROBE_D;
}

// Programa de informatică urmează specializarea; nu e o alegere a elevului.
export function informaticaPrograma(spec: Specializare): 'MI' | 'SN' | null {
  if (!spec.probaD.includes('informatica')) return null;
  return spec.id === 'st-nat' ? 'SN' : 'MI';
}

// Alegerea e completă doar când sub-opțiunea are exact câte valori cere
// (una pentru informatică/chimie/biologie, două arii pentru fizică).
export function probaDComplete(probaD: ProbaDId | null, optiune: string[]): boolean {
  if (!probaD) return false;
  const opt = SUB_OPTIONS[probaD];
  if (!opt) return true;
  return optiune.length === opt.pick;
}

// Rezumat scurt al sub-opțiunii, pentru carduri („C/C++", „A. Mecanică · B. …").
export function optiuneSummary(probaD: ProbaDId, optiune: string[]): string | null {
  const opt = SUB_OPTIONS[probaD];
  if (!opt || optiune.length === 0) return null;
  const labels = optiune
    .map((v) => opt.choices.find((c) => c.value === v)?.label)
    .filter((l): l is string => !!l);
  return labels.length ? labels.join(' · ') : null;
}
