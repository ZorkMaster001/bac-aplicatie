import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme';

const { Trigger } = NativeTabs;
const { Icon, Label, VectorIcon } = Trigger;

type IoniconName = keyof typeof Ionicons.glyphMap;

// Pe iOS se folosesc SF Symbols, pe Android acelasi set Ionicons ca inainte.
function icons(outline: IoniconName, filled: IoniconName) {
  return {
    default: <VectorIcon family={Ionicons} name={outline} />,
    selected: <VectorIcon family={Ionicons} name={filled} />,
  };
}

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);

  // Poarta aplicației: fără cont nu se intră, iar un cont fără nume și dată
  // de Bac trece mai întâi prin onboarding.
  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/auth" />;
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <NativeTabs tintColor={colors.accent}>
      <Trigger name="index">
        <Label>Acasă</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} src={icons('home-outline', 'home')} />
      </Trigger>
      <Trigger name="materii">
        <Label>Materii</Label>
        <Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          src={icons('library-outline', 'library')}
        />
      </Trigger>
      <Trigger name="profil">
        <Label>Profil</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} src={icons('person-outline', 'person')} />
      </Trigger>
    </NativeTabs>
  );
}
