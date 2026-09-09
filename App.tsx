import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/i18n';
import { initialize as initializeAds } from './modules/admob-next';
import { ADMOB_APP_ID } from './src/ads/config';

export default function App() {
  // The next-gen SDK must be initialised before any ad loads. It resolves off
  // the main thread natively, so this never blocks the first render.
  useEffect(() => {
    initializeAds(ADMOB_APP_ID).catch(() => {
      // Without the SDK the banners simply never fill; the app is unaffected.
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LanguageProvider>
        <RootNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
