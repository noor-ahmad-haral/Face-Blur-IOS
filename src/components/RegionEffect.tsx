import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { BlurRegion, EffectSettings } from '../navigation/types';
import { blurRadiusFor } from '../navigation/types';

// Renders the cover-up for a single region. Fills its parent, which is the
// positioned/sized box for that region, so both the on-screen editor and the
// off-screen capture view stay pixel-identical.
export default function RegionEffect({
  region,
  settings,
  imageUri,
  dispW,
  dispH,
}: {
  region: BlurRegion;
  settings: EffectSettings;
  imageUri?: string;
  dispW: number;
  dispH: number;
}) {
  const boxW = region.w * dispW;
  const boxH = region.h * dispH;

  if (settings.kind === 'emoji') {
    // Glyph height to aim for, so the emoji covers the face box.
    const size = Math.min(boxW, boxH) * 1.02;
    // An emoji's advance width runs ~1.2x its font size, so laying the Text out
    // inside the face box clips the glyph's right edge. Centre it in a box with
    // slack on every side instead, and let the Text size itself naturally —
    // forcing a lineHeight clips it vertically for the same reason.
    const slack = size * 2;
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: (boxW - slack) / 2,
          top: (boxH - slack) / 2,
          width: slack,
          height: slack,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          numberOfLines={1}
          style={{ fontSize: size, textAlign: 'center', includeFontPadding: false }}
        >
          {settings.emoji}
        </Text>
      </View>
    );
  }

  // '50%' yields a true ellipse (RN >= 0.76); rectangles keep a slight rounding.
  const radius: number | string = settings.shape === 'oval' ? '50%' : 4;

  if (!imageUri) {
    // Mock tiles have no backing image — fall back to a flat scrim.
    return <View style={[StyleSheet.absoluteFill, styles.mockBlur, { borderRadius: radius }]} />;
  }

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      {/* A blurred copy of the whole photo, shifted so only this face shows
          through the region window — aligns perfectly with the sharp image
          underneath and blurs reliably on Android. */}
      <Image
        source={{ uri: imageUri }}
        blurRadius={blurRadiusFor(settings.intensity)}
        style={{
          position: 'absolute',
          width: dispW,
          height: dispH,
          left: -region.x * dispW,
          top: -region.y * dispH,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mockBlur: { backgroundColor: 'rgba(14,19,24,0.75)' },
});
