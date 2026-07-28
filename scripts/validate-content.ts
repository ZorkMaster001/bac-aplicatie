// Validare bancă de întrebări — rulează: npx tsx scripts/validate-content.ts
import questions from '../src/data/istorie.json';
import { CHAPTERS } from '../src/data/chapters';
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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${all.length} întrebări valide (${CHAPTERS.map((c) => `${c.id}: ${perChapter[c.id]}`).join(', ')})`);
