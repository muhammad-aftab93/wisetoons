// src/components/SleepOverlayModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WiseOwl } from './WiseOwl';
import { DreamyBackground } from './DreamyBackground';

interface Props {
  visible: boolean;
  onWake: () => void;
}

/** Shown when the bedtime timer reaches zero. Dismissal requires the parental gate (handled by caller). */
export const SleepOverlayModal: React.FC<Props> = ({ visible, onWake }) => (
  <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={() => {}}>
    <View style={styles.container}>
      <DreamyBackground forceMode="night" />
      <Text style={styles.stars}>✨ ⭐ ✨ ⭐ ✨</Text>
      <WiseOwl size={140} sleeping />
      <Text style={styles.title}>Time for Sleep!</Text>
      <Text style={styles.sub}>Sweet dreams and sleep tight — Goodnight! 🌙</Text>
      <TouchableOpacity style={styles.btn} onPress={onWake} accessibilityLabel="Grown-up wake up">
        <Text style={styles.btnText}>Grown-ups: Wake Up</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1931',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stars: { fontSize: 24, marginBottom: 24, opacity: 0.8 },
  title: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#F4D35E',
    textAlign: 'center',
    marginTop: 24,
  },
  sub: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 18,
    color: '#A39BA8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 48,
  },
  btn: {
    minHeight: 64,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#433E70',
    justifyContent: 'center',
  },
  btnText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16, color: '#A39BA8' },
});

