import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import EditorTopBar from '../components/EditorTopBar';
import PhotoBackdrop from '../components/PhotoBackdrop';
import PillButton from '../components/PillButton';
import { CheckMark } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Crop'>;

type Box = { x: number; y: number; w: number; h: number };
type Rect = { left: number; top: number; width: number; height: number };
type Mode = 'move' | 'tl' | 'tr' | 'bl' | 'br' | null;

// Small enough to fit a number plate or a name tag snugly.
const MIN_SIZE = 16;
// Margin around the photo. The touch layer extends this far past the photo on
// every side so corners sitting on the photo's edge can still be grabbed.
const PANEL_PAD = 24;
// How far (px) OUTSIDE the box a touch still grabs the nearest corner.
const CORNER_REACH_OUT = 30;
// How far INSIDE the box a touch grabs a corner, on a box big enough to spare it.
const CORNER_REACH_IN = 22;
const BRACKET = 24;
// Below this size the thirds grid is just clutter.
const GRID_MIN = 48;

export default function CropScreen({ navigation, route }: Props) {
  const { photoUri, mock, aspect } = route.params;
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  // Where the photo is drawn inside the panel: aspect-fit exactly like the
  // Editor preview. The selection is kept relative to this rect, so the
  // fractions handed back land on the same pixels in the Editor.
  const [photoRect, setPhotoRect] = useState<Rect | null>(null);
  const rectRef = useRef<Rect | null>(null);
  // Live selection, written by the SelectionLayer as the user drags. Kept in a
  // ref so dragging never re-renders this screen (photo, buttons, …).
  const boxRef = useRef<Box>({ x: 0, y: 0, w: 0, h: 0 });

  function onPanelLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    const availW = width - PANEL_PAD * 2;
    const availH = height - PANEL_PAD * 2;
    if (availW <= 0 || availH <= 0) return;
    const a = aspect > 0 ? aspect : availW / availH;
    let w = availW;
    let h = availW / a;
    if (h > availH) {
      h = availH;
      w = availH * a;
    }
    const rect = { left: (width - w) / 2, top: (height - h) / 2, width: w, height: h };
    const prev = rectRef.current;
    if (!prev) {
      const side = Math.min(w, h) * 0.5;
      boxRef.current = { x: (w - side) / 2, y: (h - side) / 2, w: side, h: side };
    } else {
      // Rotation / resize: keep the same relative selection.
      const b = boxRef.current;
      const sx = w / prev.width;
      const sy = h / prev.height;
      boxRef.current = { x: b.x * sx, y: b.y * sy, w: b.w * sx, h: b.h * sy };
    }
    rectRef.current = rect;
    setPhotoRect(rect);
  }

  function confirm() {
    const r = rectRef.current;
    const b = boxRef.current;
    if (!r || r.width === 0 || r.height === 0) {
      navigation.goBack();
      return;
    }
    // Merge only customRegion: re-sending photoUri would change the Editor's
    // photo param and re-run face detection, wiping the user's edits.
    navigation.popTo(
      'Editor',
      {
        customRegion: {
          id: `custom-${Date.now()}`,
          x: b.x / r.width,
          y: b.y / r.height,
          w: b.w / r.width,
          h: b.h / r.height,
          tone: '#c9853a',
          blurred: true,
          kind: 'custom',
        },
      },
      { merge: true }
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title={t.crop.title} left onBack={() => navigation.goBack()} />

      <View style={styles.panel} onLayout={onPanelLayout}>
        {photoRect && (
          <>
            <View style={[styles.photo, photoRect]}>
              <PhotoBackdrop photoUri={photoUri} mock={mock} />
            </View>
            {/* Remount on size change so the layer picks up the rescaled box. */}
            <SelectionLayer
              key={`${photoRect.width}x${photoRect.height}`}
              rect={photoRect}
              boxRef={boxRef}
            />
          </>
        )}
      </View>

      <View style={[styles.bottomBar, { marginBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <PillButton label={t.common.cancel} outline textColor={colors.peri} onPress={() => navigation.goBack()} />
        <PillButton
          label={t.common.confirm}
          icon={<CheckMark color={colors.onBlue} />}
          bg={colors.blue}
          textColor={colors.onBlue}
          onPress={confirm}
        />
      </View>
    </SafeAreaView>
  );
}

// Dim overlay + selection box + one touch surface.
//
// The touch surface is a single view that never moves, and finger positions
// are read relative to it (locationX/Y). Earlier versions attached responders
// to the box itself — a view that moves under the finger — which let the box
// drift ahead of the touch. Here the box is purely visual (pointerEvents none),
// so the finger-to-box mapping is always exactly 1:1.
function SelectionLayer({ rect, boxRef }: { rect: Rect; boxRef: React.MutableRefObject<Box> }) {
  const [box, setBoxState] = useState<Box>(boxRef.current);

  const pan = useMemo(() => {
    let mode: Mode = null;
    let start: Box = boxRef.current;
    let startX = 0;
    let startY = 0;

    const point = (e: GestureResponderEvent) => ({
      x: e.nativeEvent.locationX - PANEL_PAD,
      y: e.nativeEvent.locationY - PANEL_PAD,
    });

    const apply = (b: Box) => {
      boxRef.current = b;
      setBoxState(b);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const p = point(e);
        start = boxRef.current;
        startX = p.x;
        startY = p.y;
        mode = hitTest(start, p.x, p.y);
      },
      onPanResponderMove: (e) => {
        if (!mode) return;
        const p = point(e);
        const dx = p.x - startX;
        const dy = p.y - startY;
        const s = start;
        if (mode === 'move') {
          apply({
            ...s,
            x: clamp(s.x + dx, 0, rect.width - s.w),
            y: clamp(s.y + dy, 0, rect.height - s.h),
          });
          return;
        }
        const minW = Math.min(MIN_SIZE, rect.width);
        const minH = Math.min(MIN_SIZE, rect.height);
        const right = s.x + s.w;
        const bottom = s.y + s.h;
        let { x, y, w, h } = s;
        if (mode === 'tl' || mode === 'bl') {
          x = clamp(s.x + dx, 0, right - minW);
          w = right - x;
        } else {
          w = clamp(s.w + dx, minW, rect.width - s.x);
        }
        if (mode === 'tl' || mode === 'tr') {
          y = clamp(s.y + dy, 0, bottom - minH);
          h = bottom - y;
        } else {
          h = clamp(s.h + dy, minH, rect.height - s.y);
        }
        apply({ x, y, w, h });
      },
      onPanResponderRelease: () => {
        mode = null;
      },
      onPanResponderTerminate: () => {
        mode = null;
      },
    });
  }, [rect.width, rect.height]);

  const bracketSize = {
    width: Math.max(8, Math.min(BRACKET, box.w / 2)),
    height: Math.max(8, Math.min(BRACKET, box.h / 2)),
  };

  return (
    <View
      {...pan.panHandlers}
      style={[
        styles.touchLayer,
        {
          left: rect.left - PANEL_PAD,
          top: rect.top - PANEL_PAD,
          width: rect.width + PANEL_PAD * 2,
          height: rect.height + PANEL_PAD * 2,
        },
      ]}
    >
      {/* Everything below is visual only. */}
      <View pointerEvents="none" style={[styles.photoArea, { width: rect.width, height: rect.height }]}>
        <View style={[styles.dim, { top: 0, left: 0, right: 0, height: box.y }]} />
        <View style={[styles.dim, { top: box.y + box.h, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.dim, { top: box.y, left: 0, width: box.x, height: box.h }]} />
        <View style={[styles.dim, { top: box.y, left: box.x + box.w, right: 0, height: box.h }]} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.selection,
          { left: PANEL_PAD + box.x, top: PANEL_PAD + box.y, width: box.w, height: box.h },
        ]}
      >
        {box.w >= GRID_MIN && (
          <>
            <View style={[styles.gridLine, styles.gridV, { left: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridV, { left: '66.66%' }]} />
          </>
        )}
        {box.h >= GRID_MIN && (
          <>
            <View style={[styles.gridLine, styles.gridH, { top: '33.33%' }]} />
            <View style={[styles.gridLine, styles.gridH, { top: '66.66%' }]} />
          </>
        )}
        {/* Brackets shrink with the box so they never overlap on a small one. */}
        <View style={[styles.bracket, bracketSize, styles.bTL]} />
        <View style={[styles.bracket, bracketSize, styles.bTR]} />
        <View style={[styles.bracket, bracketSize, styles.bBL]} />
        <View style={[styles.bracket, bracketSize, styles.bBR]} />
      </View>
    </View>
  );
}

// Which part of the box a touch grabbed.
// - Inside the box: move, except right at a corner of a box big enough to
//   spare it. The inner corner reach shrinks with the box, so a tiny box (a
//   number plate) is always movable by touching it.
// - Just outside the box: resize from the nearest corner. This is how a tiny
//   box is resized: grab just past its corner.
function hitTest(b: Box, px: number, py: number): Mode {
  const inside = px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
  const reach = inside ? Math.min(CORNER_REACH_IN, Math.min(b.w, b.h) / 4) : CORNER_REACH_OUT;
  const corners: [Exclude<Mode, 'move' | null>, number, number][] = [
    ['tl', b.x, b.y],
    ['tr', b.x + b.w, b.y],
    ['bl', b.x, b.y + b.h],
    ['br', b.x + b.w, b.y + b.h],
  ];
  let best: Mode = null;
  let bestD = Infinity;
  for (const [m, cx, cy] of corners) {
    const d = Math.hypot(px - cx, py - cy);
    if (d <= reach && d < bestD) {
      best = m;
      bestD = d;
    }
  }
  if (best) return best;
  return inside ? 'move' : null;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  panel: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.frame,
  },
  photo: { position: 'absolute', borderRadius: 6, overflow: 'hidden' },
  touchLayer: { position: 'absolute' },
  photoArea: {
    position: 'absolute',
    left: PANEL_PAD,
    top: PANEL_PAD,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dim: { position: 'absolute', backgroundColor: 'rgba(14,19,24,0.55)' },
  selection: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.45)' },
  gridV: { top: 0, bottom: 0, width: 1 },
  gridH: { left: 0, right: 0, height: 1 },
  bracket: { position: 'absolute', borderColor: '#fff' },
  bTL: { left: -3, top: -3, borderTopWidth: 3, borderLeftWidth: 3 },
  bTR: { right: -3, top: -3, borderTopWidth: 3, borderRightWidth: 3 },
  bBL: { left: -3, bottom: -3, borderBottomWidth: 3, borderLeftWidth: 3 },
  bBR: { right: -3, bottom: -3, borderBottomWidth: 3, borderRightWidth: 3 },
  bottomBar: {
    height: 58,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
