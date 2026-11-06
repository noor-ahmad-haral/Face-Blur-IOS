import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { LockIcon } from './icons';

const CARD_W = 252;
const CARD_H = 200;

// Head, hair and shoulders — enough shape to read as a person in a photo
// rather than the flat silhouette used for mock tiles.
function Person({ size, skin, hair, shirt }: { size: number; skin: string; hair: string; shirt: string }) {
  const head = size * 0.52;
  const headLeft = (size - head) / 2;
  const headTop = size * 0.12;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.02,
          top: size * 0.62,
          width: size * 0.96,
          height: size * 0.5,
          borderTopLeftRadius: size * 0.48,
          borderTopRightRadius: size * 0.48,
          backgroundColor: shirt,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: headLeft,
          top: headTop,
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: skin,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: headLeft,
          top: headTop,
          width: head,
          height: head * 0.4,
          borderTopLeftRadius: head / 2,
          borderTopRightRadius: head / 2,
          backgroundColor: hair,
        }}
      />
    </View>
  );
}

// Four L-shaped corners, echoing the detector's selection box in the editor.
function DetectFrame({ size }: { size: number }) {
  const arm = size * 0.3;
  const corners = [
    { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 4 },
    { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 4 },
    { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 4 },
    { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },
  ];
  return (
    <View style={{ position: 'absolute', width: size, height: size }}>
      {corners.map((c, i) => (
        <View key={i} style={[{ position: 'absolute', width: arm, height: arm, borderColor: colors.peri }, c]} />
      ))}
    </View>
  );
}

function Badge({ n, style }: { n: number; style?: any }) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{n}</Text>
    </View>
  );
}

// Page 1: a photo holding two faces — one still framed by the detector, one
// already covered by a mosaic. The whole promise of the app in one image.
//
// Both figures share one size and baseline, and the frame and the mosaic are
// positioned from the same head geometry as the figures themselves, so the two
// sides line up exactly instead of being eyeballed.
const PERSON = 104;
const PERSON_TOP = 86;
const SIDE_INSET = 14;
const HEAD = PERSON * 0.52;
const HEAD_TOP = PERSON_TOP + PERSON * 0.12;
const HEAD_LEFT_X = SIDE_INSET + PERSON * 0.24;
const HEAD_RIGHT_X = CARD_W - SIDE_INSET - PERSON + PERSON * 0.24;

export function DetectArt() {
  return (
    <View style={styles.card}>
      <LinearGradient colors={['#5c6674', '#333b47', '#262d38']} style={StyleSheet.absoluteFill} />

      <View style={{ position: 'absolute', left: SIDE_INSET, top: PERSON_TOP }}>
        <Person size={PERSON} skin="#c99f7d" hair="#3c332b" shirt="#8b93a3" />
      </View>
      <View style={{ position: 'absolute', left: CARD_W - SIDE_INSET - PERSON, top: PERSON_TOP }}>
        <Person size={PERSON} skin="#d9b391" hair="#4a4038" shirt="#6f7787" />
      </View>

      <View style={{ position: 'absolute', left: HEAD_LEFT_X, top: HEAD_TOP }}>
        <DetectFrame size={HEAD} />
        <Badge n={1} style={{ left: HEAD - 9, top: -9 }} />
      </View>

      <View style={{ position: 'absolute', left: HEAD_RIGHT_X, top: HEAD_TOP }}>
        {/* Android needs blurMethod, or BlurView quietly degrades
            to a plain translucent view and the face stays readable. */}
        <BlurView
          intensity={85}
          tint="default"
          blurMethod="dimezisBlurView"
          style={{ width: HEAD, height: HEAD, borderRadius: 4, overflow: 'hidden' }}
        />
        <Badge n={2} style={{ left: HEAD - 9, top: -9 }} />
      </View>
    </View>
  );
}

// Page 2: the app's lock mark on a soft halo.
export function PrivacyArt() {
  return (
    <View style={styles.privacy}>
      <View style={styles.halo} />
      <LockIcon peri={colors.peri} blue={colors.blue} onBtn={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    backgroundColor: colors.frame,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.onBtn, fontWeight: '700', fontSize: 11 },
  privacy: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#161d27',
  },
});
