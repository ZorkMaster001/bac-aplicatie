// Reguli de joc: XP, niveluri, stele, note.

// Nivelul n cere 100·n XP peste nivelul anterior (praguri cumulative).
export function levelFromXp(xp: number): { level: number; intoLevel: number; needed: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= 100 * level) {
    remaining -= 100 * level;
    level += 1;
  }
  return { level, intoLevel: remaining, needed: 100 * level };
}

export function starsForAccuracy(acc: number): 0 | 1 | 2 | 3 {
  if (acc >= 1) return 3;
  if (acc >= 0.8) return 2;
  if (acc >= 0.6) return 1;
  return 0;
}

// Nota pe scala 1–10, ca la bac: 1 punct din oficiu.
export function gradeFromScore(correct: number, total: number): number {
  if (total <= 0) return 1;
  return Math.round((1 + 9 * (correct / total)) * 100) / 100;
}

export function xpForRun(correct: number, total: number): number {
  const base = correct * 10;
  const perfectBonus = total >= 10 && correct === total ? 50 : 0;
  return base + perfectBonus;
}

export function xpForExam(nota: number): number {
  return Math.round(nota * 20);
}

export interface AchievementDef {
  id: string;
  title: string;
  icon: string;
  iconActive: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-run', title: 'Prima rundă', icon: 'rocket-outline', iconActive: 'rocket' },
  { id: 'perfect-run', title: 'Rundă perfectă', icon: 'ribbon-outline', iconActive: 'ribbon' },
  { id: 'streak-7', title: '7 zile la rând', icon: 'flame-outline', iconActive: 'flame' },
  { id: 'first-exam-pass', title: 'Prima simulare promovată', icon: 'school-outline', iconActive: 'school' },
  { id: 'level-5', title: 'Nivelul 5', icon: 'trophy-outline', iconActive: 'trophy' },
];
