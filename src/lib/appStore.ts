import { Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';

/**
 * The app's App Store page, read from `ios.appStoreUrl` in app.json
 * (e.g. https://apps.apple.com/app/id1234567890). Null until that is set.
 */
export const APP_STORE_URL = StoreReview.storeUrl();

/**
 * Apple's native rating prompt. iOS alone decides whether it actually appears
 * (at most three times a year, and never in TestFlight builds), so it is safe
 * to call after a moment of success. Apple does not allow custom rating
 * prompts or filtering users by rating before sending them to the store.
 */
export async function requestReviewSoftly(): Promise<void> {
  try {
    if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
  } catch {
    // Never let a review prompt break the flow it was attached to.
  }
}

/**
 * For an explicit "Rate Us" tap: open the App Store's write-a-review page,
 * which always responds, unlike the throttled native prompt.
 */
export async function openWriteReview(): Promise<void> {
  if (APP_STORE_URL) {
    await Linking.openURL(`${APP_STORE_URL}?action=write-review`);
  } else {
    await requestReviewSoftly();
  }
}
