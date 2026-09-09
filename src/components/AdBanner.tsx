import React, { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import {
  AdMobNextBannerView,
  getAdaptiveBannerHeight,
  isAdMobAvailable,
} from '../../modules/admob-next';
import { BANNER_AD_UNIT_ID } from '../ads/config';

// Standard banner height, used if the SDK cannot tell us the adaptive one.
const FALLBACK_HEIGHT = 50;

type Props = { style?: StyleProp<ViewStyle> };

/**
 * Anchored adaptive banner. The slot is sized up front from the SDK's own
 * measurement so filling the ad never shifts the layout, and the whole thing
 * collapses to nothing when there is no ad to show.
 */
export default function AdBanner({ style }: Props) {
  const { width } = useWindowDimensions();
  const [failed, setFailed] = useState(false);

  const height = useMemo(() => {
    if (!isAdMobAvailable) return FALLBACK_HEIGHT;
    try {
      return getAdaptiveBannerHeight(Math.round(width)) || FALLBACK_HEIGHT;
    } catch {
      return FALLBACK_HEIGHT;
    }
  }, [width]);

  if (!AdMobNextBannerView || failed) return null;

  return (
    <View style={[styles.wrap, { height }, style]}>
      <AdMobNextBannerView
        adUnitId={BANNER_AD_UNIT_ID}
        style={StyleSheet.absoluteFill}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden' },
});
