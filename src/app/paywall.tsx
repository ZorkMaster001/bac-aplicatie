import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { monetization } from '@/services/monetization';
import { useProStore } from '@/stores/useProStore';
import { colors, radius, spacing, type } from '@/theme';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'megaphone-outline', text: 'Fără nicio reclamă' },
  { icon: 'bulb-outline', text: 'Explicații complete la fiecare întrebare' },
  { icon: 'infinite-outline', text: 'Simulări de examen nelimitate' },
  { icon: 'stats-chart-outline', text: 'Statistici avansate de progres' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const isPro = useProStore((s) => s.isPro);
  const [buying, setBuying] = useState(false);
  const offer = monetization.getOffer();

  const buy = async () => {
    setBuying(true);
    await monetization.purchase();
    setBuying(false);
  };

  const restore = async () => {
    setBuying(true);
    await monetization.restore();
    setBuying(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </PressableScale>
      </View>

      {isPro ? (
        <Animated.View entering={ZoomIn.duration(400)} style={styles.successWrap}>
          <View style={styles.hero}>
            <Ionicons name="sparkles" size={56} color={colors.gold} />
          </View>
          <Text style={styles.title}>Ești Pro! 🎉</Text>
          <Text style={styles.subtitle}>
            Reclamele au dispărut, simulările sunt nelimitate și toate explicațiile sunt
            deblocate. Spor la învățat!
          </Text>
          <PressableScale onPress={() => router.back()} style={styles.cta}>
            <Text style={styles.ctaText}>Înapoi la învățat</Text>
          </PressableScale>
        </Animated.View>
      ) : (
        <View style={styles.body}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.top}>
            <View style={styles.hero}>
              <Ionicons name="sparkles-outline" size={56} color={colors.accent} />
            </View>
            <Text style={styles.title}>BacPro Pro</Text>
            <Text style={styles.subtitle}>Tot ce-ți trebuie ca să iei Bacul cu 10.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card style={styles.benefits}>
              {BENEFITS.map((b) => (
                <View key={b.text} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name={b.icon} size={20} color={colors.accent} />
                  </View>
                  <Text style={styles.benefitText}>{b.text}</Text>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              ))}
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={styles.priceCard}>
              <Text style={styles.price}>{offer.priceMonthly}/lună</Text>
              <Text style={styles.trial}>
                primele {offer.trialDays} zile gratuite · anulezi oricând
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.bottom}>
            <PressableScale onPress={buy} disabled={buying} style={styles.cta}>
              {buying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.ctaText}>Începe perioada gratuită</Text>
                </>
              )}
            </PressableScale>
            <PressableScale onPress={restore} disabled={buying}>
              <Text style={styles.restore}>Restaurează achizițiile</Text>
            </PressableScale>
          </Animated.View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row' },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, justifyContent: 'center', gap: spacing(4) },
  successWrap: { flex: 1, justifyContent: 'center', gap: spacing(4), alignItems: 'center' },
  top: { alignItems: 'center', gap: spacing(2) },
  hero: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: { fontSize: type.h1, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: type.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing(4),
  },
  benefits: { gap: spacing(4) },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: type.body, color: colors.text, fontWeight: '600' },
  priceCard: { alignItems: 'center', gap: spacing(1), borderColor: colors.accent, borderWidth: 2 },
  price: { fontSize: type.h2, fontWeight: '800', color: colors.accent },
  trial: { fontSize: type.small, color: colors.textMuted },
  bottom: { gap: spacing(3), alignItems: 'stretch' },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
    minHeight: 56,
  },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
  restore: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: type.small,
    fontWeight: '600',
  },
});
