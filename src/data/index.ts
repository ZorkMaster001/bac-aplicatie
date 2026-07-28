import raw from './istorie.json';
import type { ChapterId, Question } from './types';

export { CHAPTERS } from './chapters';
export type { Chapter, ChapterId, Question } from './types';

const QUESTIONS = raw as Question[];

export function getQuestionsByChapter(chapterId: ChapterId): Question[] {
  return QUESTIONS.filter((q) => q.chapterId === chapterId);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getSessionQuestions(chapterId: ChapterId, count = 10): Question[] {
  return shuffle(getQuestionsByChapter(chapterId)).slice(0, count);
}

// Extrage întrebări pentru simulare, distribuite uniform pe capitole.
export function getExamQuestions(count = 30): Question[] {
  const byChapter = new Map<ChapterId, Question[]>();
  for (const q of QUESTIONS) {
    const list = byChapter.get(q.chapterId) ?? [];
    list.push(q);
    byChapter.set(q.chapterId, list);
  }
  const chapters = [...byChapter.keys()];
  const perChapter = Math.ceil(count / chapters.length);
  const picked: Question[] = [];
  for (const c of chapters) picked.push(...shuffle(byChapter.get(c)!).slice(0, perChapter));
  return shuffle(picked).slice(0, count);
}
