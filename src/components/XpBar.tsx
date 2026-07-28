import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { levelFromXp } from '@/lib/gamification';
import { colors, radius, spacing, type } from '@/theme';

export function XpBar({ xp }: { xp: number }) {
  const { level, intoLevel, needed } = levelFromXp(xp);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(needed > 0 ? intoLevel / needed : 0, { duration: 600 });
  }, [intoLevel, needed, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.level}>Nivel {level}</Text>
        <Text style={styles.xp}>
          {intoLevel}/{needed} XP
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing(2), flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  level: { fontSize: type.body, fontWeight: '700', color: colors.text },
  xp: { fontSize: type.small, color: colors.textMuted },
  track: {
    height: 10,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
});
