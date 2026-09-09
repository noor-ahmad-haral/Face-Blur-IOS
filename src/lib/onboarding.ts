import AsyncStorage from '@react-native-async-storage/async-storage';

// Bumping the suffix re-runs onboarding for everyone, which is what we want if
// the intro is ever rewritten to cover new features.
const SEEN_KEY = 'blurface.onboarding.seen.v1';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SEEN_KEY)) === 'true';
  } catch {
    // Storage is best-effort. Showing the intro twice is a far smaller failure
    // than blocking the app behind a storage error, so fail open.
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_KEY, 'true');
  } catch {
    // Ignored: the user still gets through, they just see the intro again.
  }
}
