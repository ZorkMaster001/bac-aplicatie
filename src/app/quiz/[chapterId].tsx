import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors, type } from '@/theme';

export default function QuizScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  return (
    <Screen>
      <Text style={styles.title}>Quiz: {chapterId}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: type.h1, fontWeight: '700', color: colors.text },
});
