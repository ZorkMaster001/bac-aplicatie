import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { StarRow } from '@/components/StarRow';
import { CHAPTERS, getQuestionsByChapter } from '@/data';
import { chapterStars, useProgressStore } from '@/stores/useProgressStore';
import { colors, spacing, type } from '@/theme';

export default function IstorieScreen() {
  const router = useRouter();
  const chapters = useProgressStore((s) => s.chapters);

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Card onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Card>
          <View>
            <Text style={styles.title}>Istorie</Text>
            <Text style={styles.subtitle}>Capitolele programei de Bac</Text>
          </View>
        </Animated.View>

        {CHAPTERS.map((c, i) => {
          const progress = chapters[c.id];
          const stars = chapterStars(progress?.bestAccuracy);
          const count = getQuestionsByChapter(c.id).length;
          return (
            <Animated.View key={c.id} entering={FadeInDown.delay(80 + i * 60).duration(400)}>
              <Card onPress={() => router.push(`/quiz/${c.id}`)}>
                <View style={styles.row}>
                  <View style={styles.icon}>
                    <Ionicons
                      name={(progress?.runs ? c.iconActive : c.icon) as never}
                      size={26}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.text}>
                    <Text style={styles.chapterTitle}>{c.title}</Text>
                    <Text style={styles.blurb} numberOfLines={1}>
                      {c.blurb}
                    </Text>
                    <View style={styles.meta}>
                      <StarRow stars={stars} />
                      <Text style={styles.metaText}>{count} întrebări</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
                </View>
              </Card>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(3) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginBottom: spacing(2),
  },
  backBtn: { padding: spacing(3), borderRadius: 22 },
  title: { fontSize: type.h1, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: type.small, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 3 },
  chapterTitle: { fontSize: type.body, fontWeight: '700', color: colors.text },
  blurb: { fontSize: type.small, color: colors.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: 2 },
  metaText: { fontSize: type.small, color: colors.textMuted },
});
