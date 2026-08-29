import React, { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { colors } from '../theme/colors';

const TRACK_H = 6;
const THUMB_W = 5;
const THUMB_H = 30;

// Pure-JS slider: keeps the app free of an extra native module, so no new
// dev build is needed to pick up the effects panel.
export default function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const startX = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function onLayout(e: LayoutChangeEvent) {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  }

  function emitFor(x: number) {
    const w = widthRef.current;
    if (w <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / w));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChangeRef.current(Math.max(min, Math.min(max, snapped)));
  }

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          startX.current = e.nativeEvent.locationX;
          emitFor(startX.current);
        },
        onPanResponderMove: (_, g) => emitFor(startX.current + g.dx),
      }),
    []
  );

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const fill = width * ratio;

  return (
    <View style={styles.hit} onLayout={onLayout} {...pan.panHandlers}>
      <View style={styles.track} />
      <View style={[styles.fill, { width: fill }]} />
      {/* End cap dot, matching the reference panel. */}
      <View style={styles.endDot} />
      <View style={[styles.thumb, { left: fill - THUMB_W / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { height: 40, justifyContent: 'center' },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.card,
  },
  fill: {
    position: 'absolute',
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.peri,
  },
  endDot: {
    position: 'absolute',
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.blue,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: THUMB_W,
    backgroundColor: colors.peri,
  },
});
