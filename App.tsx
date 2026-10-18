// App.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootStackParamList } from './src/navigation/types';
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeHubScreen } from './src/screens/HomeHubScreen';
import { VideoTheaterScreen } from './src/screens/VideoTheaterScreen';
import { LocalFavoritesScreen } from './src/screens/LocalFavoritesScreen';
import { ParentDashboardScreen } from './src/screens/ParentDashboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Root: React.FC = () => {
  const { mode } = useApp();
  return (
    <>
      <StatusBar style={mode === 'day' ? 'dark' : 'light'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="HomeHub" component={HomeHubScreen} />
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
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F4FE' }}>
        <ActivityIndicator color="#FFD166" size="large" />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
