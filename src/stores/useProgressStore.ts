import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChapterId } from '../data/types';
import { isYesterday, todayKey } from '../lib/dates';
import { levelFromXp, starsForAccuracy, xpForExam, xpForRun } from '../lib/gamification';

interface ChapterProgress {
  bestAccuracy: number;
  runs: number;
}

interface ProgressState {
  xp: number;
  streakCount: number;
  lastActiveDay: string | null;
  chapters: Partial<Record<ChapterId, ChapterProgress>>;
  answered: number;
  correct: number;
  bestGrade: number | null;
  examDay: string | null;
  examsToday: number;
  lastChapterId: ChapterId | null;
  achievements: string[];
  lastUserId: string | null;

  addAnswer: (correct: boolean) => void;
  completeRun: (chapterId: ChapterId, correct: number, total: number) => number; // XP câștigat
  completeExam: (nota: number) => number; // XP câștigat
  canStartExam: (isPro: boolean) => boolean;
  registerExamStart: () => void;
  claimFor: (userId: string) => void;
  wipe: () => void;
}

const initial = {
  xp: 0,
  streakCount: 0,
  lastActiveDay: null as string | null,
  chapters: {} as Partial<Record<ChapterId, ChapterProgress>>,
  answered: 0,
  correct: 0,
  bestGrade: null as number | null,
  examDay: null as string | null,
  examsToday: 0,
  lastChapterId: null as ChapterId | null,
  achievements: [] as string[],
  lastUserId: null as string | null,
};

function touchStreak(state: { streakCount: number; lastActiveDay: string | null }) {
  const today = todayKey();
  if (state.lastActiveDay === today) return { streakCount: state.streakCount, lastActiveDay: today };
  if (state.lastActiveDay && isYesterday(state.lastActiveDay))
    return { streakCount: state.streakCount + 1, lastActiveDay: today };
  return { streakCount: 1, lastActiveDay: today };
}

function withAchievements(
  current: string[],
  unlocked: string[]
): string[] {
  const next = new Set(current);
  for (const id of unlocked) next.add(id);
  return [...next];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      addAnswer: (isCorrect) =>
        set((s) => ({ answered: s.answered + 1, correct: s.correct + (isCorrect ? 1 : 0) })),

      completeRun: (chapterId, correctCount, total) => {
        const gained = xpForRun(correctCount, total);
        set((s) => {
          const accuracy = total > 0 ? correctCount / total : 0;
          const prev = s.chapters[chapterId] ?? { bestAccuracy: 0, runs: 0 };
          const streak = touchStreak(s);
          const xp = s.xp + gained;
          const unlocked: string[] = ['first-run'];
          if (correctCount === total && total >= 10) unlocked.push('perfect-run');
          if (streak.streakCount >= 7) unlocked.push('streak-7');
          if (levelFromXp(xp).level >= 5) unlocked.push('level-5');
          return {
            xp,
            ...streak,
            lastChapterId: chapterId,
            chapters: {
              ...s.chapters,
              [chapterId]: {
                bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
                runs: prev.runs + 1,
              },
            },
            achievements: withAchievements(s.achievements, unlocked),
          };
        });
        return gained;
      },

      completeExam: (nota) => {
        const gained = xpForExam(nota);
        set((s) => {
          const streak = touchStreak(s);
          const xp = s.xp + gained;
          const unlocked: string[] = [];
          if (nota >= 5) unlocked.push('first-exam-pass');
          if (streak.streakCount >= 7) unlocked.push('streak-7');
          if (levelFromXp(xp).level >= 5) unlocked.push('level-5');
          return {
            xp,
            ...streak,
            bestGrade: s.bestGrade === null ? nota : Math.max(s.bestGrade, nota),
            achievements: withAchievements(s.achievements, unlocked),
          };
        });
        return gained;
      },

      canStartExam: (isPro) => {
        if (isPro) return true;
        const s = get();
        return s.examDay !== todayKey() || s.examsToday < 1;
      },

      registerExamStart: () =>
        set((s) => {
          const today = todayKey();
          return s.examDay === today
            ? { examsToday: s.examsToday + 1 }
            : { examDay: today, examsToday: 1 };
        }),

      // Progresul e legat de contul care l-a făcut. Alt cont pe același
      // telefon începe de la zero, nu moștenește XP-ul precedentului.
      claimFor: (userId) =>
        set((s) =>
          s.lastUserId && s.lastUserId !== userId
            ? { ...initial, lastUserId: userId }
            : { lastUserId: userId }
        ),

      // Ștergere totală, inclusiv proprietarul dispozitivului. E apelată doar
      // ca parte din wipeAllDataAndSignOut, deci după ea urmează deconectarea
      // și nu mai există progres pe care alt cont să-l moștenească.
      wipe: () => set({ ...initial }),
    }),
    { name: 'bacpro-progress', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export function chapterStars(bestAccuracy: number | undefined): 0 | 1 | 2 | 3 {
  return starsForAccuracy(bestAccuracy ?? 0);
}
