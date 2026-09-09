import { requireNativeViewManager, requireOptionalNativeModule } from 'expo-modules-core';
import type * as React from 'react';
import { Platform, type ViewProps } from 'react-native';

export type AdLoadedEvent = { width: number; height: number };
export type AdFailedToLoadEvent = { code: string; message: string };

export type AdMobNextBannerProps = ViewProps & {
  adUnitId: string;
  onAdLoaded?: (event: { nativeEvent: AdLoadedEvent }) => void;
  onAdFailedToLoad?: (event: { nativeEvent: AdFailedToLoadEvent }) => void;
};

type AdMobNextNativeModule = {
  initialize(appId: string): Promise<boolean>;
  getAdaptiveBannerHeight(widthDp: number): number;
};

// Google only ships the next-gen SDK for Android, so the native side exists
// there alone. `requireOptional...` also covers a dev client built before this
// module was added: every export below then degrades to a no-op.
const nativeModule =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<AdMobNextNativeModule>('AdMobNext')
    : null;

export const isAdMobAvailable = nativeModule !== null;

export const AdMobNextBannerView: React.ComponentType<AdMobNextBannerProps> | null =
  nativeModule !== null ? requireNativeViewManager('AdMobNext') : null;

/** Must run before any ad loads; the SDK does this off the main thread. */
export function initialize(appId: string): Promise<boolean> {
  return nativeModule ? nativeModule.initialize(appId) : Promise.resolve(false);
}

/** Height in dp of an anchored adaptive banner filling `widthDp`. */
export function getAdaptiveBannerHeight(widthDp: number): number {
  return nativeModule ? nativeModule.getAdaptiveBannerHeight(widthDp) : 0;
}
