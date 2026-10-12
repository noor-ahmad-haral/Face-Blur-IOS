import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import { ImageGlyph, GearIcon } from '../components/icons';
import AdBanner from '../components/AdBanner';

const appIcon = require('../../assets/images/app-icon.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return;
    navigation.navigate('Editor', { photoUri: result.assets[0].uri });
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
});
