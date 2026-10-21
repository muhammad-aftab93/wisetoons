// src/components/KidsLearnHub.tsx
// Interactive, kid-safe educational learning hub featuring cute characters and friends.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/useAppContext';
import { WiseOwl } from './WiseOwl';
import { RADIUS, SPACING, TYPOGRAPHY } from '../theme/theme';
import { USE_NATIVE_DRIVER } from '../utils/animation';

type LearnModule = 'menu' | 'abc' | 'numbers' | 'shapes' | 'animals';

// -------------------------------------------------------------
// 1. ABC Phonics Adventure
// -------------------------------------------------------------
interface AlphabetItem {
  letter: string;
  word: string;
  emoji: string;
  phonic: string;
  color: string;
}

const ALPHABET_DATA: AlphabetItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎', phonic: 'Ah-Ah-Apple!', color: '#FF6B6B' },
  { letter: 'B', word: 'Butterfly', emoji: '🦋', phonic: 'Buh-Buh-Butterfly!', color: '#4D96FF' },
  { letter: 'C', word: 'Cat', emoji: '🐱', phonic: 'Kuh-Kuh-Cat!', color: '#FFD93D' },
  { letter: 'D', word: 'Dolphin', emoji: '🐬', phonic: 'Duh-Duh-Dolphin!', color: '#6BCB77' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', phonic: 'Eh-Eh-Elephant!', color: '#B983FF' },
  { letter: 'F', word: 'Fox', emoji: '🦊', phonic: 'Fff-Fff-Fox!', color: '#FF9F45' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒', phonic: 'Juh-Juh-Giraffe!', color: '#F4D160' },
  { letter: 'H', word: 'Heart', emoji: '💖', phonic: 'Huh-Huh-Heart!', color: '#FF758F' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦', phonic: 'Eye-Ice Cream!', color: '#FFB830' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼', phonic: 'Juh-Juh-Jellyfish!', color: '#68B984' },
  { letter: 'K', word: 'Kite', emoji: '🪁', phonic: 'Kuh-Kuh-Kite!', color: '#FF6363' },
  { letter: 'L', word: 'Lion', emoji: '🦁', phonic: 'Lll-Lll-Lion!', color: '#FFA41B' },
  { letter: 'M', word: 'Moon', emoji: '🌙', phonic: 'Mmm-Mmm-Moon!', color: '#845EC2' },
  { letter: 'N', word: 'Nest', emoji: '🪹', phonic: 'Nnn-Nnn-Nest!', color: '#D5C4A1' },
  { letter: 'O', word: 'Owl', emoji: '🦉', phonic: 'Ah-Ah-Owl!', color: '#4B7BEC' },
  { letter: 'P', word: 'Panda', emoji: '🐼', phonic: 'Puh-Puh-Panda!', color: '#2C3A47' },
  { letter: 'Q', word: 'Queen', emoji: '👑', phonic: 'Kw-Kw-Queen!', color: '#F7B731' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈', phonic: 'Rrr-Rrr-Rainbow!', color: '#FC5C65' },
  { letter: 'S', word: 'Star', emoji: '⭐', phonic: 'Sss-Sss-Star!', color: '#FED330' },
  { letter: 'T', word: 'Turtle', emoji: '🐢', phonic: 'Tuh-Tuh-Turtle!', color: '#26DE81' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', phonic: 'Uh-Uh-Umbrella!', color: '#A55EEA' },
  { letter: 'V', word: 'Violin', emoji: '🎻', phonic: 'Vvv-Vvv-Violin!', color: '#EB3B5A' },
  { letter: 'W', word: 'Whale', emoji: '🐳', phonic: 'Wuh-Wuh-Whale!', color: '#45AAF2' },
  { letter: 'X', word: 'Xylophone', emoji: '🎶', phonic: 'X-X-Xylophone!', color: '#FA8231' },
  { letter: 'Y', word: 'Yo-Yo', emoji: '🪀', phonic: 'Yuh-Yuh-Yo-Yo!', color: '#20BF6B' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', phonic: 'Zzz-Zzz-Zebra!', color: '#778CA3' },
];

const AbcPhonicsModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cardScale = useRef(new Animated.Value(1)).current;
  const current = ALPHABET_DATA[selectedIndex];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    cardScale.setValue(0.7);
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  const handleNext = () => {
    handleSelect((selectedIndex + 1) % ALPHABET_DATA.length);
  };

  const handlePrev = () => {
    handleSelect((selectedIndex - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length);
  };

  return (
    <View style={styles.moduleWrap}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Learn Hub</Text>
        </TouchableOpacity>
        <Text style={[styles.moduleHeaderTitle, { color: colors.textPrimary }]}>🔤 ABC Phonics</Text>
      </View>

      {/* Hero Letter Card */}
      <Animated.View style={[styles.heroLetterCard, { backgroundColor: current.color + '22', borderColor: current.color, transform: [{ scale: cardScale }] }]}>
        <View style={styles.heroLetterTop}>
          <Text style={[styles.heroBigLetter, { color: current.color }]}>{current.letter} {current.letter.toLowerCase()}</Text>
          <Text style={styles.heroEmoji}>{current.emoji}</Text>
        </View>
        <Text style={[styles.heroWord, { color: colors.textPrimary }]}>{current.word}</Text>
        <View style={[styles.phonicBadge, { backgroundColor: current.color }]}>
          <Ionicons name="volume-high" size={18} color="#FFFFFF" />
          <Text style={styles.phonicText}>{current.phonic}</Text>
        </View>

        {/* Previous / Next Controls */}
        <View style={styles.heroNavRow}>
          <TouchableOpacity onPress={handlePrev} style={[styles.heroNavBtn, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text style={[styles.heroNavText, { color: colors.textPrimary }]}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={[styles.heroNavBtn, { backgroundColor: current.color }]}>
            <Text style={[styles.heroNavText, { color: '#FFFFFF' }]}>Next</Text>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 26 Letter Tiles Grid */}
      <Text style={[styles.subhead, { color: colors.textSecondary }]}>Tap any letter to explore:</Text>
      <View style={styles.alphabetGrid}>
        {ALPHABET_DATA.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <TouchableOpacity
              key={item.letter}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
              style={[
                styles.alphabetTile,
                {
                  backgroundColor: isSelected ? item.color : colors.surface,
                  borderColor: item.color,
                },
              ]}
            >
              <Text style={[styles.alphabetTileLetter, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                {item.letter}
              </Text>
              <Text style={styles.alphabetTileEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 2. 1-2-3 Counting Lab
// -------------------------------------------------------------
const COUNT_ITEMS_PALETTE = ['⭐', '🍎', '🎈', '🦉', '🦋', '🍬', '🌸', '🚗', '🍓', '🧸'];

const NumbersCountingModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [targetNumber, setTargetNumber] = useState(5);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const celebrateScale = useRef(new Animated.Value(0)).current;

  const currentEmoji = COUNT_ITEMS_PALETTE[(targetNumber - 1) % COUNT_ITEMS_PALETTE.length];
  const isComplete = tappedIndices.length === targetNumber;

  const handleSelectTarget = (num: number) => {
    setTargetNumber(num);
    setTappedIndices([]);
    celebrateScale.setValue(0);
  };

  const handleTapItem = (index: number) => {
    if (tappedIndices.includes(index)) return;
    const next = [...tappedIndices, index];
    setTappedIndices(next);
    if (next.length === targetNumber) {
      Animated.spring(celebrateScale, {
        toValue: 1,
        friction: 4,
        tension: 130,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  };

  return (
    <View style={styles.moduleWrap}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Learn Hub</Text>
        </TouchableOpacity>
        <Text style={[styles.moduleHeaderTitle, { color: colors.textPrimary }]}>🔢 123 Counting</Text>
      </View>

      {/* Number Selector Bar (1 to 10) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.numberPickerRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = num === targetNumber;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => handleSelectTarget(num)}
              style={[
                styles.numberPickerTile,
                {
                  backgroundColor: isSelected ? '#FF9F45' : colors.surface,
                  borderColor: isSelected ? '#FF9F45' : colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.numberPickerText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Counting Field */}
      <View style={[styles.countingField, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]}>
        <Text style={[styles.countingInstruction, { color: colors.textPrimary }]}>
          Tap each {currentEmoji} to count up to {targetNumber}!
        </Text>
        <Text style={[styles.countingProgress, { color: '#FF9F45' }]}>
          Counted: {tappedIndices.length} / {targetNumber}
        </Text>

        <View style={styles.itemsGrid}>
          {Array.from({ length: targetNumber }).map((_, i) => {
            const isTapped = tappedIndices.includes(i);
            const tapOrder = tappedIndices.indexOf(i) + 1;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => handleTapItem(i)}
                style={[
                  styles.countItemBubble,
                  {
                    backgroundColor: isTapped ? '#FF9F45' : colors.surface,
                    borderColor: '#FF9F45',
                    transform: [{ scale: isTapped ? 1.05 : 1 }],
                  },
                ]}
              >
                <Text style={styles.countItemEmoji}>{currentEmoji}</Text>
                {isTapped && (
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderBadgeText}>{tapOrder}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isComplete && (
          <Animated.View style={[styles.celebrationWrap, { transform: [{ scale: celebrateScale }] }]}>
            <Text style={styles.celebrationEmoji}>🎉 🦉 🌟</Text>
            <Text style={[styles.celebrationText, { color: colors.textPrimary }]}>
              Hoo-ray! You counted all {targetNumber}!
            </Text>
            <TouchableOpacity
              onPress={() => handleSelectTarget(targetNumber < 10 ? targetNumber + 1 : 1)}
              style={styles.nextCountBtn}
            >
              <Text style={styles.nextCountBtnText}>
                {targetNumber < 10 ? `Try Number ${targetNumber + 1}! ➡️` : 'Start Over! 🔄'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 3. Shapes & Colors Explorer
// -------------------------------------------------------------
interface ShapeItem {
  name: string;
  emoji: string;
  sides: string;
  colorName: string;
  colorCode: string;
  fact: string;
}

const SHAPES_DATA: ShapeItem[] = [
  { name: 'Circle', emoji: '🔴', sides: '0 Corners', colorName: 'Bright Red', colorCode: '#FF4757', fact: 'Round and smooth like the full Moon! 🌙' },
  { name: 'Star', emoji: '⭐', sides: '5 Points', colorName: 'Golden Yellow', colorCode: '#FFA502', fact: 'Twinkling bright in the night sky! ✨' },
  { name: 'Heart', emoji: '💖', sides: 'Loving Curve', colorName: 'Sweet Pink', colorCode: '#FF6B8B', fact: 'A warm shape full of kindness and hugs! 🤗' },
  { name: 'Square', emoji: '🟦', sides: '4 Equal Sides', colorName: 'Sky Blue', colorCode: '#1E90FF', fact: '4 friendly corners, just like a picture frame! 🖼️' },
  { name: 'Triangle', emoji: '🔺', sides: '3 Sharp Sides', colorName: 'Sunny Orange', colorCode: '#FF7F50', fact: 'Like a slice of watermelon or party hat! 🍉' },
  { name: 'Diamond', emoji: '💎', sides: '4 Tilted Sides', colorName: 'Teal Gem', colorCode: '#2ED573', fact: 'Sparkling like a kite flying high in the breeze! 🪁' },
];

const ShapesColorsModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [selectedShape, setSelectedShape] = useState<ShapeItem>(SHAPES_DATA[0]);

  return (
    <View style={styles.moduleWrap}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Learn Hub</Text>
        </TouchableOpacity>
        <Text style={[styles.moduleHeaderTitle, { color: colors.textPrimary }]}>🎨 Shapes & Colors</Text>
      </View>

      {/* Selected Shape Hero */}
      <View style={[styles.shapeHeroCard, { backgroundColor: selectedShape.colorCode + '22', borderColor: selectedShape.colorCode }]}>
        <Text style={styles.shapeHeroEmoji}>{selectedShape.emoji}</Text>
        <Text style={[styles.shapeHeroName, { color: colors.textPrimary }]}>{selectedShape.name}</Text>
        <View style={styles.shapeBadgeRow}>
          <View style={[styles.shapeBadge, { backgroundColor: selectedShape.colorCode }]}>
            <Text style={styles.shapeBadgeText}>{selectedShape.colorName}</Text>
          </View>
          <View style={[styles.shapeBadge, { backgroundColor: '#1D3557' }]}>
            <Text style={styles.shapeBadgeText}>{selectedShape.sides}</Text>
          </View>
        </View>
        <Text style={[styles.shapeHeroFact, { color: colors.textSecondary }]}>{selectedShape.fact}</Text>
      </View>

      {/* Shapes Grid */}
      <Text style={[styles.subhead, { color: colors.textSecondary }]}>Pick a shape to learn:</Text>
      <View style={styles.shapesGrid}>
        {SHAPES_DATA.map((shape) => {
          const isSelected = shape.name === selectedShape.name;
          return (
            <TouchableOpacity
              key={shape.name}
              onPress={() => setSelectedShape(shape)}
              style={[
                styles.shapeTile,
                {
                  backgroundColor: isSelected ? shape.colorCode + '26' : colors.surface,
                  borderColor: isSelected ? shape.colorCode : colors.cardBorder,
                },
              ]}
            >
              <Text style={styles.shapeTileEmoji}>{shape.emoji}</Text>
              <Text style={[styles.shapeTileName, { color: colors.textPrimary }]}>{shape.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// 4. Animal Safari & Sounds
// -------------------------------------------------------------
interface AnimalItem {
  name: string;
  emoji: string;
  sound: string;
  habitat: string;
  tint: string;
  fact: string;
}

const ANIMALS_DATA: AnimalItem[] = [
  { name: 'Wise Owl', emoji: '🦉', sound: '“Hoo! Hoo!”', habitat: 'Oak Forest 🌳', tint: '#B8E8FC', fact: 'Wise and gentle, loves reading and stargazing!' },
  { name: 'Leo the Lion', emoji: '🦁', sound: '“Roaaar!”', habitat: 'Sunny Savannah 🌾', tint: '#FFE082', fact: 'Has a magnificent golden mane and loves napping.' },
  { name: 'Ellie the Elephant', emoji: '🐘', sound: '“Pawoooo!”', habitat: 'Green Jungle 🌴', tint: '#E0C8FF', fact: 'Uses her long trunk to drink cool water and splash friends!' },
  { name: 'Barnaby Bear', emoji: '🐻', sound: '“Grrr-Hummm!”', habitat: 'Pine Forest 🌲', tint: '#FFD8BE', fact: 'Loves fresh berries and warm golden honey.' },
  { name: 'Pippa the Puppy', emoji: '🐶', sound: '“Woof! Woof!”', habitat: 'Cozy Home 🏡', tint: '#FFD1DC', fact: 'Wags her tail happily and loves playing catch in the yard.' },
  { name: 'Clover the Cow', emoji: '🐮', sound: '“Moooo!”', habitat: 'Flower Meadow 🌻', tint: '#C8F7DC', fact: 'Chews sweet green grass and enjoys peaceful sunny days.' },
  { name: 'Freddie the Frog', emoji: '🐸', sound: '“Ribbit! Ribbit!”', habitat: 'Waterlily Pond 🪷', tint: '#A8E6CF', fact: 'Champion leaper who catches flying fireflies at dusk!' },
  { name: 'Danny the Dolphin', emoji: '🐬', sound: '“Click! Whistle!”', habitat: 'Deep Blue Sea 🌊', tint: '#B2EBF2', fact: 'Splashes playful backflips through shimmering ocean waves.' },
];

const AnimalsSafariModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { colors } = useApp();
  const [activeAnimal, setActiveAnimal] = useState<AnimalItem>(ANIMALS_DATA[0]);
  const soundPop = useRef(new Animated.Value(1)).current;

  const handleSelectAnimal = (animal: AnimalItem) => {
    setActiveAnimal(animal);
    soundPop.setValue(0.7);
    Animated.spring(soundPop, {
      toValue: 1,
      friction: 3,
      tension: 160,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  return (
    <View style={styles.moduleWrap}>
      <View style={styles.moduleHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Learn Hub</Text>
        </TouchableOpacity>
        <Text style={[styles.moduleHeaderTitle, { color: colors.textPrimary }]}>🦁 Animal Friends</Text>
      </View>

      {/* Animal Hero Feature */}
      <View style={[styles.animalHeroCard, { backgroundColor: activeAnimal.tint, borderColor: '#1D3557' }]}>
        <Text style={styles.animalHeroEmoji}>{activeAnimal.emoji}</Text>
        <Text style={styles.animalHeroName}>{activeAnimal.name}</Text>
        <Animated.View style={[styles.animalSoundBubble, { transform: [{ scale: soundPop }] }]}>
          <Ionicons name="megaphone" size={18} color="#1D3557" />
          <Text style={styles.animalSoundText}>{activeAnimal.sound}</Text>
        </Animated.View>
        <View style={styles.animalHabitatPill}>
          <Text style={styles.animalHabitatText}>Habitat: {activeAnimal.habitat}</Text>
        </View>
        <Text style={styles.animalHeroFact}>{activeAnimal.fact}</Text>
      </View>

      {/* Animals Grid */}
      <Text style={[styles.subhead, { color: colors.textSecondary }]}>Tap an animal friend to hear their sound:</Text>
      <View style={styles.animalsGrid}>
        {ANIMALS_DATA.map((animal) => {
          const isSelected = animal.name === activeAnimal.name;
          return (
            <TouchableOpacity
              key={animal.name}
              onPress={() => handleSelectAnimal(animal)}
              style={[
                styles.animalTile,
                {
                  backgroundColor: animal.tint,
                  borderColor: isSelected ? '#1D3557' : 'transparent',
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                },
              ]}
            >
              <Text style={styles.animalTileEmoji}>{animal.emoji}</Text>
              <Text style={styles.animalTileName} numberOfLines={1}>{animal.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// Main Kids Education / Learn Hub Component
// -------------------------------------------------------------
export const KidsLearnHub: React.FC = () => {
  const { colors } = useApp();
  const [currentModule, setCurrentModule] = useState<LearnModule>('menu');
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (currentModule === 'abc') {
    return <AbcPhonicsModule onBack={() => setCurrentModule('menu')} />;
  }
  if (currentModule === 'numbers') {
    return <NumbersCountingModule onBack={() => setCurrentModule('menu')} />;
  }
  if (currentModule === 'shapes') {
    return <ShapesColorsModule onBack={() => setCurrentModule('menu')} />;
  }
  if (currentModule === 'animals') {
    return <AnimalsSafariModule onBack={() => setCurrentModule('menu')} />;
  }

  return (
    <View style={styles.hubContainer}>
      <View style={styles.learnHeaderBanner}>
        <WiseOwl size={88} waving />
        <Text style={[styles.hubTitle, { color: colors.textPrimary }]}>WiseToons Learn & Play</Text>
        <Text style={[styles.hubSubtitle, { color: colors.textSecondary }]}>
          Discover letters, numbers, colors, and animal friends! 🦉🎓✨
        </Text>
      </View>

      <View style={[styles.modulesMenuGrid, isTablet && styles.modulesMenuGridTablet]}>
        {/* Module 1: ABC Phonics */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentModule('abc')}
          style={[styles.learnCard, { backgroundColor: '#FFD1DC', borderColor: '#FF6B8B' }]}
        >
          <View style={styles.learnCardLeft}>
            <View style={styles.learnCardIconCircle}>
              <Text style={styles.learnCardIconEmoji}>🔤</Text>
            </View>
          </View>
          <View style={styles.learnCardBody}>
            <Text style={styles.learnCardTitle}>ABC & Phonics</Text>
            <Text style={styles.learnCardDesc}>
              Explore letters A to Z with colorful words, animal pictures, and phonic sounds!
            </Text>
          </View>
          <View style={styles.learnCardArrow}>
            <Ionicons name="arrow-forward" size={22} color="#1D3557" />
          </View>
        </TouchableOpacity>

        {/* Module 2: 123 Numbers & Counting */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentModule('numbers')}
          style={[styles.learnCard, { backgroundColor: '#FFE082', borderColor: '#FFA502' }]}
        >
          <View style={styles.learnCardLeft}>
            <View style={styles.learnCardIconCircle}>
              <Text style={styles.learnCardIconEmoji}>🔢</Text>
            </View>
          </View>
          <View style={styles.learnCardBody}>
            <Text style={styles.learnCardTitle}>1-2-3 Counting</Text>
            <Text style={styles.learnCardDesc}>
              Tap, count, and pop stars, apples, and owls from 1 to 10 with celebration cheers!
            </Text>
          </View>
          <View style={styles.learnCardArrow}>
            <Ionicons name="arrow-forward" size={22} color="#1D3557" />
          </View>
        </TouchableOpacity>

        {/* Module 3: Shapes & Colors */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentModule('shapes')}
          style={[styles.learnCard, { backgroundColor: '#C8F7DC', borderColor: '#2ED573' }]}
        >
          <View style={styles.learnCardLeft}>
            <View style={styles.learnCardIconCircle}>
              <Text style={styles.learnCardIconEmoji}>🎨</Text>
            </View>
          </View>
          <View style={styles.learnCardBody}>
            <Text style={styles.learnCardTitle}>Shapes & Colors</Text>
            <Text style={styles.learnCardDesc}>
              Learn circles, stars, hearts, and triangles with vibrant colors and fun facts!
            </Text>
          </View>
          <View style={styles.learnCardArrow}>
            <Ionicons name="arrow-forward" size={22} color="#1D3557" />
          </View>
        </TouchableOpacity>

        {/* Module 4: Animal Safari */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setCurrentModule('animals')}
          style={[styles.learnCard, { backgroundColor: '#B8E8FC', borderColor: '#1E90FF' }]}
        >
          <View style={styles.learnCardLeft}>
            <View style={styles.learnCardIconCircle}>
              <Text style={styles.learnCardIconEmoji}>🦁</Text>
            </View>
          </View>
          <View style={styles.learnCardBody}>
            <Text style={styles.learnCardTitle}>Animal Friends</Text>
            <Text style={styles.learnCardDesc}>
              Meet wise owls, lions, elephants, and playful dolphins. Hear their sounds and habitats!
            </Text>
          </View>
          <View style={styles.learnCardArrow}>
            <Ionicons name="arrow-forward" size={22} color="#1D3557" />
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
  learnHeaderBanner: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  hubTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 26,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  hubSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 380,
  },
  modulesMenuGrid: {
    width: '100%',
    maxWidth: 620,
    gap: SPACING.md,
  },
  modulesMenuGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  learnCardLeft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnCardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnCardIconEmoji: {
    fontSize: 28,
  },
  learnCardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  learnCardTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 19,
    color: '#1D3557',
  },
  learnCardDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: '#2B2D5C',
    opacity: 0.85,
    marginTop: 3,
  },
  learnCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // In-Module Navigation & Headers
  moduleWrap: {
    width: '100%',
    paddingBottom: SPACING.xl,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: '#4A90E2',
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  moduleHeaderTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 20,
  },
  subhead: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    marginVertical: SPACING.sm,
  },

  // ABC Module
  heroLetterCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroLetterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroBigLetter: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 54,
  },
  heroEmoji: {
    fontSize: 54,
  },
  heroWord: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 26,
    marginTop: 4,
  },
  phonicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginTop: 8,
  },
  phonicText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  heroNavRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  heroNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
  },
  heroNavText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
  },
  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  alphabetTile: {
    width: 50,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabetTileLetter: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
  },
  alphabetTileEmoji: {
    fontSize: 14,
    marginTop: 1,
  },

  // Numbers Module
  numberPickerRow: {
    gap: 8,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  numberPickerTile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPickerText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
  },
  countingField: {
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  countingInstruction: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
    textAlign: 'center',
  },
  countingProgress: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    marginVertical: SPACING.xs,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
    maxWidth: 320,
  },
  countItemBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countItemEmoji: {
    fontSize: 30,
  },
  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1D3557',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  celebrationWrap: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  celebrationText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  nextCountBtn: {
    backgroundColor: '#FF9F45',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    marginTop: 10,
  },
  nextCountBtnText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // Shapes Module
  shapeHeroCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  shapeHeroEmoji: {
    fontSize: 64,
  },
  shapeHeroName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    marginTop: 4,
  },
  shapeBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  shapeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  shapeBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  shapeHeroFact: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 320,
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  shapeTile: {
    width: '45%',
    maxWidth: 160,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    padding: SPACING.md,
    alignItems: 'center',
  },
  shapeTileEmoji: {
    fontSize: 36,
  },
  shapeTileName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
    marginTop: 4,
  },

  // Animals Module
  animalHeroCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  animalHeroEmoji: {
    fontSize: 64,
  },
  animalHeroName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    color: '#1D3557',
    marginTop: 4,
  },
  animalSoundBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginVertical: 8,
  },
  animalSoundText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
    color: '#1D3557',
  },
  animalHabitatPill: {
    backgroundColor: 'rgba(29, 53, 87, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 6,
  },
  animalHabitatText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#1D3557',
  },
  animalHeroFact: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: '#1D3557',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 19,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  animalTile: {
    width: 68,
    height: 74,
    borderRadius: RADIUS.md,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  animalTileEmoji: {
    fontSize: 30,
  },
  animalTileName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    color: '#1D3557',
    marginTop: 2,
  },
});

