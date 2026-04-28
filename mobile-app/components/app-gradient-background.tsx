import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type AppGradientBackgroundProps = {
  children: ReactNode;
};

export function AppGradientBackground({ children }: AppGradientBackgroundProps) {
  return (
    <View style={styles.root}>
      <Image
        source={require('../assets/images/app-hex-background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
      />
      <View style={styles.overlay} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 8, 20, 0.42)',
  },
});
