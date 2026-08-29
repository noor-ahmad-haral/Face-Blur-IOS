import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { BlurRegion, EffectSettings } from '../navigation/types';
import { blurRadiusFor, pixelCellFor } from '../navigation/types';

// How far each mosaic block magnifies the photo. The block then shows a
// 1/PIXEL_ZOOM sliver of the image, which reads as a single flat colour.
const PIXEL_ZOOM = 25;

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

  if (settings.kind === 'pixelate') {
    return (
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        {mosaic(region, settings, imageUri, dispW, dispH, boxW, boxH)}
      </View>
    );
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

// Builds the grid of flat blocks for the pixelate effect.
//
// RN exposes no nearest-neighbour scaling, so a downscale/upscale round-trip
// would come back bilinear-smoothed — a blur, not a mosaic. Instead each block
// magnifies the photo by PIXEL_ZOOM about that block's own centre point and
// clips to the block, so the block shows a sliver too small to vary: one flat
// colour. A light blur first makes that colour the block's local average rather
// than one arbitrary pixel.
//
// The magnification is a transform, not a layout size, so the Image still lays
// out at photo size and Fresco keeps decoding it small — the same decode the
// blur effect above already pays for.
function mosaic(
  region: BlurRegion,
  settings: EffectSettings,
  imageUri: string,
  dispW: number,
  dispH: number,
  boxW: number,
  boxH: number
) {
  const cell = pixelCellFor(settings.pixelSize, Math.min(boxW, boxH));
  const cols = Math.max(1, Math.ceil(boxW / cell));
  const rows = Math.max(1, Math.ceil(boxH / cell));
  const blur = Math.max(2, Math.min(40, Math.round(cell * 0.5)));
  const originX = region.x * dispW;
  const originY = region.y * dispH;

  const blocks = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Centre of this block in photo-display coordinates.
      const cx = originX + col * cell + cell / 2;
      const cy = originY + row * cell + cell / 2;
      blocks.push(
        <View
          key={`${col}-${row}`}
          style={{
            position: 'absolute',
            left: col * cell,
            top: row * cell,
            width: cell,
            height: cell,
            overflow: 'hidden',
          }}
        >
          <Image
            source={{ uri: imageUri }}
            blurRadius={blur}
            style={{
              position: 'absolute',
              width: dispW,
              height: dispH,
              // Scaling happens about the view's own centre, so offset by where
              // that centre lands to park (cx, cy) at the middle of the block.
              left: cell / 2 - dispW / 2 - PIXEL_ZOOM * (cx - dispW / 2),
              top: cell / 2 - dispH / 2 - PIXEL_ZOOM * (cy - dispH / 2),
              transform: [{ scale: PIXEL_ZOOM }],
            }}
          />
        </View>
      );
    }
  }
  return blocks;
}

const styles = StyleSheet.create({
  mockBlur: { backgroundColor: 'rgba(14,19,24,0.75)' },
});
