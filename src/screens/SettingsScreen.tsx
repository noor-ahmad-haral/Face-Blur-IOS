import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Share, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n, LANGUAGES } from '../i18n';
import EditorTopBar from '../components/EditorTopBar';
import {
  InfoIcon,
  MailIcon,
  ThumbsUpIcon,
  ShareIcon,
  ShieldIcon,
  DocIcon,
  ChevronRight,
  GlobeIcon,
  CheckMark,
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
  const { t, lang, setLanguage } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const activeLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? 'English';
  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t.settings.unableToOpen, t.settings.unableToOpenBody);
    }
  }

  function aboutUs() {
    Alert.alert(APP_NAME, t.settings.aboutBody);
  }

  function support() {
    openUrl(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t.settings.feedbackSubject)}`
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
        message: `${t.settings.shareMessage} https://play.google.com/store/apps/details?id=${PACKAGE}`,
      });
    } catch {
      // user dismissed — no-op
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title={t.settings.title} left onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language sits on its own: it changes the app, the rows below only
            open information. */}
        <View style={styles.group}>
          <Row
            icon={<GlobeIcon color={colors.peri} s={22} />}
            title={t.settings.language}
            subtitle={activeLabel}
            onPress={() => setLangOpen(true)}
            last
          />
        </View>

        <View style={styles.group}>
          <Row
            icon={<InfoIcon color={colors.peri} s={22} />}
            title={t.settings.aboutUs}
            subtitle={t.settings.aboutUsSub}
            onPress={aboutUs}
          />
          <Row
            icon={<MailIcon color={colors.peri} s={22} />}
            title={t.settings.support}
            subtitle={t.settings.supportSub}
            onPress={support}
          />
          <Row
            icon={<ThumbsUpIcon color={colors.peri} s={22} />}
            title={t.settings.rateUs}
            subtitle={t.settings.rateUsSub}
            onPress={rateUs}
          />
          <Row
            icon={<ShareIcon color={colors.peri} s={22} />}
            title={t.settings.shareApp}
            subtitle={t.settings.shareAppSub}
            onPress={shareApp}
          />
        </View>

        <View style={styles.group}>
          <Row
            icon={<ShieldIcon color={colors.peri} s={22} />}
            title={t.settings.privacy}
            subtitle={t.settings.privacySub}
            onPress={() => openUrl(PRIVACY_URL)}
          />
          <Row
            icon={<DocIcon color={colors.peri} s={22} />}
            title={t.settings.terms}
            subtitle={t.settings.termsSub}
            onPress={() => openUrl(TERMS_URL)}
            last
          />
        </View>

        <View style={styles.about}>
          <Image source={appIcon} style={styles.aboutIcon} />
          <Text style={styles.aboutName}>{APP_NAME}</Text>
          <Text style={styles.aboutVersion}>{t.settings.version(APP_VERSION)}</Text>
        </View>
      </ScrollView>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.langBackdrop} onPress={() => setLangOpen(false)}>
          <Pressable style={styles.langCard} onPress={() => {}}>
            <Text style={styles.langTitle}>{t.settings.language}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <Pressable
                    key={l.code}
                    onPress={() => {
                      setLanguage(l.code);
                      setLangOpen(false);
                    }}
                    style={({ pressed }) => [styles.langRow, pressed && styles.rowPressed]}
                  >
                    {/* Each language is written in its own script — someone
                        looking for theirs may not read the current one. */}
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>{l.label}</Text>
                    {active ? <CheckMark color={colors.peri} s={16} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  langBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  langCard: {
    width: '100%',
    maxHeight: '75%',
    borderRadius: 18,
    backgroundColor: colors.card,
    paddingVertical: 8,
  },
  langTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 17,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  langLabel: { color: colors.white, fontSize: 16 },
  langLabelActive: { color: colors.peri, fontWeight: '700' },
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
