import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

type NavItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: '/dashboard' | '/workout-create' | '/history';
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'INICIO', icon: 'home', route: '/dashboard' },
  { key: 'workouts', label: 'ENTRENOS', icon: 'barbell', route: '/workout-create' },
  { key: 'history', label: 'HISTORIAL', icon: 'triangle-outline', route: '/history' },
  { key: 'profile', label: 'PERFIL', icon: 'person-outline' },
];

const isActiveRoute = (pathname: string, route?: string) => {
  if (!route) return false;
  return pathname === route;
};

export function AppBottomNav() {
  const pathname = usePathname();

  const handlePress = (item: NavItem) => {
    if (item.route) {
      router.replace(item.route);
      return;
    }

    Alert.alert('Perfil', 'Modulo de perfil disponible pronto.');
  };

  return (
    <View style={styles.navWrap}>
      {NAV_ITEMS.map((item) => {
        const active = isActiveRoute(pathname, item.route);

        return (
          <Pressable key={item.key} style={styles.item} onPress={() => handlePress(item)}>
            <Ionicons
              name={item.icon}
              size={19}
              color={active ? '#22e7ff' : 'rgba(148,163,184,0.8)'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: 'rgba(1, 7, 18, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 231, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 12,
    paddingTop: 6,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 64,
  },
  label: {
    color: 'rgba(148,163,184,0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  labelActive: {
    color: '#22e7ff',
  },
});
