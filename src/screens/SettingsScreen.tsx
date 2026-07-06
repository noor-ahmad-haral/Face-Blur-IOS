import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Share, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import EditorTopBar from '../components/EditorTopBar';
import {
  InfoIcon,
  MailIcon,
  ThumbsUpIcon,
  ShareIcon,
  ShieldIcon,
  DocIcon,
  ChevronRight,
} from '../components/icons';

const appIcon = require('../../assets/images/app-icon.png');

const APP_NAME = 'Blur Face';
const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'itsezactually@gmail.com';
const PACKAGE = 'com.blurface.app';
const PRIVACY_URL =
  'https://docs.google.com/document/d/1_w7saPWhGFX5vB_9qPK6N8kqCZAbWV-j6OlcSOIQGcM/edit?usp=sharing';
const TERMS_URL =
  'https://docs.google.com/document/d/1kde71C9s8pb9WrvJMQO-FhiA0vcx93MIxbFrW-4-ekA/edit?usp=sharing';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', 'Could not open the link on this device.');
    }
  }

  function aboutUs() {
    Alert.alert(
      APP_NAME,
      'Blur Face detects faces in your photos entirely on your device and lets you blur them with one tap — no photo ever leaves your phone. Protect privacy before you share.'
    );
  }

  function support() {
    openUrl(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Blur Face — Feedback')}`
    );
  }

  async function rateUs() {
    const market = `market://details?id=${PACKAGE}`;
    const web = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
    const canMarket = await Linking.canOpenURL(market);
    openUrl(canMarket ? market : web);
  }

  async function shareApp() {
    try {
      await Share.share({
        message: `Blur faces in your photos instantly with ${APP_NAME}! https://play.google.com/store/apps/details?id=${PACKAGE}`,
      });
    } catch {
      // user dismissed — no-op
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title="Settings" left onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.group}>
          <Row
            icon={<InfoIcon color={colors.peri} s={22} />}
            title="About Us"
            subtitle={`Learn more about the ${APP_NAME} app.`}
            onPress={aboutUs}
          />
          <Row
            icon={<MailIcon color={colors.peri} s={22} />}
            title="Customer Support"
            subtitle="Tell us what you'd like to see, or report a bug."
            onPress={support}
          />
          <Row
            icon={<ThumbsUpIcon color={colors.peri} s={22} />}
            title="Rate Us"
            subtitle="Enjoying the app? Please support it with 5 stars."
            onPress={rateUs}
          />
          <Row
            icon={<ShareIcon color={colors.peri} s={22} />}
            title="Share"
            subtitle="Share Blur Face with your friends."
            onPress={shareApp}
          />
        </View>

        <View style={styles.group}>
          <Row
            icon={<ShieldIcon color={colors.peri} s={22} />}
            title="Privacy Policy"
            subtitle="Read the Privacy Policy."
            onPress={() => openUrl(PRIVACY_URL)}
          />
          <Row
            icon={<DocIcon color={colors.peri} s={22} />}
            title="Terms of Service"
            subtitle="Read the Terms and Conditions."
            onPress={() => openUrl(TERMS_URL)}
            last
          />
        </View>

        <View style={styles.about}>
          <Image source={appIcon} style={styles.aboutIcon} />
          <Text style={styles.aboutName}>{APP_NAME}</Text>
          <Text style={styles.aboutVersion}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight color={colors.mutedD} s={15} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  group: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.cardDivider,
  },
  rowPressed: { backgroundColor: '#ffffff0d' },
  rowIcon: { width: 26, alignItems: 'center' },
  rowText: { flex: 1 },
  rowTitle: { color: colors.white, fontWeight: '600', fontSize: 16 },
  rowSubtitle: { color: colors.mutedD, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  about: {
    alignItems: 'center',
    marginTop: 34,
  },
  aboutIcon: { width: 54, height: 54, borderRadius: 14, marginBottom: 12 },
  aboutName: { color: colors.white, fontWeight: '700', fontSize: 16 },
  aboutVersion: { color: colors.mutedD, fontSize: 13, marginTop: 4 },
});
