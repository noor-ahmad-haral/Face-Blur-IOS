import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Linking,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import { ImageGlyph, GearIcon, ShieldIcon } from '../components/icons';

const appIcon = require('../../assets/images/app-icon.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };

export default function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();

  function openEditor(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets?.length) return;
    navigation.navigate('Editor', { photoUri: result.assets[0].uri });
  }

  async function pickFromLibrary() {
    openEditor(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.home.cameraDeniedTitle, t.home.cameraDeniedBody, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.home.openSettings, onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    try {
      openEditor(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
    } catch {
      // No camera available (e.g. the iOS Simulator) — nothing to open.
    }
  }

  // One entry point for both sources: the native action sheet on iOS, and an
  // equivalent alert elsewhere.
  function chooseSource() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t.home.selectPhoto,
          options: [t.home.takePhoto, t.home.fromLibrary, t.common.cancel],
          cancelButtonIndex: 2,
        },
        (i) => {
          if (i === 0) takePhoto();
          else if (i === 1) pickFromLibrary();
        }
      );
      return;
    }
    Alert.alert(t.home.selectPhoto, undefined, [
      { text: t.home.takePhoto, onPress: takePhoto },
      { text: t.home.fromLibrary, onPress: pickFromLibrary },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  }

  const steps = [t.home.stepPick, t.home.stepDetect, t.home.stepSave];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Photo card — tap to take a photo or choose one from the library */}
        <Pressable
          onPress={chooseSource}
          style={({ pressed }) => [styles.picker, pressed && styles.pickerPressed]}
        >
          <View style={styles.pickerIcon}>
            <ImageGlyph color={colors.peri} s={42} />
          </View>
          <Text style={styles.pickerLabel}>{t.home.selectPhoto}</Text>
          <Text style={styles.pickerHint}>{t.home.selectPhotoHint}</Text>
        </Pressable>

        {/* Privacy reassurance — detection runs fully on-device */}
        <View style={styles.badge}>
          <ShieldIcon color={colors.green} s={16} />
          <Text style={styles.badgeText}>{t.home.privacyBadge}</Text>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>{t.home.howItWorks}</Text>
        <View style={styles.steps}>
          {steps.map((label, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepLabel} numberOfLines={2}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { flexGrow: 1, paddingBottom: 24 },
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
    marginHorizontal: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  badge: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeText: { flex: 1, color: colors.white, fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    marginTop: 28,
    marginHorizontal: 20,
    color: colors.white,
    fontWeight: '700',
    fontSize: 17,
  },
  steps: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    gap: 10,
  },
  step: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: colors.onBtn, fontWeight: '800', fontSize: 15 },
  stepLabel: {
    marginTop: 10,
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
