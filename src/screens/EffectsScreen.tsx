import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, EffectSettings } from '../navigation/types';
import {
  DEFAULT_EFFECTS,
  EMOJI_CHOICES,
  MIN_INTENSITY,
  MAX_INTENSITY,
  MIN_PIXEL_SIZE,
  MAX_PIXEL_SIZE,
} from '../navigation/types';
import { colors } from '../theme/colors';
import Segmented from '../components/Segmented';
import Slider from '../components/Slider';
import PillButton from '../components/PillButton';
import { CheckMark } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Effects'>;

const SHEET_PAD = 22;
const EMOJI_COLS = 6;
const EMOJI_GAP = 10;

export default function EffectsScreen({ navigation, route }: Props) {
  const { onApply } = route.params;
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const [settings, setSettings] = useState<EffectSettings>(route.params.settings);

  // Size the chips to the screen so the grid always divides into whole rows of
  // EMOJI_COLS instead of wrapping raggedly on narrower devices.
  const chip = Math.floor((winW - SHEET_PAD * 2 - EMOJI_GAP * (EMOJI_COLS - 1)) / EMOJI_COLS);

  // Every change is pushed straight to the editor so the photo behind the
  // sheet previews the effect as it is adjusted.
  function update(patch: Partial<EffectSettings>) {
    // Derive `next` outside the updater: onApply sets state on the editor, and
    // updater functions run during React's render phase.
    const next = { ...settings, ...patch };
    setSettings(next);
    onApply(next);
  }

  function reset() {
    setSettings(DEFAULT_EFFECTS);
    onApply(DEFAULT_EFFECTS);
  }

  // Blur and pixelate share the shape control and the slider, but each keeps
  // its own amount: blur strength vs. mosaic block size.
  const isPixelate = settings.kind === 'pixelate';
  const noun = isPixelate ? 'Pixelate' : 'Blur';
  const amount = isPixelate ? settings.pixelSize : settings.intensity;
  const amountMin = isPixelate ? MIN_PIXEL_SIZE : MIN_INTENSITY;
  const amountMax = isPixelate ? MAX_PIXEL_SIZE : MAX_INTENSITY;
  const setAmount = (v: number) => update(isPixelate ? { pixelSize: v } : { intensity: v });

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <View style={styles.grabber} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Effect</Text>
          <Segmented
            value={settings.kind}
            onChange={(kind) => update({ kind })}
            options={[
              { value: 'blur', label: 'Blur' },
              { value: 'pixelate', label: 'Pixelate' },
              { value: 'emoji', label: 'Emoji' },
            ]}
          />

          {settings.kind === 'emoji' ? (
            <>
              <Text style={styles.heading}>Emoji</Text>
              <View style={styles.emojiRow}>
                {EMOJI_CHOICES.map((emoji) => {
                  const active = emoji === settings.emoji;
                  return (
                    <Pressable
                      key={emoji}
                      onPress={() => update({ emoji })}
                      style={({ pressed }) => [
                        styles.emojiChip,
                        { width: chip, height: chip },
                        active && styles.emojiChipActive,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text style={[styles.emojiGlyph, { fontSize: chip * 0.52 }]}>{emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heading}>{noun} shape</Text>
              <Segmented
                value={settings.shape}
                onChange={(shape) => update({ shape })}
                options={[
                  { value: 'rect', label: 'Rectangle' },
                  { value: 'oval', label: 'Oval' },
                ]}
              />

              <Text style={styles.heading}>{isPixelate ? 'Pixelate size' : 'Blur intensity'}</Text>
              <View style={styles.sliderRow}>
                <Text style={styles.value}>{amount}</Text>
                <View style={styles.sliderFlex}>
                  <Slider value={amount} min={amountMin} max={amountMax} onChange={setAmount} />
                </View>
              </View>
            </>
          )}

        </ScrollView>

        <View style={styles.actions}>
          <Pressable onPress={reset} hitSlop={10} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <Text style={styles.reset}>Reset</Text>
          </Pressable>
          <PillButton
            label="Confirm"
            icon={<CheckMark />}
            bg={colors.blue}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    backgroundColor: colors.ink,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SHEET_PAD,
    paddingTop: 10,
    maxHeight: '82%',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: 8,
  },
  content: { paddingBottom: 8 },
  heading: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 12,
  },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  value: { color: colors.white, fontSize: 17, fontWeight: '600', minWidth: 22 },
  sliderFlex: { flex: 1 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: EMOJI_GAP },
  emojiChip: {
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: { backgroundColor: colors.peri },
  // No lineHeight — it clips tall emoji glyphs (same trap as the face overlay).
  emojiGlyph: { textAlign: 'center', includeFontPadding: false },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 26,
    marginTop: 18,
  },
  reset: { color: colors.blue, fontSize: 18, fontWeight: '600' },
});
