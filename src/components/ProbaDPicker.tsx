import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PROBE_D, SUB_OPTIONS, type ProbaDId, type Specializare } from '@/data/bac';
import { colors, radius, spacing, type } from '@/theme';
import { PressableScale } from './PressableScale';

interface Props {
  spec: Specializare;
  value: ProbaDId | null;
  optiune: string[];
  onChange: (probaD: ProbaDId) => void;
  onOptiuneChange: (values: string[]) => void;
}

export function ProbaDPicker({ spec, value, optiune, onChange, onOptiuneChange }: Props) {
  const sub = value ? SUB_OPTIONS[value] : undefined;

  const toggle = (choice: string) => {
    if (!sub) return;
    if (sub.pick === 1) {
      onOptiuneChange([choice]);
      return;
    }
    if (optiune.includes(choice)) {
      onOptiuneChange(optiune.filter((v) => v !== choice));
      return;
    }
    // Peste limită, cea mai veche alegere iese — nu blocăm apăsarea.
    onOptiuneChange([...optiune, choice].slice(-sub.pick));
  };

  return (
    <View style={styles.stack}>
      <View style={styles.group}>
        {spec.probaD.map((id) => {
          const d = PROBE_D[id];
          const active = id === value;
          return (
            <PressableScale
              key={id}
              onPress={() => onChange(id)}
              style={[styles.row, active && styles.rowActive]}
            >
              <Ionicons
                name={active ? d.iconActive : d.icon}
                size={22}
                color={active ? colors.accent : colors.textMuted}
              />
              <Text style={[styles.label, active && styles.labelActive]}>{d.label}</Text>
              {active && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
            </PressableScale>
          );
        })}
      </View>

      {sub && (
        <View style={styles.group}>
          <Text style={styles.subTitle}>{sub.title}</Text>
          {sub.note && <Text style={styles.note}>{sub.note}</Text>}
          {sub.choices.map((c) => {
            const active = optiune.includes(c.value);
            const icon = sub.pick > 1
              ? active ? 'checkbox' : 'square-outline'
              : active ? 'radio-button-on' : 'radio-button-off';
            return (
              <PressableScale
                key={c.value}
                onPress={() => toggle(c.value)}
                style={[styles.row, active && styles.rowActive]}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={active ? colors.accent : colors.textMuted}
                />
                <View style={styles.choiceText}>
                  <Text style={[styles.label, active && styles.labelActive]}>{c.label}</Text>
                  {c.hint && <Text style={styles.hint}>{c.hint}</Text>}
                </View>
              </PressableScale>
            );
          })}
          {sub.pick > 1 && (
            <Text style={styles.counter}>
              {optiune.length}/{sub.pick} alese
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(5) },
  group: { gap: spacing(2) },
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
  choiceText: { flex: 1, gap: 2 },
  hint: { fontSize: type.small, color: colors.textMuted },
  subTitle: { fontSize: type.body, fontWeight: '800', color: colors.text, marginTop: spacing(2) },
  note: { fontSize: type.small, color: colors.textMuted, lineHeight: 18, marginBottom: spacing(1) },
  counter: { fontSize: type.small, color: colors.textMuted, textAlign: 'right' },
});
