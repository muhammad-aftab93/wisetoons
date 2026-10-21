// src/components/KidsGamesHub.tsx
// Interactive, kid-safe mini games hub featuring cute characters and friends.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/useAppContext';
import { WiseOwl } from './WiseOwl';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';

type GameType = 'menu' | 'memory' | 'balloon';

// -------------------------------------------------------------
// 1. Memory Match Game
// -------------------------------------------------------------
interface CardItem {
  id: number;
  emoji: string;
  label: string;
  matched: boolean;
}

const MEMORY_ITEMS = [
  { emoji: '🦉', label: 'Owl' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🌈', label: 'Rainbow' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🍎', label: 'Apple' },
];

function createShuffledDeck(): CardItem[] {
  const deck: CardItem[] = [];
  let id = 0;
  MEMORY_ITEMS.forEach((item) => {
    // 2 cards for each item (pair)
    deck.push({ id: id++, emoji: item.emoji, label: item.label, matched: false });
    deck.push({ id: id++, emoji: item.emoji, label: item.label, matched: false });
  });
  return deck.sort(() => Math.random() - 0.5);
}

const MemoryMatchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [cards, setCards] = useState<CardItem[]>(() => createShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const winAnim = useRef(new Animated.Value(0)).current;

  const matchedCount = cards.filter((c) => c.matched).length;
  const isWon = matchedCount === cards.length && cards.length > 0;

  useEffect(() => {
    if (isWon) {
      Animated.spring(winAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }, [isWon, winAnim]);

  const handleCardPress = (index: number) => {
    if (isLocked || flippedIndices.includes(index) || cards[index].matched) {
      return;
    }

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [firstIdx, secondIdx] = nextFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, matched: true } : c))
          );
          setFlippedIndices([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const restart = () => {
    winAnim.setValue(0);
    setCards(createShuffledDeck());
    setFlippedIndices([]);
    setMoves(0);
    setIsLocked(false);
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Games</Text>
        </TouchableOpacity>
        <Text style={[styles.gameScoreText, { color: colors.textSecondary }]}>Moves: {moves}</Text>
        <TouchableOpacity
          style={[styles.smallActionBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={restart}
        >
          <Ionicons name="refresh" size={20} color={colors.primaryAccent} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsGrid}>
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || card.matched;
          return (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              onPress={() => handleCardPress(idx)}
              style={[
                styles.memoryCard,
                {
                  backgroundColor: isFlipped ? colors.surfaceElevated : colors.primaryAccent,
                  borderColor: card.matched ? '#52B788' : colors.cardBorder,
                },
              ]}
            >
              <Text style={styles.memoryEmoji}>{isFlipped ? card.emoji : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isWon && (
        <Animated.View
          style={[
            styles.winOverlay,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primaryAccent,
              transform: [{ scale: winAnim }],
            },
          ]}
        >
          <WiseOwl size={100} waving />
          <Text style={[styles.winTitle, { color: colors.textPrimary }]}>Hooray! Great Job! 🎉</Text>
          <Text style={[styles.winSubtitle, { color: colors.textSecondary }]}>
            You found all pairs in {moves} moves!
          </Text>
          <TouchableOpacity
            style={[styles.playAgainBtn, { backgroundColor: colors.primaryAccent }]}
            onPress={restart}
          >
            <Ionicons name="play" size={22} color={colors.onAccent} />
            <Text style={[styles.playAgainText, { color: colors.onAccent }]}>Play Again</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

// -------------------------------------------------------------
// 2. Star & Balloon Popper Game
// -------------------------------------------------------------
interface BalloonItem {
  id: number;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  size: number;
  color: string;
}

const BALLOON_ICONS = ['🎈', '⭐', '✨', '🎈', '🌟', '🎈', '🌙', '🎈'];
const BALLOON_COLORS = ['#FFADAD', '#FFD166', '#06D6A0', '#118AB2', '#CDB4FF', '#FFC6FF'];

const BalloonPopGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);

  const spawnBalloons = useCallback(() => {
    const list: BalloonItem[] = [];
    for (let i = 0; i < 7; i++) {
      list.push({
        id: Date.now() + i + Math.random(),
        emoji: BALLOON_ICONS[Math.floor(Math.random() * BALLOON_ICONS.length)],
        x: 10 + Math.random() * 75,
        y: 15 + (i * 12) + (Math.random() * 8),
        size: 52 + Math.random() * 16,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      });
    }
    setBalloons(list);
  }, []);

  useEffect(() => {
    spawnBalloons();
  }, [spawnBalloons]);

  const popBalloon = (id: number) => {
    setScore((s) => s + 1);
    setBalloons((prev) => {
      const filtered = prev.filter((b) => b.id !== id);
      if (filtered.length <= 2) {
        // Respawn more when low
        setTimeout(() => spawnBalloons(), 300);
      }
      return filtered;
    });
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Games</Text>
        </TouchableOpacity>
        <Text style={[styles.gameScoreText, { color: colors.textPrimary }]}>
          ⭐ Score: <Text style={{ color: colors.primaryAccent, fontWeight: 'bold' }}>{score}</Text>
        </Text>
        <TouchableOpacity
          style={[styles.smallActionBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => {
            setScore(0);
            spawnBalloons();
          }}
        >
          <Ionicons name="refresh" size={20} color={colors.primaryAccent} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balloonField, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]}>
        <Text style={[styles.balloonHint, { color: colors.textSecondary }]}>
          Tap the floating stars & balloons to pop them!
        </Text>
        {balloons.map((b) => (
          <TouchableOpacity
            key={b.id}
            activeOpacity={0.6}
            onPress={() => popBalloon(b.id)}
            style={[
              styles.balloonBubble,
              {
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                backgroundColor: b.color + '44',
                borderColor: b.color,
              },
            ]}
          >
            <Text style={{ fontSize: b.size * 0.55 }}>{b.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// Main Kids Games Hub Component
// -------------------------------------------------------------
export const KidsGamesHub: React.FC = () => {
  const { colors, setSelectedSectionId } = useApp();
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (currentGame === 'memory') {
    return <MemoryMatchGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'balloon') {
    return <BalloonPopGame onBack={() => setCurrentGame('menu')} />;
  }

  return (
    <View style={styles.hubContainer}>
      <View style={[styles.menuGrid, isTablet && styles.menuGridTablet]}>
        {/* Game 1: Memory Match */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentGame('memory')}
          style={[styles.gameMenuCard, { backgroundColor: colors.surface, borderColor: '#FFD166' }]}
        >
          <View style={[styles.gameBanner, { backgroundColor: '#FFF3B0' }]}>
            <Text style={styles.bannerEmoji}>🧩</Text>
            <View style={[styles.bannerTag, { backgroundColor: '#FFD166' }]}>
              <Text style={styles.bannerTagText}>Memory Match</Text>
            </View>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={[styles.gameCardTitle, { color: colors.textPrimary }]}>
              Forest Memory Match
            </Text>
            <Text style={[styles.gameCardDesc, { color: colors.textSecondary }]}>
              Flip & match pairs of cute owls, stars, and forest friends!
            </Text>
            <View style={[styles.playButton, { backgroundColor: '#FFD166' }]}>
              <Ionicons name="play" size={20} color="#1D3557" />
              <Text style={styles.playButtonText}>Play Now</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Game 2: Star & Balloon Pop */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentGame('balloon')}
          style={[styles.gameMenuCard, { backgroundColor: colors.surface, borderColor: '#7BDFF2' }]}
        >
          <View style={[styles.gameBanner, { backgroundColor: '#E0F7FA' }]}>
            <Text style={styles.bannerEmoji}>🎈</Text>
            <View style={[styles.bannerTag, { backgroundColor: '#7BDFF2' }]}>
              <Text style={styles.bannerTagText}>Quick Tap</Text>
            </View>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={[styles.gameCardTitle, { color: colors.textPrimary }]}>
              Pop Stars & Balloons
            </Text>
            <Text style={[styles.gameCardDesc, { color: colors.textSecondary }]}>
              Tap the floating balloons and stars as fast as you can!
            </Text>
            <View style={[styles.playButton, { backgroundColor: '#7BDFF2' }]}>
              <Ionicons name="play" size={20} color="#1D3557" />
              <Text style={styles.playButtonText}>Play Now</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Game 3: Education & Learn Lab */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setSelectedSectionId('education')}
          style={[styles.gameMenuCard, { backgroundColor: colors.surface, borderColor: '#6BCB77' }]}
        >
          <View style={[styles.gameBanner, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.bannerEmoji}>🎓</Text>
            <View style={[styles.bannerTag, { backgroundColor: '#6BCB77' }]}>
              <Text style={styles.bannerTagText}>Education</Text>
            </View>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={[styles.gameCardTitle, { color: colors.textPrimary }]}>
              Kids Learn Lab
            </Text>
            <Text style={[styles.gameCardDesc, { color: colors.textSecondary }]}>
              Explore ABC phonics, 123 counting, vibrant shapes & animal sounds!
            </Text>
            <View style={[styles.playButton, { backgroundColor: '#6BCB77' }]}>
              <Ionicons name="school" size={20} color="#FFFFFF" />
              <Text style={[styles.playButtonText, { color: '#FFFFFF' }]}>Explore Lab</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hubContainer: {
    width: '100%',
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  menuGrid: {
    width: '100%',
    maxWidth: 680,
    gap: SPACING.lg,
  },
  menuGridTablet: {
    flexDirection: 'row',
  },
  gameMenuCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gameBanner: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerEmoji: {
    fontSize: 48,
  },
  bannerTag: {
    position: 'absolute',
    top: 10,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  bannerTagText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 11,
    color: '#1D3557',
  },
  gameCardBody: {
    padding: SPACING.md,
  },
  gameCardTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
  },
  gameCardDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: RADIUS.pill,
    gap: 6,
    marginTop: 14,
  },
  playButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 15,
    color: '#1D3557',
  },

  // In-Game Common
  gameContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 15,
  },
  gameScoreText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
  },
  smallActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Memory Match
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: SPACING.xs,
  },
  memoryCard: {
    width: 72,
    height: 84,
    borderRadius: RADIUS.md,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  memoryEmoji: {
    fontSize: 34,
  },
  winOverlay: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  winTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 22,
    marginTop: 12,
  },
  winSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
  },
  playAgainText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
  },

  // Balloon Pop
  balloonField: {
    height: 380,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    position: 'relative',
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  balloonHint: {
    position: 'absolute',
    top: 10,
    width: '100%',
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    opacity: 0.8,
  },
  balloonBubble: {
    position: 'absolute',
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
