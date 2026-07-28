import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, type } from '@/theme';

export default function ResultsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Rezultat</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: type.h1, fontWeight: '700', color: colors.text },
});
