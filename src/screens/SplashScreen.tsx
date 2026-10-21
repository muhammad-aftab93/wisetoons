// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { WiseOwl } from '../components/WiseOwl';
import { DreamyBackground } from '../components/DreamyBackground';
import { DEFAULT_CHANNEL_LOGO_URL } from '../data/videos';
import { RADIUS, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';
import * as ExpoSplashScreen from 'expo-splash-screen';

const LOCAL_CHANNEL_ICON = require('../../assets/channel-icon.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const STARS = [
  { top: '12%', left: '14%' }, { top: '18%', right: '16%' }, { top: '30%', left: '8%' },
  { top: '26%', right: '10%' }, { top: '8%', left: '48%' },
] as const;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, bootstrap, channelLogoUrl } = useApp();
  const progress = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let cancelled = false;
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(twinkle, { toValue: 0.3, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    ).start();
    Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: false }).start();

    // Hide native splash once React component has mounted
    ExpoSplashScreen.hideAsync().catch(() => {});

    const minWait = new Promise<void>((r) => setTimeout(r, 2000));
    Promise.all([bootstrap(), minWait]).then(() => {
      if (cancelled) return;
      navigation.replace('HomeHub');
    });
    return () => {
      cancelled = true;
    };
  }, [bootstrap, navigation, progress, twinkle]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DreamyBackground />
      {STARS.map((pos, i) => (
        <Animated.Text key={i} style={[styles.star, pos, { opacity: twinkle }]}>
          ✨
        </Animated.Text>
      ))}
      <WiseOwl size={200} waving />
      <View style={[styles.branch, { backgroundColor: '#8D5B3A' }]} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>WiseToons for Kids</Text>
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primaryAccent,
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Image
        source={
          channelLogoUrl && channelLogoUrl !== DEFAULT_CHANNEL_LOGO_URL
            ? { uri: channelLogoUrl }
            : LOCAL_CHANNEL_ICON
        }
        defaultSource={LOCAL_CHANNEL_ICON}
        style={[styles.channelLogo, { borderColor: colors.primaryAccent }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  star: { position: 'absolute', fontSize: 26 },
  branch: { width: 220, height: 16, borderRadius: 8, marginTop: -6 },
  title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.sizes.hero, marginTop: 24, marginBottom: 20 },
  track: { width: 180, height: 16, borderRadius: RADIUS.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: RADIUS.pill },
  channelLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginTop: 28,
    borderWidth: 2.5,
  },
});

