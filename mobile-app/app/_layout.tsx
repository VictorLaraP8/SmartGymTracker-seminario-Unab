import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppGradientBackground } from '@/components/app-gradient-background';

export default function RootLayout() {
  return (
    <AppGradientBackground>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </AppGradientBackground>
  );
}