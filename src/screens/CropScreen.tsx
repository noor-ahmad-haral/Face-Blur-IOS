import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import EditorTopBar from '../components/EditorTopBar';
import PhotoBackdrop from '../components/PhotoBackdrop';
import PillButton from '../components/PillButton';
import { CheckMark } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Crop'>;

type Box = { x: number; y: number; w: number; h: number };
const MIN_SIZE = 70;

type Corner = 'tl' | 'tr' | 'bl' | 'br';

export default function CropScreen({ navigation, route }: Props) {
  const { photoUri, mock, onConfirm } = route.params;
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const [box, setBox] = useState<Box>({ x: 40, y: 80, w: 220, h: 180 });
  const boxRef = useRef(box);
  boxRef.current = box;
  const panelRef = useRef(panelSize);
  panelRef.current = panelSize;

  function onPanelLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setPanelSize({ width, height });
    setBox((b) => ({
      x: Math.min(b.x, Math.max(0, width - b.w)),
      y: Math.min(b.y, Math.max(0, height - b.h)),
      w: Math.min(b.w, width),
      h: Math.min(b.h, height),
    }));
  }

  // Snapshot the box at gesture start so per-move deltas (which are cumulative
  // from gesture start) are applied relative to a fixed origin, not the
  // continuously-updating state.
  const dragStart = useRef<Box>(box);

  const movePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = boxRef.current;
        },
        onPanResponderMove: (_, g) => {
          const start = dragStart.current;
          const panel = panelRef.current;
          const x = clamp(start.x + g.dx, 0, panel.width - start.w);
          const y = clamp(start.y + g.dy, 0, panel.height - start.h);
          setBox({ ...start, x, y });
        },
      }),
    []
  );

  function makeHandlePan(corner: Corner) {
    return PanResponder.create({
      onPanResponderGrant: () => {
        dragStart.current = boxRef.current;
      },
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const s = dragStart.current;
        const panel = panelRef.current;
        let { x, y, w, h } = s;
        if (corner === 'tl') {
          x = clamp(s.x + g.dx, 0, s.x + s.w - MIN_SIZE);
          y = clamp(s.y + g.dy, 0, s.y + s.h - MIN_SIZE);
          w = s.x + s.w - x;
          h = s.y + s.h - y;
        } else if (corner === 'tr') {
          y = clamp(s.y + g.dy, 0, s.y + s.h - MIN_SIZE);
          w = clamp(s.w + g.dx, MIN_SIZE, panel.width - s.x);
          h = s.y + s.h - y;
        } else if (corner === 'bl') {
          x = clamp(s.x + g.dx, 0, s.x + s.w - MIN_SIZE);
          w = s.x + s.w - x;
          h = clamp(s.h + g.dy, MIN_SIZE, panel.height - s.y);
        } else {
          w = clamp(s.w + g.dx, MIN_SIZE, panel.width - s.x);
          h = clamp(s.h + g.dy, MIN_SIZE, panel.height - s.y);
        }
        setBox({ x, y, w, h });
      },
    });
  }

  const handlePans = useMemo(
    () => ({
      tl: makeHandlePan('tl'),
      tr: makeHandlePan('tr'),
      bl: makeHandlePan('bl'),
      br: makeHandlePan('br'),
    }),
    []
  );

  function confirm() {
    const panel = panelRef.current;
    if (panel.width > 0 && panel.height > 0) {
      onConfirm({
        id: `custom-${Date.now()}`,
        x: box.x / panel.width,
        y: box.y / panel.height,
        w: box.w / panel.width,
        h: box.h / panel.height,
        tone: '#c9853a',
        blurred: true,
        kind: 'custom',
      });
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title="Crop" left onBack={() => navigation.goBack()} />

      <View style={styles.panel} onLayout={onPanelLayout}>
        <PhotoBackdrop photoUri={photoUri} mock={mock} />

        {panelSize.width > 0 && (
          <>
            <View pointerEvents="none" style={[styles.dim, { top: 0, left: 0, right: 0, height: box.y }]} />
            <View pointerEvents="none" style={[styles.dim, { top: box.y + box.h, left: 0, right: 0, bottom: 0 }]} />
            <View pointerEvents="none" style={[styles.dim, { top: box.y, left: 0, width: box.x, height: box.h }]} />
            <View
              pointerEvents="none"
              style={[styles.dim, { top: box.y, left: box.x + box.w, right: 0, height: box.h }]}
            />

            <View
              {...movePan.panHandlers}
              style={[styles.selection, { left: box.x, top: box.y, width: box.w, height: box.h }]}
            >
              <View style={[styles.gridLine, styles.gridV, { left: '33.33%' }]} />
              <View style={[styles.gridLine, styles.gridV, { left: '66.66%' }]} />
              <View style={[styles.gridLine, styles.gridH, { top: '33.33%' }]} />
              <View style={[styles.gridLine, styles.gridH, { top: '66.66%' }]} />

              <View {...handlePans.tl.panHandlers} style={[styles.handle, styles.handleTL]} />
              <View {...handlePans.tr.panHandlers} style={[styles.handle, styles.handleTR]} />
              <View {...handlePans.bl.panHandlers} style={[styles.handle, styles.handleBL]} />
              <View {...handlePans.br.panHandlers} style={[styles.handle, styles.handleBR]} />
            </View>
          </>
        )}
      </View>

      <View style={styles.bottomBar}>
        <PillButton label="Cancel" outline textColor={colors.peri} onPress={() => navigation.goBack()} />
        <PillButton label="Confirm" icon={<CheckMark />} bg={colors.blue} onPress={confirm} />
      </View>
    </SafeAreaView>
  );
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
    overflow: 'hidden',
  },
  dim: { position: 'absolute', backgroundColor: 'rgba(14,19,24,0.45)' },
  selection: { position: 'absolute' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.5)' },
  gridV: { top: 0, bottom: 0, width: 1 },
  gridH: { left: 0, right: 0, height: 1 },
  handle: { position: 'absolute', width: 28, height: 28 },
  handleTL: { left: -14, top: -14, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#fff' },
  handleTR: { right: -14, top: -14, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#fff' },
  handleBL: { left: -14, bottom: -14, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#fff' },
  handleBR: { right: -14, bottom: -14, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#fff' },
  bottomBar: {
    height: 58,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
