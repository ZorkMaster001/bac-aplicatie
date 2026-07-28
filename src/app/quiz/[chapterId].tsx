import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';

import { AnswerButton, AnswerState } from '@/components/AnswerButton';
import { PressableScale } from '@/components/PressableScale';
import { QuizProgressBar } from '@/components/QuizProgressBar';
import { Screen } from '@/components/Screen';
import { CHAPTERS, getSessionQuestions } from '@/data';
import type { ChapterId } from '@/data';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, radius, spacing, type } from '@/theme';

const RUN_SIZE = 10;

export default function QuizScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: ChapterId }>();
  const router = useRouter();
  const navigation = useNavigation();
  const addAnswer = useProgressStore((s) => s.addAnswer);
  const completeRun = useProgressStore((s) => s.completeRun);

  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  const questions = useMemo(() => getSessionQuestions(chapterId as ChapterId, RUN_SIZE), [chapterId]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const finishedRef = useRef(false);

  const q = questions[idx];
  const inFeedback = selected !== null;
  const isLast = idx === questions.length - 1;

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e: any) => {
      if (finishedRef.current) return;
      e.preventDefault();
      Alert.alert('Sigur ieși?', 'Progresul rundei se pierde.', [
        { text: 'Rămân', style: 'cancel' },
        {
          text: 'Ies',
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return sub;
  }, [navigation]);

  if (!chapter || questions.length === 0) {
    return (
      <Screen>
        <Text style={styles.question}>Capitol necunoscut.</Text>
      </Screen>
    );
  }

  const answer = (i: number) => {
    if (inFeedback) return;
    setSelected(i);
    const ok = i === q.correctIndex;
    if (ok) setCorrectCount((c) => c + 1);
    addAnswer(ok);
  };

  const next = () => {
    if (!isLast) {
      setIdx((v) => v + 1);
      setSelected(null);
      return;
    }
    finishedRef.current = true;
    const gained = completeRun(chapter.id, correctCount, questions.length);
    router.replace({
      pathname: '/results',
      params: {
        mode: 'run',
        correct: String(correctCount),
        total: String(questions.length),
        xp: String(gained),
        chapterId: chapter.id,
      },
    });
  };

  const stateFor = (i: number): AnswerState => {
    if (!inFeedback) return 'idle';
    if (i === q.correctIndex) return i === selected ? 'selected-correct' : 'reveal-correct';
    if (i === selected) return 'selected-wrong';
    return 'disabled';
  };

  const wasCorrect = selected === q.correctIndex;

  return (
    <Screen>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </PressableScale>
        <QuizProgressBar index={idx + (inFeedback ? 1 : 0)} total={questions.length} />
        <Text style={styles.counter}>
          {idx + 1}/{questions.length}
        </Text>
      </View>

      <Animated.View key={q.id} entering={FadeInDown.duration(350)} style={styles.body}>
        <Text style={styles.chapterName}>{chapter.title}</Text>
        <Text style={styles.question}>{q.text}</Text>
        <View style={styles.answers}>
          {q.options.map((opt, i) => (
            <AnswerButton key={i} label={opt} state={stateFor(i)} onPress={() => answer(i)} />
          ))}
        </View>
      </Animated.View>

      {inFeedback && (
        <Animated.View
          entering={SlideInDown.duration(300)}
          style={[styles.panel, wasCorrect ? styles.panelCorrect : styles.panelWrong]}
        >
          <View style={styles.panelHeader}>
            <Ionicons
              name={wasCorrect ? 'checkmark-circle' : 'close-circle'}
              size={22}
              color={wasCorrect ? colors.success : colors.error}
            />
            <Text
              style={[styles.panelTitle, { color: wasCorrect ? colors.success : colors.error }]}
            >
              {wasCorrect ? 'Corect!' : 'Greșit'}
            </Text>
          </View>
          <Text style={styles.explanation}>{q.explanation}</Text>
          <PressableScale onPress={next} style={styles.nextBtn}>
            <Text style={styles.nextText}>{isLast ? 'Vezi rezultatul' : 'Următoarea'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </PressableScale>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
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
  counter: { fontSize: type.small, color: colors.textMuted, fontWeight: '600' },
  body: { flex: 1, marginTop: spacing(6), gap: spacing(4) },
  chapterName: { fontSize: type.small, color: colors.accent, fontWeight: '700' },
  question: {
    fontSize: type.h2,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  answers: { gap: spacing(3), marginTop: spacing(2) },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing(5),
    gap: spacing(3),
    marginTop: spacing(3),
  },
  panelCorrect: { borderColor: colors.successSoft },
  panelWrong: { borderColor: colors.errorSoft },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  panelTitle: { fontSize: type.body, fontWeight: '800' },
  explanation: { fontSize: type.small, color: colors.textMuted, lineHeight: 20 },
  nextBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  nextText: { color: '#fff', fontWeight: '700', fontSize: type.body },
});
