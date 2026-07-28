import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

export function StarRow({ stars, size = 16 }: { stars: 0 | 1 | 2 | 3; size?: number }) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Ionicons
          key={i}
          name={i < stars ? 'star' : 'star-outline'}
          size={size}
          color={i < stars ? colors.gold : colors.textMuted}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing(1) },
});
