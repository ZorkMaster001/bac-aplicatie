import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { StarRow } from '@/components/StarRow';
import { CHAPTERS, Question } from '@/data';
import raw from '@/data/istorie.json';
import { gradeFromScore, starsForAccuracy } from '@/lib/gamification';
import { useProStore } from '@/stores/useProStore';
import { colors, radius, spacing, type } from '@/theme';

const ALL = raw as Question[];

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function ResultsScreen() {
  const router = useRouter();
  const isPro = useProStore((s) => s.isPro);
  const params = useLocalSearchParams<{
    mode: 'run' | 'exam';
    correct: string;
    total: string;
    xp: string;
    chapterId?: string;
    qids?: string;
    answers?: string;
  }>();

  const mode = params.mode ?? 'run';
  const correct = Number(params.correct ?? 0);
  const total = Number(params.total ?? 1);
  const xp = Number(params.xp ?? 0);
  const accuracy = total > 0 ? correct / total : 0;
  const nota = gradeFromScore(correct, total);
  const passed = nota >= 5;
  const shownCorrect = useCountUp(correct);

  const chapter = CHAPTERS.find((c) => c.id === params.chapterId);

  const wrong = useMemo(() => {
    if (mode !== 'exam' || !params.qids || !params.answers) return [];
    const qids = params.qids.split(',');
    const answers = params.answers.split(',').map(Number);
    return qids
      .map((id, i) => ({ q: ALL.find((x) => x.id === id), given: answers[i] }))
      .filter((x): x is { q: Question; given: number } => !!x.q && x.given !== x.q.correctIndex);
  }, [mode, params.qids, params.answers]);

  const visibleWrong = isPro ? wrong : wrong.slice(0, 3);

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={ZoomIn.duration(450)} style={styles.scoreWrap}>
          <View style={[styles.scoreCircle, passed ? styles.scorePass : styles.scoreFail]}>
            {mode === 'exam' ? (
              <>
                <Text style={styles.scoreBig}>{nota.toFixed(2)}</Text>
                <Text style={styles.scoreLabel}>nota ta</Text>
              </>
            ) : (
              <>
                <Text style={styles.scoreBig}>
                  {shownCorrect}/{total}
                </Text>
                <Text style={styles.scoreLabel}>răspunsuri corecte</Text>
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.center}>
          <Text style={styles.title}>
            {mode === 'exam'
              ? passed
                ? 'Promovat! 🎉'
                : 'Mai exersează puțin'
              : accuracy >= 0.8
                ? 'Excelent!'
                : accuracy >= 0.6
                  ? 'Bine lucrat!'
                  : 'Continuă antrenamentul'}
          </Text>
          {mode === 'run' && <StarRow stars={starsForAccuracy(accuracy)} size={28} />}
          {chapter && <Text style={styles.subtitle}>{chapter.title}</Text>}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Card style={styles.xpCard}>
            <Ionicons name="flash" size={22} color={colors.gold} />
            <Text style={styles.xpText}>+{xp} XP câștigate</Text>
          </Card>
        </Animated.View>

        {mode === 'exam' && wrong.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.wrongStack}>
            <Text style={styles.sectionTitle}>
              Greșeli de revizuit ({wrong.length})
            </Text>
            {visibleWrong.map(({ q, given }) => (
              <Card key={q.id} style={styles.wrongCard}>
                <Text style={styles.wrongQuestion}>{q.text}</Text>
                {given >= 0 && (
                  <View style={styles.answerRow}>
                    <Ionicons name="close-circle" size={16} color={colors.error} />
                    <Text style={styles.wrongAnswer}>{q.options[given]}</Text>
                  </View>
                )}
                <View style={styles.answerRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.rightAnswer}>{q.options[q.correctIndex]}</Text>
                </View>
                <Text style={styles.explanation}>{q.explanation}</Text>
              </Card>
            ))}
            {!isPro && wrong.length > 3 && (
              <Card onPress={() => router.push('/paywall')} style={styles.lockCard}>
                <Ionicons name="lock-closed" size={20} color={colors.gold} />
                <Text style={styles.lockText}>
                  Deblochează toate cele {wrong.length} explicații cu Pro
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Card>
            )}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.buttons}>
          {mode === 'run' && chapter ? (
            <PressableScale
              onPress={() => router.replace(`/quiz/${chapter.id}`)}
              style={styles.primaryBtn}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryText}>Încă o rundă</Text>
            </PressableScale>
          ) : (
            <PressableScale onPress={() => router.replace('/exam')} style={styles.primaryBtn}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryText}>Altă simulare</Text>
            </PressableScale>
          )}
          <PressableScale onPress={() => router.replace('/(tabs)')} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Acasă</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  scoreWrap: { alignItems: 'center', marginTop: spacing(4) },
  scoreCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scorePass: { backgroundColor: colors.successSoft, borderWidth: 4, borderColor: colors.success },
  scoreFail: { backgroundColor: colors.errorSoft, borderWidth: 4, borderColor: colors.error },
  scoreBig: { fontSize: 40, fontWeight: '800', color: colors.text },
  scoreLabel: { fontSize: type.small, color: colors.textMuted },
  center: { alignItems: 'center', gap: spacing(2) },
  title: { fontSize: type.h1, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: type.small, color: colors.textMuted },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    paddingVertical: spacing(4),
  },
  xpText: { fontSize: type.body, fontWeight: '700', color: colors.text },
  wrongStack: { gap: spacing(3) },
  sectionTitle: { fontSize: type.body, fontWeight: '800', color: colors.text },
  wrongCard: { gap: spacing(2) },
  wrongQuestion: { fontSize: type.body, fontWeight: '700', color: colors.text, lineHeight: 22 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  wrongAnswer: { fontSize: type.small, color: colors.error, flex: 1 },
  rightAnswer: { fontSize: type.small, color: colors.success, fontWeight: '700', flex: 1 },
  explanation: { fontSize: type.small, color: colors.textMuted, lineHeight: 19 },
  lockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  lockText: { flex: 1, fontSize: type.small, fontWeight: '700', color: colors.text },
  buttons: { gap: spacing(3), marginTop: spacing(2) },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  primaryText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: radius.md,
    padding: spacing(4),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  secondaryText: { color: colors.text, fontSize: type.body, fontWeight: '700' },
});
