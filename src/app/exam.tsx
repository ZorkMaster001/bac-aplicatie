import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AnswerButton, AnswerState } from '@/components/AnswerButton';
import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { QuestionGrid } from '@/components/QuestionGrid';
import { Screen } from '@/components/Screen';
import { TimerPill } from '@/components/TimerPill';
import { getExamQuestions } from '@/data';
import { gradeFromScore } from '@/lib/gamification';
import { useProgressStore } from '@/stores/useProgressStore';
import { useProStore } from '@/stores/useProStore';
import { colors, radius, spacing, type } from '@/theme';

const EXAM_SIZE = 30;
const EXAM_SECONDS = 30 * 60;

export default function ExamScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const isPro = useProStore((s) => s.isPro);
  const canStartExam = useProgressStore((s) => s.canStartExam);
  const registerExamStart = useProgressStore((s) => s.registerExamStart);
  const completeExam = useProgressStore((s) => s.completeExam);

  const [phase, setPhase] = useState<'intro' | 'running'>('intro');
  const [questions, setQuestions] = useState(() => getExamQuestions(EXAM_SIZE));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [gridOpen, setGridOpen] = useState(false);
  const finishedRef = useRef(false);
  const allowedToStart = canStartExam(isPro);

  const submit = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const nota = gradeFromScore(correct, questions.length);
    const gained = completeExam(nota);
    router.replace({
      pathname: '/results',
      params: {
        mode: 'exam',
        correct: String(correct),
        total: String(questions.length),
        xp: String(gained),
        qids: questions.map((q) => q.id).join(','),
        answers: answers.map((a) => (a === null ? -1 : a)).join(','),
      },
    });
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submitRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e: any) => {
      if (finishedRef.current || phase === 'intro') return;
      e.preventDefault();
      Alert.alert('Abandonezi simularea?', 'Încercarea de azi se consumă oricum.', [
        { text: 'Continui testul', style: 'cancel' },
        {
          text: 'Abandonez',
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return sub;
  }, [navigation, phase]);

  const start = () => {
    registerExamStart();
    setQuestions(getExamQuestions(EXAM_SIZE));
    setAnswers(Array(EXAM_SIZE).fill(null));
    setIdx(0);
    setSecondsLeft(EXAM_SECONDS);
    setPhase('running');
  };

  if (phase === 'intro') {
    return (
      <Screen>
        <View style={styles.introHeader}>
          <PressableScale onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </PressableScale>
        </View>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
          <View style={styles.hero}>
            <Ionicons name="document-text-outline" size={56} color={colors.accent} />
          </View>
          <Text style={styles.introTitle}>Simulare examen</Text>
          <Card style={styles.rules}>
            {[
              ['help-circle-outline', '30 de întrebări din toate capitolele'],
              ['alarm-outline', '30 de minute, cu predare automată'],
              ['ribbon-outline', 'Nota minimă de promovare: 5'],
              ['swap-horizontal-outline', 'Poți sări și reveni la întrebări'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.ruleRow}>
                <Ionicons name={icon as never} size={20} color={colors.accent} />
                <Text style={styles.ruleText}>{text}</Text>
              </View>
            ))}
          </Card>
          {allowedToStart ? (
            <PressableScale onPress={start} style={styles.cta}>
              <Text style={styles.ctaText}>Începe simularea</Text>
              <Ionicons name="play" size={18} color="#fff" />
            </PressableScale>
          ) : (
            <Card style={styles.limitCard}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.gold} />
              <Text style={styles.limitText}>
                Ai folosit simularea gratuită de azi. Cu Pro ai simulări nelimitate.
              </Text>
              <PressableScale onPress={() => router.push('/paywall')} style={styles.proBtn}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.ctaText}>Treci la Pro</Text>
              </PressableScale>
            </Card>
          )}
        </Animated.View>
      </Screen>
    );
  }

  const q = questions[idx];
  const stateFor = (i: number): AnswerState => (answers[idx] === i ? 'selected' : 'idle');
  const answeredCount = answers.filter((a) => a !== null).length;
  const isLast = idx === questions.length - 1;

  const confirmSubmit = () => {
    const left = questions.length - answeredCount;
    Alert.alert(
      'Predai testul?',
      left > 0 ? `Mai ai ${left} întrebări fără răspuns.` : 'Ai răspuns la toate întrebările.',
      [
        { text: 'Mă întorc', style: 'cancel' },
        { text: 'Predau', style: 'destructive', onPress: submit },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </PressableScale>
        <TimerPill secondsLeft={secondsLeft} />
        <PressableScale onPress={() => setGridOpen((v) => !v)} style={styles.gridToggle}>
          <Ionicons
            name={gridOpen ? 'grid' : 'grid-outline'}
            size={20}
            color={colors.accent}
          />
          <Text style={styles.gridToggleText}>
            {answeredCount}/{questions.length}
          </Text>
        </PressableScale>
      </View>

      {gridOpen && (
        <Animated.View entering={FadeInUp.duration(250)} style={styles.gridWrap}>
          <QuestionGrid
            total={questions.length}
            currentIndex={idx}
            answers={answers}
            onJump={(i) => {
              setIdx(i);
              setGridOpen(false);
            }}
          />
        </Animated.View>
      )}

      <Animated.View key={q.id} entering={FadeInDown.duration(300)} style={styles.body}>
        <Text style={styles.counterLabel}>Întrebarea {idx + 1} din {questions.length}</Text>
        <Text style={styles.question}>{q.text}</Text>
        <View style={styles.answers}>
          {q.options.map((opt, i) => (
            <AnswerButton
              key={i}
              label={opt}
              state={stateFor(i)}
              onPress={() =>
                setAnswers((prev) => {
                  const nextAnswers = [...prev];
                  nextAnswers[idx] = nextAnswers[idx] === i ? null : i;
                  return nextAnswers;
                })
              }
            />
          ))}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <PressableScale
          onPress={() => setIdx((v) => Math.max(0, v - 1))}
          disabled={idx === 0}
          style={[styles.navBtn, idx === 0 && styles.navBtnDisabled]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.accent} />
        </PressableScale>
        {isLast ? (
          <PressableScale onPress={confirmSubmit} style={styles.submitBtn}>
            <Text style={styles.ctaText}>Predă testul</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </PressableScale>
        ) : (
          <PressableScale onPress={() => setIdx((v) => v + 1)} style={styles.nextBtn}>
            <Text style={styles.ctaText}>Următoarea</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </PressableScale>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  introHeader: { flexDirection: 'row' },
  intro: { flex: 1, justifyContent: 'center', gap: spacing(5) },
  hero: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  introTitle: { fontSize: type.h1, fontWeight: '800', color: colors.text, textAlign: 'center' },
  rules: { gap: spacing(3) },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  ruleText: { fontSize: type.body, color: colors.text, flex: 1 },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
  limitCard: { alignItems: 'center', gap: spacing(3) },
  limitText: { fontSize: type.body, color: colors.text, textAlign: 'center', lineHeight: 22 },
  proBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  gridToggleText: { fontSize: type.small, fontWeight: '700', color: colors.accent },
  gridWrap: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    marginTop: spacing(3),
  },
  body: { flex: 1, marginTop: spacing(5), gap: spacing(4) },
  counterLabel: { fontSize: type.small, color: colors.accent, fontWeight: '700' },
  question: { fontSize: type.h2, fontWeight: '700', color: colors.text, lineHeight: 30 },
  answers: { gap: spacing(3), marginTop: spacing(2) },
  footer: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3) },
  navBtn: {
    width: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accentSoft,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
});
