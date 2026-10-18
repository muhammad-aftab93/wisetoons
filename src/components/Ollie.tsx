// src/components/Ollie.tsx
// Ollie the Wise Little Owl, drawn with Views so no binary assets are required.
// Swap for a Lottie/PNG mascot later without changing call sites.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';

interface Props {
  size?: number;
  sleeping?: boolean;
  waving?: boolean;
  /** Accessory shown next to Ollie, e.g. '🔍' */
  accessory?: string;
}

export const Ollie: React.FC<Props> = ({ size = 120, sleeping = false, waving = false, accessory }) => {
  const bob = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    bobLoop.start();
    let waveLoop: Animated.CompositeAnimation | null = null;
    if (waving) {
      waveLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(wave, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(wave, { toValue: 0, duration: 350, useNativeDriver: true }),
        ])
      );
      waveLoop.start();
    }
    return () => {
      bobLoop.stop();
      waveLoop?.stop();
    };
  }, [bob, wave, waving]);

  const s = size;
  const eye = s * 0.26;
  return (
    <Animated.View
      style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -s * 0.06] }) }] }}
      accessibilityLabel="Ollie the owl"
    >
      <View style={{ width: s, height: s, alignItems: 'center' }}>
        {/* ear tufts */}
        <View style={[styles.tuft, { left: s * 0.1, width: s * 0.22, height: s * 0.22, top: 0 }]} />
        <View style={[styles.tuft, { right: s * 0.1, width: s * 0.22, height: s * 0.22, top: 0 }]} />
        {/* body */}
        <View style={[styles.body, { width: s * 0.9, height: s * 0.92, borderRadius: s * 0.45, top: s * 0.08 }]}>
          <View style={[styles.belly, { width: s * 0.5, height: s * 0.42, borderRadius: s * 0.25, bottom: s * 0.06 }]} />
          <View style={styles.eyeRow}>
            {[0, 1].map((i) => (
              <View key={i} style={[styles.eyeWhite, { width: eye * 1.4, height: eye * 1.4, borderRadius: eye * 0.7 }]}>
                {sleeping ? (
                  <View style={{ width: eye, height: 4, backgroundColor: '#3E2723', borderRadius: 2 }} />
                ) : (
                  <View style={[styles.pupil, { width: eye * 0.8, height: eye * 0.8, borderRadius: eye * 0.4 }]}>
                    <View style={styles.glint} />
                  </View>
                )}
              </View>
            ))}
          </View>
          <View style={[styles.beak, { borderTopWidth: s * 0.12, borderLeftWidth: s * 0.06, borderRightWidth: s * 0.06 }]} />
        </View>
        {waving && (
          <Animated.Text
            style={{
              position: 'absolute',
              right: -s * 0.05,
              top: s * 0.45,
              fontSize: s * 0.28,
              transform: [{ rotate: wave.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '25deg'] }) }],
            }}
          >
            👋
          </Animated.Text>
        )}
        {sleeping && <Text style={{ position: 'absolute', right: 0, top: 0, fontSize: s * 0.22 }}>💤</Text>}
        {accessory && <Text style={{ position: 'absolute', right: -s * 0.1, bottom: 0, fontSize: s * 0.35 }}>{accessory}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tuft: { position: 'absolute', backgroundColor: '#8D5B3A', borderRadius: 6, transform: [{ rotate: '35deg' }] },
  body: { position: 'absolute', backgroundColor: '#A9744F', alignItems: 'center', overflow: 'hidden' },
  belly: { position: 'absolute', backgroundColor: '#F5E6D3' },
  eyeRow: { flexDirection: 'row', gap: 6, marginTop: '22%' },
  eyeWhite: { backgroundColor: '#FFF8E1', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFD166' },
  pupil: { backgroundColor: '#3E2723', alignItems: 'flex-end' },
  glint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', margin: 3 },
  beak: {
    width: 0,
    height: 0,
    marginTop: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFB703',
  },
});

