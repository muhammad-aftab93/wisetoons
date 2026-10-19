// src/components/DreamyBackground.tsx
// Whimsical, dreamy fantasy background for Day (Enchanted Pastel Sky) and Night (Starlight Lullaby).
// Pure React Native Views + Animated so no native/binary assets are required.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';

interface CloudProps {
  top: `${number}%`;
  left: `${number}%`;
  scale?: number;
  color: string;
  driftDistance?: number;
  duration?: number;
  opacity?: number;
}

const FluffyCloud: React.FC<CloudProps> = ({
  top,
  left,
  scale = 1,
  color,
  driftDistance = 18,
  duration = 7000,
  opacity = 0.85,
}) => {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [drift, duration]);

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-driftDistance, driftDistance],
  });

  return (
    <Animated.View
      style={[
        styles.cloudContainer,
        {
          top,
          left,
          opacity,
          transform: [{ translateX }, { scale }],
        },
      ]}
    >
      <View style={[styles.cloudBase, { backgroundColor: color }]} />
      <View style={[styles.cloudPuffLeft, { backgroundColor: color }]} />
      <View style={[styles.cloudPuffCenter, { backgroundColor: color }]} />
      <View style={[styles.cloudPuffRight, { backgroundColor: color }]} />
    </Animated.View>
  );
};

const DAY_SPARKLES = [
  { top: '11%', left: '18%', size: 16, symbol: '✦', color: '#FFFFFF', delay: 0 },
  { top: '22%', left: '78%', size: 18, symbol: '✨', color: '#FFF6B3', delay: 400 },
  { top: '38%', left: '12%', size: 14, symbol: '✦', color: '#FFFFFF', delay: 800 },
  { top: '48%', left: '86%', size: 16, symbol: '✨', color: '#FFE3F1', delay: 200 },
  { top: '66%', left: '24%', size: 15, symbol: '✦', color: '#FFFFFF', delay: 600 },
  { top: '72%', left: '74%', size: 14, symbol: '✦', color: '#FFF6B3', delay: 1000 },
] as const;

const NIGHT_STARS = [
  { top: '8%', left: '12%', size: 14, symbol: '✦', color: '#FFF3B0' },
  { top: '14%', left: '42%', size: 10, symbol: '•', color: '#FFFFFF' },
  { top: '10%', left: '68%', size: 16, symbol: '✨', color: '#FFE066' },
  { top: '21%', left: '24%', size: 12, symbol: '★', color: '#E0C8FF' },
  { top: '26%', left: '84%', size: 14, symbol: '✦', color: '#FFF3B0' },
  { top: '34%', left: '10%', size: 12, symbol: '✨', color: '#B8E8FC' },
  { top: '40%', left: '58%', size: 10, symbol: '•', color: '#FFFFFF' },
  { top: '46%', left: '88%', size: 15, symbol: '★', color: '#FFE066' },
  { top: '56%', left: '18%', size: 13, symbol: '✦', color: '#FFF3B0' },
  { top: '62%', left: '72%', size: 12, symbol: '✨', color: '#E0C8FF' },
  { top: '74%', left: '34%', size: 11, symbol: '✦', color: '#B8E8FC' },
  { top: '78%', left: '82%', size: 14, symbol: '✨', color: '#FFE066' },
] as const;

interface DreamyBackgroundProps {
  /** Override theme mode if needed (e.g. SleepOverlayModal is always night) */
  forceMode?: 'day' | 'night';
  /** Optional scroll offset for smooth native-driver parallax */
  scrollY?: Animated.Value;
}

export const DreamyBackground: React.FC<DreamyBackgroundProps> = ({ forceMode, scrollY }) => {
  const { mode: appMode } = useApp();
  const mode = forceMode ?? appMode;
  const isDay = mode === 'day';

  const twinkleA = useRef(new Animated.Value(0.35)).current;
  const twinkleB = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleA, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(twinkleA, { toValue: 0.3, duration: 1600, useNativeDriver: true }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleB, { toValue: 0.25, duration: 2100, useNativeDriver: true }),
        Animated.timing(twinkleB, { toValue: 1, duration: 2100, useNativeDriver: true }),
      ])
    );
    const loopFloat = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loopA.start();
    loopB.start();
    loopFloat.start();
    return () => {
      loopA.stop();
      loopB.stop();
      loopFloat.stop();
    };
  }, [twinkleA, twinkleB, floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const parallaxSlow = scrollY
    ? scrollY.interpolate({
        inputRange: [-200, 0, 1200],
        outputRange: [16, 0, -48],
        extrapolate: 'clamp',
      })
    : 0;

  const parallaxMid = scrollY
    ? scrollY.interpolate({
        inputRange: [-200, 0, 1200],
        outputRange: [28, 0, -90],
        extrapolate: 'clamp',
      })
    : 0;

  if (isDay) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dayBase]}>
        {/* Soft pastel sky gradient bands */}
        <View style={styles.daySkyTop} />
        <View style={styles.daySkyMid} />

        {/* Dreamy pastel aurora / cotton-candy glow orbs */}
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: parallaxSlow }] }]}>
          <View style={styles.dayOrbPeach} />
          <View style={styles.dayOrbLilac} />
          <View style={styles.dayOrbMint} />
          <View style={styles.dayOrbButter} />

          {/* Subtle pastel rainbow arc in upper-left sky */}
          <View style={styles.rainbowOuter}>
            <View style={styles.rainbowMid}>
              <View style={styles.rainbowInner} />
            </View>
          </View>

          {/* Warm glowing sun in top-right */}
          <Animated.View style={[styles.sunWrap, { transform: [{ translateY: floatY }] }]}>
            <View style={styles.sunHaloOuter} />
            <View style={styles.sunHaloInner} />
            <View style={styles.sunCore} />
          </Animated.View>
        </Animated.View>

        {/* Floating fairytale clouds & sparkles with mid-depth parallax */}
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: parallaxMid }] }]}>
          <FluffyCloud top="9%" left="8%" scale={0.95} color="#FFFFFF" driftDistance={20} duration={8000} opacity={0.85} />
          <FluffyCloud top="19%" left="62%" scale={0.75} color="#FFF9FB" driftDistance={15} duration={6800} opacity={0.78} />
          <FluffyCloud top="44%" left="4%" scale={0.7} color="#FFFFFF" driftDistance={16} duration={7500} opacity={0.65} />
          <FluffyCloud top="55%" left="70%" scale={0.85} color="#F8FBFF" driftDistance={22} duration={8600} opacity={0.7} />

          {/* Floating pastel bubbles */}
          <Animated.View style={[styles.bubble, styles.bubble1, { transform: [{ translateY: floatY }] }]} />
          <Animated.View style={[styles.bubble, styles.bubble2, { transform: [{ translateY: floatY }] }]} />
          <Animated.View style={[styles.bubble, styles.bubble3, { transform: [{ translateY: floatY }] }]} />

          {/* Gentle twinkling sparkles */}
          {DAY_SPARKLES.map((sp, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.sparkle,
                {
                  top: sp.top,
                  left: sp.left,
                  fontSize: sp.size,
                  color: sp.color,
                  opacity: i % 2 === 0 ? twinkleA : twinkleB,
                },
              ]}
            >
              {sp.symbol}
            </Animated.Text>
          ))}
        </Animated.View>

        {/* Rolling enchanted pastel hills at the bottom */}
        <View style={styles.dayHillBack} />
        <View style={styles.dayHillMid} />
        <View style={styles.dayHillFront} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.nightBase]}>
      {/* Deep velvety night sky layers */}
      <View style={styles.nightSkyTop} />
      <View style={styles.nightSkyMid} />

      {/* Magical nebula glow orbs & Crescent Moon */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: parallaxSlow }] }]}>
        <View style={styles.nightOrbAmethyst} />
        <View style={styles.nightOrbTeal} />
        <View style={styles.nightOrbRose} />

        {/* Glowing Crescent Moon & Halos */}
        <Animated.View style={[styles.moonWrap, { transform: [{ translateY: floatY }] }]}>
          <View style={styles.moonHaloOuter} />
          <View style={styles.moonHaloInner} />
          <View style={styles.moonBody}>
            <View style={styles.moonCutout} />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Soft twilight mist clouds & twinkling starfield with mid-depth parallax */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: parallaxMid }] }]}>
        <FluffyCloud top="14%" left="6%" scale={0.9} color="#322B5E" driftDistance={18} duration={8500} opacity={0.55} />
        <FluffyCloud top="32%" left="64%" scale={0.75} color="#2B2552" driftDistance={14} duration={7200} opacity={0.5} />
        <FluffyCloud top="60%" left="10%" scale={0.8} color="#28234C" driftDistance={20} duration={9000} opacity={0.45} />

        {/* Twinkling starfield */}
        {NIGHT_STARS.map((st, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.sparkle,
              {
                top: st.top,
                left: st.left,
                fontSize: st.size,
                color: st.color,
                opacity: i % 2 === 0 ? twinkleA : twinkleB,
              },
            ]}
          >
            {st.symbol}
          </Animated.Text>
        ))}

        {/* Warm golden firefly orbs */}
        <Animated.View style={[styles.firefly, { top: '68%', left: '22%', opacity: twinkleA }]} />
        <Animated.View style={[styles.firefly, { top: '75%', left: '65%', opacity: twinkleB }]} />
        <Animated.View style={[styles.firefly, { top: '83%', left: '40%', opacity: twinkleA }]} />
      </Animated.View>

      {/* Sleepy enchanted night hills at the bottom */}
      <View style={styles.nightHillBack} />
      <View style={styles.nightHillFront} />
    </View>
  );
};

const styles = StyleSheet.create({
  /* ================= DAY MODE ================= */
  dayBase: {
    backgroundColor: '#EAF2FF',
    overflow: 'hidden',
  },
  daySkyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: '#E3ECFF',
    opacity: 0.85,
  },
  daySkyMid: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#F3EAFD',
    opacity: 0.65,
  },
  dayOrbPeach: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFD6E8',
    opacity: 0.55,
  },
  dayOrbLilac: {
    position: 'absolute',
    top: '24%',
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E2D4FF',
    opacity: 0.55,
  },
  dayOrbMint: {
    position: 'absolute',
    top: '50%',
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#CCF7EE',
    opacity: 0.55,
  },
  dayOrbButter: {
    position: 'absolute',
    top: '12%',
    left: '30%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFF5C0',
    opacity: 0.45,
  },
  rainbowOuter: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 14,
    borderColor: 'rgba(255, 182, 193, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainbowMid: {
    width: 352,
    height: 352,
    borderRadius: 176,
    borderWidth: 14,
    borderColor: 'rgba(255, 229, 153, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainbowInner: {
    width: 324,
    height: 324,
    borderRadius: 162,
    borderWidth: 14,
    borderColor: 'rgba(162, 232, 221, 0.28)',
  },
  sunWrap: {
    position: 'absolute',
    top: 28,
    right: 28,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunHaloOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF3B0',
    opacity: 0.45,
  },
  sunHaloInner: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFE57F',
    opacity: 0.65,
  },
  sunCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD147',
    borderWidth: 3,
    borderColor: '#FFF9D2',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  bubble1: { width: 28, height: 28, top: '34%', left: '22%' },
  bubble2: { width: 18, height: 18, top: '42%', left: '78%' },
  bubble3: { width: 24, height: 24, top: '68%', left: '14%' },
  dayHillBack: {
    position: 'absolute',
    bottom: -110,
    right: -80,
    width: 440,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#D8E6FF',
    opacity: 0.75,
  },
  dayHillMid: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 420,
    height: 220,
    borderRadius: 210,
    backgroundColor: '#D2F5E8',
    opacity: 0.8,
  },
  dayHillFront: {
    position: 'absolute',
    bottom: -140,
    left: '18%',
    width: 460,
    height: 210,
    borderRadius: 230,
    backgroundColor: '#E5F9E0',
    opacity: 0.75,
  },

  /* ================= NIGHT MODE ================= */
  nightBase: {
    backgroundColor: '#15122A',
    overflow: 'hidden',
  },
  nightSkyTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#110E24',
    opacity: 0.85,
  },
  nightSkyMid: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#1D183B',
    opacity: 0.7,
  },
  nightOrbAmethyst: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#3D276E',
    opacity: 0.5,
  },
  nightOrbTeal: {
    position: 'absolute',
    top: '36%',
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1E3F66',
    opacity: 0.45,
  },
  nightOrbRose: {
    position: 'absolute',
    bottom: '12%',
    left: '15%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#48245C',
    opacity: 0.4,
  },
  moonWrap: {
    position: 'absolute',
    top: 32,
    right: 32,
    width: 104,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonHaloOuter: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F9D966',
    opacity: 0.14,
  },
  moonHaloInner: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F9D966',
    opacity: 0.24,
  },
  moonBody: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3B0',
    overflow: 'hidden',
  },
  moonCutout: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#251D47',
  },
  firefly: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE066',
    borderWidth: 2,
    borderColor: 'rgba(255, 243, 176, 0.6)',
  },
  nightHillBack: {
    position: 'absolute',
    bottom: -115,
    right: -70,
    width: 440,
    height: 220,
    borderRadius: 220,
    backgroundColor: '#221C44',
    opacity: 0.85,
  },
  nightHillFront: {
    position: 'absolute',
    bottom: -130,
    left: -80,
    width: 460,
    height: 220,
    borderRadius: 230,
    backgroundColor: '#1B1638',
    opacity: 0.9,
  },

  /* ================= SHARED CLOUD & SPARKLES ================= */
  cloudContainer: {
    position: 'absolute',
    width: 110,
    height: 46,
  },
  cloudBase: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    width: 90,
    height: 26,
    borderRadius: 14,
  },
  cloudPuffLeft: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  cloudPuffCenter: {
    position: 'absolute',
    bottom: 14,
    left: 38,
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  cloudPuffRight: {
    position: 'absolute',
    bottom: 8,
    left: 66,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  sparkle: {
    position: 'absolute',
    fontWeight: '700',
  },
});
