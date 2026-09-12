import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  getSpecializare,
  probaCLabel,
  SPECIALIZARE_GROUPS,
  SPECIALIZARI,
  type SpecializareId,
} from '@/data/bac';
import { colors, radius, spacing, type } from '@/theme';
import { PressableScale } from './PressableScale';

interface Props {
  value: SpecializareId | null;
  onChange: (id: SpecializareId) => void;
}

export function SpecializarePicker({ value, onChange }: Props) {
  const selected = getSpecializare(value);

  return (
    <View style={styles.stack}>
      {SPECIALIZARE_GROUPS.map((group) => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupTitle}>{group}</Text>
          {SPECIALIZARI.filter((s) => s.group === group).map((s) => {
            const active = s.id === value;
            return (
              <PressableScale
                key={s.id}
                onPress={() => onChange(s.id)}
                style={[styles.row, active && styles.rowActive]}
              >
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={active ? colors.accent : colors.textMuted}
                />
                <Text style={[styles.label, active && styles.labelActive]}>{s.label}</Text>
              </PressableScale>
            );
          })}
        </View>
      ))}

      {selected && (
        <View style={styles.probaC}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
          <View style={styles.probaCText}>
            <Text style={styles.probaCLabel}>Proba obligatorie · E)c</Text>
            <Text style={styles.probaCValue}>{probaCLabel(selected)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  group: { gap: spacing(2) },
  groupTitle: {
    fontSize: type.small,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(4),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  label: { flex: 1, fontSize: type.body, color: colors.text },
  labelActive: { fontWeight: '700', color: colors.accent },
  probaC: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    padding: spacing(4),
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  probaCText: { flex: 1, gap: 2 },
  probaCLabel: { fontSize: type.small, color: colors.textMuted },
  probaCValue: { fontSize: type.body, fontWeight: '800', color: colors.text },
});
