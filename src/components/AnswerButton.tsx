import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, spacing, type } from '@/theme';
import { PressableScale } from './PressableScale';

export type AnswerState =
  | 'idle'
  | 'selected'
  | 'selected-correct'
  | 'selected-wrong'
  | 'reveal-correct'
  | 'disabled';

interface Props {
  label: string;
  state: AnswerState;
  onPress: () => void;
}

export function AnswerButton({ label, state, onPress }: Props) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'selected-wrong') {
      shake.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [state, shake]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const isCorrect = state === 'selected-correct' || state === 'reveal-correct';
  const isWrong = state === 'selected-wrong';
  const isSelected = state === 'selected';

  return (
    <Animated.View style={shakeStyle}>
      <PressableScale
        onPress={onPress}
        disabled={state === 'disabled' || isCorrect || isWrong}
        style={[
          styles.btn,
          isSelected && styles.selected,
          isCorrect && styles.correct,
          isWrong && styles.wrong,
          state === 'disabled' && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.label,
            isSelected && styles.labelSelected,
            isCorrect && styles.labelCorrect,
            isWrong && styles.labelWrong,
          ]}
        >
          {label}
        </Text>
        {isCorrect && (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        )}
        {isWrong && <Ionicons name="close-circle" size={24} color={colors.error} />}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  correct: { borderColor: colors.success, backgroundColor: colors.successSoft },
  wrong: { borderColor: colors.error, backgroundColor: colors.errorSoft },
  disabled: { opacity: 0.55 },
  label: { flex: 1, fontSize: type.body, color: colors.text, lineHeight: 22 },
  labelSelected: { fontWeight: '700', color: colors.accent },
  labelCorrect: { fontWeight: '700', color: colors.success },
  labelWrong: { fontWeight: '700', color: colors.error },
});
