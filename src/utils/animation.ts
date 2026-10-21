// src/utils/animation.ts
import { Platform } from 'react-native';

/**
 * On Web, react-native-web lacks the native animation driver (RCTAnimation) and logs
 * console warnings when `useNativeDriver: true` is passed.
 * On native iOS and Android runtimes, `useNativeDriver: true` offloads animations
 * to the native UI thread for fluid 60fps performance.
 */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';

