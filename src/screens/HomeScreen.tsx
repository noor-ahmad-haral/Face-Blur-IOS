import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import { ImageGlyph, CheckMark, GearIcon } from '../components/icons';
import AdBanner from '../components/AdBanner';

const appIcon = require('../../assets/images/app-icon.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
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
      {/* Header: logo, app name + tagline, and a settings button */}
      <View style={styles.header}>
        <Image source={appIcon} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Blur Face</Text>
          <Text style={styles.tagline}>{t.home.tagline}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.settingsBtnPressed]}
        >
          <GearIcon color={colors.white} s={20} />
        </Pressable>
      </View>

      {/* Photo icon — tap to select an image */}
      <Pressable
        onPress={pickFromLibrary}
        style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
      >
        <View style={styles.pickerIcon}>
          <ImageGlyph color={colors.peri} s={42} />
        </View>
        <Text style={styles.pickerLabel}>{t.home.selectPhoto}</Text>
        <Text style={styles.pickerHint}>{t.home.selectPhotoHint}</Text>
      </Pressable>

      {/* Three most recent photos, in one row */}
      <Text style={styles.recentLabel}>{t.home.recent}</Text>

      <View style={styles.row}>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            {denied
              ? t.home.allowAccess
              : t.home.noRecent}
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

      <View style={styles.spacer} />
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  spacer: { flex: 1, minHeight: 24 },
  header: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: { width: 56, height: 56, borderRadius: 15 },
  headerText: { flex: 1 },
  title: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 26,
    letterSpacing: -0.4,
  },
  tagline: {
    marginTop: 2,
    color: colors.mutedD,
    fontSize: 14,
  },
  settingsBtn: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnPressed: { backgroundColor: colors.chip, borderColor: colors.peri },
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
