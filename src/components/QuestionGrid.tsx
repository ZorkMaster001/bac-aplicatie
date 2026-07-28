import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme';
import { PressableScale } from './PressableScale';

interface Props {
  total: number;
  currentIndex: number;
  answers: (number | null)[];
  onJump: (index: number) => void;
}

// Grila de navigare stil chestionar auto: plin = răspuns, contur = curentă.
export function QuestionGrid({ total, currentIndex, answers, onJump }: Props) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: total }, (_, i) => {
        const answered = answers[i] !== null;
        const current = i === currentIndex;
        return (
          <PressableScale
            key={i}
            onPress={() => onJump(i)}
            style={[
              styles.cell,
              answered && styles.cellAnswered,
              current && styles.cellCurrent,
            ]}
          >
            <Text
              style={[
                styles.cellText,
                answered && styles.cellTextAnswered,
                current && !answered && styles.cellTextCurrent,
              ]}
            >
              {i + 1}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const CELL = 40;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    justifyContent: 'center',
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellAnswered: { backgroundColor: colors.accent, borderColor: colors.accent },
  cellCurrent: { borderColor: colors.accent, borderWidth: 2.5 },
  cellText: { fontSize: type.small, fontWeight: '700', color: colors.textMuted },
  cellTextAnswered: { color: '#fff' },
  cellTextCurrent: { color: colors.accent },
});
