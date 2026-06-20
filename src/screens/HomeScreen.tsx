import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ImageGlyph, CheckMark } from '../components/icons';

const appIcon = require('../../assets/images/app-icon.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [recent, setRecent] = useState<MediaLibrary.Asset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  // Load the 3 most recent photos from the device's library.
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setDenied(true);
        return;
      }
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 3,
      });
      setRecent(assets);
    })();
  }, []);

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;
    navigation.navigate('Editor', { photoUri: result.assets[0].uri });
  }

  async function openRecent(asset: MediaLibrary.Asset) {
    setSelectedId(asset.id);
    // Resolve a usable file uri for the editor (Android can return a content:// uri).
    let uri = asset.uri;
    try {
      const info = await MediaLibrary.getAssetInfoAsync(asset);
      if (info.localUri) uri = info.localUri;
    } catch {}
    navigation.navigate('Editor', { photoUri: uri });
    setSelectedId(null);
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Small logo on top with the app name below it */}
      <View style={styles.header}>
        <Image source={appIcon} style={styles.logo} />
        <Text style={styles.title}>Blur Face</Text>
      </View>

      {/* Photo icon — tap to select an image */}
      <Pressable
        onPress={pickFromLibrary}
        style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
      >
        <View style={styles.pickerIcon}>
          <ImageGlyph color={colors.peri} s={42} />
        </View>
        <Text style={styles.pickerLabel}>Select a photo</Text>
        <Text style={styles.pickerHint}>Tap to choose from your library</Text>
      </Pressable>

      {/* Three most recent photos, in one row */}
      <Text style={styles.recentLabel}>Recent</Text>

      <View style={styles.row}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            {denied
              ? 'Allow photo access to see your recent photos.'
              : 'No recent photos yet.'}
          </Text>
        ) : (
          recent.map((asset) => {
            const isSelected = selectedId === asset.id;
            return (
              <Pressable key={asset.id} onPress={() => openRecent(asset)} style={styles.tileWrap}>
                <Image
                  source={{ uri: asset.uri }}
                  style={[styles.tile, isSelected && styles.tileSelected]}
                />
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <CheckMark color={colors.onBtn} s={11} />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { alignItems: 'center', marginTop: 24 },
  logo: { width: 56, height: 56, borderRadius: 14 },
  title: {
    marginTop: 10,
    color: colors.white,
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: -0.2,
  },
  picker: {
    marginTop: 32,
    marginHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  pickerPressed: { opacity: 0.85, borderColor: colors.peri },
  pickerIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    marginTop: 16,
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  pickerHint: {
    marginTop: 6,
    color: colors.mutedD,
    fontSize: 14,
  },
  recentLabel: {
    marginTop: 32,
    marginLeft: 24,
    color: colors.mutedD,
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    marginTop: 10,
    marginHorizontal: 24,
    flexDirection: 'row',
    gap: 10,
  },
  empty: {
    color: colors.mutedD,
    fontSize: 14,
    paddingVertical: 20,
  },
  tileWrap: { flex: 1 },
  tile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.chip,
  },
  tileSelected: {
    borderWidth: 3,
    borderColor: colors.peri,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
