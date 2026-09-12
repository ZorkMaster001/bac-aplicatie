// Validare bancă de întrebări — rulează: npx tsx scripts/validate-content.ts
import questions from '../src/data/istorie.json';
import { CHAPTERS } from '../src/data/chapters';
import { PROBE_D, SPECIALIZARI, SPECIALIZARE_GROUPS, SUB_OPTIONS } from '../src/data/bac';
import type { Question } from '../src/data/types';

const all = questions as Question[];
const ids = new Set<string>();
const errors: string[] = [];
const perChapter: Record<string, number> = {};

for (const q of all) {
  if (!q.id || ids.has(q.id)) errors.push(`id lipsă/duplicat: ${q.id}`);
  ids.add(q.id);
  if (!CHAPTERS.some((c) => c.id === q.chapterId))
    errors.push(`${q.id}: capitol invalid ${q.chapterId}`);
  if (!Array.isArray(q.options) || q.options.length !== 4)
    errors.push(`${q.id}: trebuie exact 4 variante`);
  else if (new Set(q.options).size !== 4) errors.push(`${q.id}: variante duplicate`);
  if (![0, 1, 2, 3].includes(q.correctIndex)) errors.push(`${q.id}: correctIndex invalid`);
  if (!q.explanation?.trim()) errors.push(`${q.id}: explicație lipsă`);
  if (!q.text?.trim()) errors.push(`${q.id}: text lipsă`);
  if (![1, 2, 3].includes(q.difficulty)) errors.push(`${q.id}: dificultate invalidă`);
  perChapter[q.chapterId] = (perChapter[q.chapterId] ?? 0) + 1;
}

for (const c of CHAPTERS)
  if ((perChapter[c.id] ?? 0) < 10)
    errors.push(`capitol ${c.id}: sub 10 întrebări (${perChapter[c.id] ?? 0})`);
if (all.length < 70) errors.push(`total sub 70 (${all.length})`);

// Structura probelor de bac: E)c se derivă din specializare, deci greșelile
// aici se propagă în tot onboarding-ul.
const specIds = new Set<string>();
for (const s of SPECIALIZARI) {
  if (specIds.has(s.id)) errors.push(`specializare duplicată: ${s.id}`);
  specIds.add(s.id);
  if (!SPECIALIZARE_GROUPS.includes(s.group))
    errors.push(`${s.id}: grup necunoscut „${s.group}"`);
  if (s.probaD.length === 0) errors.push(`${s.id}: fără probe la alegere`);
  if (new Set(s.probaD).size !== s.probaD.length)
    errors.push(`${s.id}: discipline duplicate la E)d`);
  for (const d of s.probaD)
    if (!(d in PROBE_D)) errors.push(`${s.id}: disciplină necunoscută la E)d: ${d}`);
  if (s.probaC === 'matematica' && !s.matePrograma)
    errors.push(`${s.id}: matematică fără programă (M_*)`);
  if (s.probaC === 'istorie' && s.matePrograma)
    errors.push(`${s.id}: istorie nu are programă de matematică`);
}

for (const [probaD, opt] of Object.entries(SUB_OPTIONS)) {
  if (!opt) continue;
  if (!(probaD in PROBE_D)) errors.push(`sub-opțiune pentru disciplină necunoscută: ${probaD}`);
  if (opt.choices.length < opt.pick)
    errors.push(`${probaD}: cere ${opt.pick} variante, dar are ${opt.choices.length}`);
  if (new Set(opt.choices.map((c) => c.value)).size !== opt.choices.length)
    errors.push(`${probaD}: valori duplicate în sub-opțiuni`);
}
// Fizica: patru arii din care se rezolvă exact două (verificat pe baremul oficial).
if (SUB_OPTIONS.fizica?.choices.length !== 4 || SUB_OPTIONS.fizica?.pick !== 2)
  errors.push('fizica: trebuie 4 arii tematice din care se aleg 2');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${all.length} întrebări valide (${CHAPTERS.map((c) => `${c.id}: ${perChapter[c.id]}`).join(', ')})`);
console.log(`OK: ${SPECIALIZARI.length} specializări, ${Object.keys(PROBE_D).length} discipline la alegere.`);
