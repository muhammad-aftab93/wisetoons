// src/components/ParentalGateModal.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ParentalGateModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const NUMBER_WORDS: Record<number, string> = {
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
};
const KEYS = [3, 4, 5, 6, 7, 8, 9];

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  visible,
  onSuccess,
  onCancel,
}) => {
  const [numA, setNumA] = useState(6);
  const [numB, setNumB] = useState(7);
  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateChallenge = useCallback(() => {
    setNumA(KEYS[Math.floor(Math.random() * KEYS.length)]);
    setNumB(KEYS[Math.floor(Math.random() * KEYS.length)]);
    setInput('');
    setErrorMsg(false);
  }, []);

  useEffect(() => {
    if (visible) generateChallenge();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [visible, generateChallenge]);

  const handleDigitPress = (digit: string) => {
    if (errorMsg) return;
    const nextInput = (input + digit).slice(0, 2);
    setInput(nextInput);
    const expected = String(numA + numB);
    if (nextInput.length === expected.length) {
      if (nextInput === expected) {
        onSuccess();
      } else {
        setErrorMsg(true);
        retryTimer.current = setTimeout(generateChallenge, 700);
      }
    }
  };

  const handleBackspace = () => {
    if (errorMsg) return;
    setInput((prev) => prev.slice(0, -1));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.badge}>PARENTS ONLY</Text>
          <Text style={styles.title}>Ask a Grown-Up</Text>
          <Text style={styles.subtitle}>To continue, please solve this math problem:</Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              What is {NUMBER_WORDS[numA]} plus {NUMBER_WORDS[numB]}?
            </Text>
            <View style={[styles.answerDisplay, errorMsg && styles.answerError]}>
              <Text style={styles.answerText}>
                {errorMsg ? 'Try Again' : input || ' _ _ '}
              </Text>
            </View>
          </View>

          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <TouchableOpacity
                key={d}
                style={styles.keyButton}
                onPress={() => handleDigitPress(d)}
                activeOpacity={0.7}
              >
                <Text style={styles.keyText}>{d}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.keyButton, styles.clearKey]} onPress={handleBackspace}>
              <Text style={styles.clearKeyText}>DEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyButton} onPress={() => handleDigitPress('0')}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>⬅ Back to Kids Zone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  badge: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#CBD5E1', textAlign: 'center', marginBottom: 16 },
  questionBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  questionText: { fontSize: 18, fontWeight: '700', color: '#FDE047', marginBottom: 10, textAlign: 'center' },
  answerDisplay: {
    minWidth: 110,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
  },
  answerError: { borderColor: '#EF4444', backgroundColor: '#450A0A' },
  answerText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  keyButton: {
    width: 84,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  clearKey: { backgroundColor: '#475569' },
  clearKeyText: { fontSize: 15, fontWeight: '700', color: '#E2E8F0' },
  cancelButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    backgroundColor: '#06D6A0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
});

