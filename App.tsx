// App.tsx
import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootStackParamList } from './src/navigation/types';
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeHubScreen } from './src/screens/HomeHubScreen';
import { VideoTheaterScreen } from './src/screens/VideoTheaterScreen';
import { LocalFavoritesScreen } from './src/screens/LocalFavoritesScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';
import { initializeAdMob } from './src/services/adService';

// Prevent native splash screen from auto-hiding until React is ready
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync('#EAF2FF').catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

const Root: React.FC = () => {
  const { mode, colors } = useApp();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.cardBorder,
      },
    }),
    [colors]
  );

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    initializeAdMob().catch(() => {});
  }, [colors.background]);

  return (
    <>
      <StatusBar style={mode === 'day' ? 'dark' : 'light'} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.background },
            gestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="HomeHub"
            component={HomeHubScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen name="VideoTheater" component={VideoTheaterScreen} />
          <Stack.Screen name="LocalFavorites" component={LocalFavoritesScreen} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({ Fredoka_600SemiBold, Fredoka_700Bold });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#EAF2FF' }} />;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#EAF2FF' }}>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
