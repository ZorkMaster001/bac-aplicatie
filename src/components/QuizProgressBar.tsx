import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';

export function QuizProgressBar({ index, total }: { index: number; total: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(total > 0 ? index / total : 0, { duration: 350 });
  }, [index, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
    flex: 1,
  },
  fill: { height: '100%', borderRadius: radius.md, backgroundColor: colors.accent },
});
