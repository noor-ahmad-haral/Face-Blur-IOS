import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditorScreen from '../screens/EditorScreen';
import CropScreen from '../screens/CropScreen';
import EffectsScreen from '../screens/EffectsScreen';
import SavedFilesScreen from '../screens/SavedFilesScreen';
import { colors } from '../theme/colors';
import { hasSeenOnboarding } from '../lib/onboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.ink },
};

export default function RootNavigator() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setSeen);
  }, []);

  // initialRouteName is only read when the navigator first mounts, so hold on a
  // blank ink screen until the flag resolves rather than mounting Home and
  // pushing the intro over it (which would flash for returning users).
  if (seen === null) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={seen ? 'Home' : 'Onboarding'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
        <Stack.Screen name="Crop" component={CropScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="Effects"
          component={EffectsScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="SavedFiles" component={SavedFilesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
