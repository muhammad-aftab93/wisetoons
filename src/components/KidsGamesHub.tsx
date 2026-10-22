// src/components/KidsGamesHub.tsx
// Interactive, kid-safe mini games hub featuring cute characters and friends.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/useAppContext';
import { WiseOwl } from './WiseOwl';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';
import {
  playPopSound,
  playFlipSound,
  playMatchSuccessSound,
  playMatchFailSound,
  playVictorySound,
  setupAudioMode,
} from '../utils/soundEffects';
import { showInterstitialIfAllowed, showRewardedAd } from '../services/adService';
import { AdBanner } from './AdBanner';

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
    setupAudioMode();
  }, []);

  useEffect(() => {
    if (isWon) {
      playVictorySound();
      showInterstitialIfAllowed().catch(() => {});
      winAnim.setValue(0.65);
      Animated.spring(winAnim, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }, [isWon, winAnim]);

  const handleCardPress = (index: number) => {
    if (isLocked || flippedIndices.includes(index) || cards[index].matched) {
      return;
    }

    playFlipSound();

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [firstIdx, secondIdx] = nextFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Right Match! Play happy sparkle chime
        playMatchSuccessSound();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, matched: true } : c))
          );
          setFlippedIndices([]);
          setIsLocked(false);
        }, 500);
      } else {
        // Wrong Match! Play gentle boop-boop
        playMatchFailSound();
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const restart = () => {
    playFlipSound();
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

      <Modal
        visible={isWon}
        transparent
        animationType="fade"
        onRequestClose={restart}
      >
        <View style={styles.winModalBackdrop}>
          <Animated.View
            style={[
              styles.winCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primaryAccent,
                transform: [{ scale: winAnim }],
              },
            ]}
          >
            <WiseOwl size={105} waving accessory="⭐" />
            <Text style={[styles.winTitle, { color: colors.textPrimary }]}>Hooray! Great Job! 🎉</Text>
            <Text style={[styles.winSubtitle, { color: colors.textSecondary }]}>
              You found all pairs in {moves} moves!
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.playAgainBtn, { backgroundColor: colors.primaryAccent }]}
              onPress={restart}
              accessibilityRole="button"
              accessibilityLabel="Play Again"
            >
              <Ionicons name="play" size={22} color={colors.onAccent} />
              <Text style={[styles.playAgainText, { color: colors.onAccent }]}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[styles.bonusRewardBtn, { backgroundColor: '#FFD166' }]}
              onPress={() => {
                showRewardedAd(() => {
                  playVictorySound();
                }).catch(() => {});
              }}
              accessibilityRole="button"
              accessibilityLabel="Watch bonus cartoon for star gift"
            >
              <Ionicons name="gift" size={20} color="#1D3557" />
              <Text style={styles.bonusRewardBtnText}>Bonus Star Gift! 🎁</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

// -------------------------------------------------------------
// 2. Star & Balloon Popper Game
// -------------------------------------------------------------
interface BalloonItem {
  id: number;
  laneIndex: number;
  emoji: string;
  xPercent: number; // percentage
  startY: number; // in pixels
  size: number;
  color: string;
  durationMs: number;
}

const BALLOON_ICONS = ['🎈', '⭐', '✨', '🎈', '🌟', '🎈', '🦄', '🌈', '🌙'];
const BALLOON_COLORS = ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#9D4EDD', '#FF9F1C', '#FF70A6'];

interface FlyingBalloonProps {
  balloon: BalloonItem;
  fieldHeight: number;
  onPop: (id: number, laneIndex: number) => void;
  onEscape: (id: number, laneIndex: number) => void;
}

const FlyingBalloon: React.FC<FlyingBalloonProps> = React.memo(({ balloon, fieldHeight, onPop, onEscape }) => {
  const posY = useRef(new Animated.Value(balloon.startY)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;
  const isPopped = useRef(false);

  useEffect(() => {
    const targetY = -balloon.size - 40;
    const distance = balloon.startY - targetY;
    const totalDistance = fieldHeight + balloon.size + 40 - targetY;
    const actualDuration = Math.max(1400, Math.round((distance / totalDistance) * balloon.durationMs));

    const floatAnim = Animated.timing(posY, {
      toValue: targetY,
      duration: actualDuration,
      easing: Easing.linear,
      useNativeDriver: USE_NATIVE_DRIVER,
    });

    floatAnim.start(({ finished }) => {
      if (finished && !isPopped.current) {
        onEscape(balloon.id, balloon.laneIndex);
      }
    });

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1100 + (balloon.id % 400),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(sway, {
          toValue: -1,
          duration: 1100 + (balloon.id % 400),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    swayLoop.start();

    return () => {
      floatAnim.stop();
      swayLoop.stop();
    };
  }, [balloon, fieldHeight, onEscape, posY, sway]);

  const handlePress = () => {
    if (isPopped.current) return;
    isPopped.current = true;
    playPopSound();
    Animated.parallel([
      Animated.spring(popScale, {
        toValue: 1.45,
        friction: 4,
        tension: 180,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(popOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start(() => {
      onPop(balloon.id, balloon.laneIndex);
    });
  };

  const swayX = sway.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  return (
    <Animated.View
      style={[
        styles.balloonWrap,
        {
          left: `${balloon.xPercent}%`,
          transform: [
            { translateY: posY },
            { translateX: swayX },
            { scale: popScale },
          ],
          opacity: popOpacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[
          styles.balloonBubble,
          {
            width: balloon.size,
            height: balloon.size * 1.15,
            borderRadius: balloon.size / 2,
            backgroundColor: balloon.color + '44',
            borderColor: balloon.color,
          },
        ]}
      >
        <Text style={{ fontSize: balloon.size * 0.52 }}>{balloon.emoji}</Text>
      </TouchableOpacity>
      <View style={[styles.balloonKnot, { borderTopColor: balloon.color }]} />
      <View style={[styles.balloonString, { borderColor: balloon.color }]} />
    </Animated.View>
  );
});

const BalloonPopGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const nextId = useRef(1);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Expanded height to fill screen downwards comfortably:
  const fieldHeight = Math.max(500, Math.min(650, screenHeight - 155));
  const isTablet = screenWidth >= 600;

  // Dedicated collision-free vertical lanes across the full width:
  const LANES = useMemo(
    () => (isTablet ? [6, 21, 36, 51, 66, 81] : [7, 25, 43, 61, 79]),
    [isTablet]
  );

  const createBalloonForLane = useCallback(
    (laneIndex: number, laneX: number, startY?: number): BalloonItem => {
      const id = nextId.current++;
      const emoji = BALLOON_ICONS[Math.floor(Math.random() * BALLOON_ICONS.length)];
      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      // Subtle position jitter strictly contained within its lane
      const xPercent = laneX + (Math.random() * 2 - 1);
      const size = 52 + Math.random() * 8;
      const durationMs = 5200 + Math.random() * 2200;
      return {
        id,
        laneIndex,
        emoji,
        xPercent,
        startY: startY !== undefined ? startY : fieldHeight + 20,
        size,
        color,
        durationMs,
      };
    },
    [fieldHeight]
  );

  const initGame = useCallback(() => {
    // Vertically staggered so balloons start gracefully spread out without overlap
    const verticalStagger = [0.72, 0.38, 0.88, 0.22, 0.54, 0.95];
    const initial: BalloonItem[] = LANES.map((laneX, index) => {
      const startY = fieldHeight * verticalStagger[index % verticalStagger.length];
      return createBalloonForLane(index, laneX, startY);
    });
    setBalloons(initial);
  }, [LANES, fieldHeight, createBalloonForLane]);

  useEffect(() => {
    setupAudioMode();
    initGame();
  }, [initGame]);

  const handlePop = useCallback(
    (id: number, laneIndex: number) => {
      setScore((s) => s + 1);
      setBalloons((prev) => {
        const remaining = prev.filter((b) => b.id !== id);
        const laneX = LANES[laneIndex] ?? 50;
        return [...remaining, createBalloonForLane(laneIndex, laneX)];
      });
    },
    [LANES, createBalloonForLane]
  );

  const handleEscape = useCallback(
    (id: number, laneIndex: number) => {
      setBalloons((prev) => {
        const remaining = prev.filter((b) => b.id !== id);
        const laneX = LANES[laneIndex] ?? 50;
        return [...remaining, createBalloonForLane(laneIndex, laneX)];
      });
    },
    [LANES, createBalloonForLane]
  );

  return (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            showInterstitialIfAllowed().catch(() => {});
            onBack();
          }}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Games</Text>
        </TouchableOpacity>
        <Text style={[styles.gameScoreText, { color: colors.textPrimary }]}>
          ⭐ Score: <Text style={{ color: colors.primaryAccent, fontWeight: 'bold' }}>{score}</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.smallActionBtn, { backgroundColor: '#FFE082' }]}
            onPress={() => {
              showRewardedAd((reward) => {
                setScore((s) => s + (reward.amount || 25));
                playVictorySound();
              }).catch(() => {});
            }}
            accessibilityRole="button"
            accessibilityLabel="Watch cartoon for bonus stars"
          >
            <Ionicons name="gift" size={18} color="#1D3557" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallActionBtn, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {
              setScore(0);
              initGame();
            }}
          >
            <Ionicons name="refresh" size={20} color={colors.primaryAccent} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.balloonField,
          {
            height: fieldHeight,
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.balloonHint, { color: colors.textSecondary }]}>
          Tap the floating stars & balloons as they fly up! 🎈
        </Text>
        {balloons.map((b) => (
          <FlyingBalloon
            key={b.id}
            balloon={b}
            fieldHeight={fieldHeight}
            onPop={handlePop}
            onEscape={handleEscape}
          />
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
    paddingHorizontal: 0,
    paddingBottom: SPACING.md,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
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
  winModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  winCard: {
    width: '100%',
    maxWidth: 360,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
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
  bonusRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    borderColor: '#1D3557',
  },
  bonusRewardBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    color: '#1D3557',
  },

  // Balloon Pop
  balloonField: {
    height: 400,
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
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    opacity: 0.8,
    zIndex: 10,
  },
  balloonWrap: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  balloonBubble: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  balloonKnot: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  balloonString: {
    width: 1,
    height: 14,
    borderLeftWidth: 1.5,
    opacity: 0.55,
  },
});
