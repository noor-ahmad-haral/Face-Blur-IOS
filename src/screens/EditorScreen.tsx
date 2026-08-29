import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, BlurRegion, EffectSettings } from '../navigation/types';
import { DEFAULT_EFFECTS } from '../navigation/types';
import { colors } from '../theme/colors';
import EditorTopBar from '../components/EditorTopBar';
import PhotoBackdrop from '../components/PhotoBackdrop';
import ThumbChip from '../components/ThumbChip';
import Avatar from '../components/Avatar';
import PillButton from '../components/PillButton';
import RegionEffect from '../components/RegionEffect';
import { GridDots, SaveIcon, PlusIcon, SlidersIcon } from '../components/icons';
import { detectFaces } from '../lib/faceDetection';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

const FRAME_H = 372;
const FRAME_MARGIN = 16;
const FRAME_PAD = 8;

// Placeholder faces used only for the mock "Recent" tiles that carry no real image.
const MOCK_FACES: BlurRegion[] = [
  { id: 'f1', x: 0.07, y: 0.43, w: 0.42, h: 0.32, tone: '#b3bdc7', blurred: true, kind: 'face' },
  { id: 'f2', x: 0.33, y: 0.35, w: 0.48, h: 0.36, tone: '#c4cbb9', blurred: true, kind: 'face' },
  { id: 'f3', x: 0.66, y: 0.45, w: 0.4, h: 0.3, tone: '#aeb6c8', blurred: true, kind: 'face' },
];

export default function EditorScreen({ navigation, route }: Props) {
  const { photoUri, mock } = route.params;
  const { width: winW } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [regions, setRegions] = useState<BlurRegion[]>(mock ? MOCK_FACES : []);
  const [effects, setEffects] = useState<EffectSettings>(DEFAULT_EFFECTS);
  const [displayUri, setDisplayUri] = useState<string | undefined>(photoUri);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(!!photoUri);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const shotRef = useRef<View>(null);

  // Run on-device face detection whenever a real photo is opened.
  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await detectFaces(photoUri);
        if (cancelled) return;
        setDisplayUri(result.uri);
        setImgSize({ w: result.width, h: result.height });
        setRegions(result.regions);
      } catch (e) {
        if (cancelled) return;
        setError('Face detection unavailable. Add blur regions manually.');
        setDisplayUri(photoUri);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri]);

  function toggleRegion(id: string) {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, blurred: !r.blurred } : r)));
  }

  function blurAll() {
    setRegions((prev) => prev.map((r) => ({ ...r, blurred: true })));
  }

  function clearAll() {
    setRegions((prev) => prev.map((r) => ({ ...r, blurred: false })));
  }

  function addCustomRegion() {
    navigation.navigate('Crop', {
      photoUri: displayUri,
      mock,
      onConfirm: (region) => setRegions((prev) => [...prev, region]),
    });
  }

  function openEffects() {
    navigation.navigate('Effects', { settings: effects, onApply: setEffects });
  }

  async function save() {
    try {
      setSaving(true);
      let uri = displayUri ?? photoUri;
      // Bake the effect into a real image file by capturing the composed view.
      if (displayUri && imgSize) {
        uri = await captureRef(shotRef, { format: 'jpg', quality: 0.95 });
      }
      const fileName = `blurface-${Date.now()}.jpg`;
      navigation.navigate('SavedFiles', {
        photoUri: uri,
        mock,
        fileName,
        fileSizeMB: 0,
        regionsCount: regions.filter((r) => r.blurred).length,
      });
    } catch (e) {
      Alert.alert('Save failed', 'Could not render the blurred image. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Compute an aspect-fit rectangle so region fractions map 1:1 onto the image.
  const availW = winW - FRAME_MARGIN * 2 - FRAME_PAD * 2;
  const availH = FRAME_H - FRAME_PAD * 2;
  let dispW = availW;
  let dispH = availH;
  if (imgSize) {
    const aspect = imgSize.w / imgSize.h;
    dispW = availW;
    dispH = availW / aspect;
    if (dispH > availH) {
      dispH = availH;
      dispW = availH * aspect;
    }
  }

  const facesLabel = loading
    ? 'Detecting faces…'
    : error
    ? 'Faces'
    : regions.length === 0
    ? 'No faces found'
    : `Faces Detected (${regions.length})`;

  function regionBox(r: BlurRegion) {
    return {
      left: `${r.x * 100}%`,
      top: `${r.y * 100}%`,
      width: `${r.w * 100}%`,
      height: `${r.h * 100}%`,
    } as const;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar onBack={() => navigation.goBack()} />

      {/* Off-screen composition captured on Save — base image + only the
          covered faces baked in, with no selection outlines. */}
      {displayUri && imgSize && (
        <View
          ref={shotRef}
          collapsable={false}
          pointerEvents="none"
          style={[styles.captureBox, { width: dispW, height: dispH }]}
        >
          <Image source={{ uri: displayUri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
          {regions
            .filter((r) => r.blurred)
            .map((r) => (
              <View key={r.id} style={[styles.region, regionBox(r)]}>
                <RegionEffect region={r} settings={effects} imageUri={displayUri} dispW={dispW} dispH={dispH} />
              </View>
            ))}
        </View>
      )}

      <View style={styles.frame}>
        {photoUri && !imgSize ? (
          // Real photo: show a loader until detection + sizing completes.
          <View style={styles.loadingArea}>
            {loading ? (
              <>
                <ActivityIndicator color={colors.peri} size="large" />
                <Text style={styles.loadingText}>Finding faces…</Text>
              </>
            ) : (
              displayUri && (
                <Image source={{ uri: displayUri }} resizeMode="contain" style={StyleSheet.absoluteFill} />
              )
            )}
          </View>
        ) : photoUri && imgSize ? (
          // Real photo, ready: aspect-fit image with detected regions overlaid.
          <View style={[styles.photoBox, { width: dispW, height: dispH }]}>
            <Image source={{ uri: displayUri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
            {regions.map((r) => (
              <Pressable key={r.id} onPress={() => toggleRegion(r.id)} style={[styles.region, regionBox(r)]}>
                {r.blurred ? (
                  <RegionEffect region={r} settings={effects} imageUri={displayUri} dispW={dispW} dispH={dispH} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.regionOutline]} />
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          // Mock placeholder (Recent tile without a backing image).
          <View style={styles.photoArea}>
            <PhotoBackdrop photoUri={photoUri} mock={mock} />
            {regions.map((r) => (
              <Pressable key={r.id} onPress={() => toggleRegion(r.id)} style={[styles.region, regionBox(r)]}>
                {r.blurred ? (
                  <RegionEffect region={r} settings={effects} dispW={dispW} dispH={dispH} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.regionOutline]} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.facesLabel}>{facesLabel}</Text>
      {error ? <Text style={styles.hint}>{error}</Text> : null}
      {!loading && !error && regions.length === 0 ? (
        <Text style={styles.hint}>Tap + to add a blur region by hand.</Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Pressable onPress={addCustomRegion}>
          <ThumbChip dashed>
            <PlusIcon color={colors.mutedD} s={18} />
          </ThumbChip>
        </Pressable>
        {regions.map((r, i) => (
          <Pressable key={r.id} onPress={() => toggleRegion(r.id)}>
            <ThumbChip badge={i + 1}>
              {r.thumbUri ? (
                <Image source={{ uri: r.thumbUri }} resizeMode="cover" style={styles.faceThumb} />
              ) : (
                <View style={{ transform: [{ scale: 1.3 }, { translateY: 6 }] }}>
                  <Avatar size={50} tone={r.tone} />
                </View>
              )}
            </ThumbChip>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { marginBottom: Math.max(insets.bottom, 12) + 12 }]}>
        <PillButton label="Blur all" icon={<GridDots />} bg={colors.peri} onPress={blurAll} style={styles.pill} />
        <Pressable onPress={clearAll} style={styles.iconBtn}>
          <GridDots color={colors.peri} size={15} />
          <View style={styles.clearStrike} />
        </Pressable>
        <Pressable onPress={openEffects} style={styles.iconBtn}>
          <SlidersIcon color={colors.peri} s={20} />
        </Pressable>
        <PillButton label="Save" icon={<SaveIcon />} bg={colors.blue} onPress={save} style={styles.pill} />
      </View>

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color={colors.peri} size="large" />
          <Text style={styles.loadingText}>Saving…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  frame: {
    marginHorizontal: FRAME_MARGIN,
    height: FRAME_H,
    borderRadius: 14,
    backgroundColor: colors.frame,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: FRAME_PAD,
  },
  loadingArea: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 12, color: colors.mutedD, fontSize: 14 },
  photoBox: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  photoArea: {
    width: '78%',
    height: '95%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  // No clipping here — RegionEffect clips its own blur, and emoji overlays are
  // allowed to spill past the face box.
  region: { position: 'absolute' },
  regionOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 4,
  },
  captureBox: { position: 'absolute', left: -10000, top: 0 },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,19,24,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facesLabel: {
    marginTop: 16,
    marginLeft: 20,
    color: colors.white,
    fontWeight: '700',
    fontSize: 19,
  },
  hint: {
    marginTop: 4,
    marginLeft: 20,
    color: colors.mutedD,
    fontSize: 13.5,
  },
  chipsRow: {
    marginTop: 14,
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },
  faceThumb: { width: 62, height: 62 },
  bottomBar: {
    marginTop: 'auto',
    marginHorizontal: 16,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pill: { paddingHorizontal: 16 },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearStrike: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: colors.peri,
    transform: [{ rotate: '-45deg' }],
  },
});
