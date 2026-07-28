import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AchievementDef } from '@/lib/gamification';
import { colors, radius, spacing, type } from '@/theme';

export function AchievementBadge({ def, unlocked }: { def: AchievementDef; unlocked: boolean }) {
  return (
    <View style={[styles.badge, !unlocked && styles.locked]}>
      <View style={[styles.iconWrap, unlocked && styles.iconWrapUnlocked]}>
        <Ionicons
          name={(unlocked ? def.iconActive : def.icon) as never}
          size={24}
          color={unlocked ? colors.gold : colors.textMuted}
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {def.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3),
  },
  locked: { opacity: 0.45 },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnlocked: { backgroundColor: '#FEF3E2' },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
});
