import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import EditorTopBar from '../components/EditorTopBar';
import { CheckMark, ShareIcon, TrashIcon, ImageGlyph } from '../components/icons';
import AdBanner from '../components/AdBanner';

const appIcon = require('../../assets/images/app-icon.png');
const PACKAGE = 'com.blurface.app';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedFiles'>;

export default function SavedFilesScreen({ navigation, route }: Props) {
  const { photoUri, fileName } = route.params;
  const { t } = useI18n();

  const [asset, setAsset] = useState<MediaLibrary.Asset | null>(null);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [rating, setRating] = useState(0);

  // Persist the blurred image into the device gallery as soon as we land here.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!photoUri) {
        setStatus('error');
        return;
      }
      try {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) {
          if (!cancelled) setStatus('error');
          return;
        }
        const created = await MediaLibrary.createAssetAsync(photoUri);
        if (cancelled) return;
        setAsset(created);
        setStatus('saved');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri]);

  // Prompt for a rating shortly after the file is saved.
  useEffect(() => {
    if (status !== 'saved') return;
    const t = setTimeout(() => setShowRate(true), 500);
    return () => clearTimeout(t);
  }, [status]);

  async function rate(stars: number) {
    setRating(stars);
    setTimeout(async () => {
      setShowRate(false);
      if (stars >= 4) {
        const market = `market://details?id=${PACKAGE}`;
        const web = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
        try {
          const ok = await Linking.canOpenURL(market);
          await Linking.openURL(ok ? market : web);
        } catch {
          // ignore
        }
      } else {
        Alert.alert(t.saved.thanksTitle, t.saved.thanksBody);
      }
    }, 280);
  }

  async function share() {
    if (!photoUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(photoUri);
    } else {
      Alert.alert(t.saved.sharingUnavailableTitle, t.saved.sharingUnavailableBody);
    }
  }

  function confirmDelete() {
    Alert.alert(t.saved.deleteTitle, t.saved.deleteBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.delete, style: 'destructive', onPress: remove },
    ]);
  }

  async function remove() {
    try {
      if (asset) await MediaLibrary.deleteAssetsAsync([asset]);
    } catch {
      // ignore — still leave the screen
    }
    navigation.popToTop();
  }

  const statusText =
    status === 'saving'
      ? t.saved.saving
      : status === 'saved'
      ? t.saved.savedToPhotos
      : t.saved.couldNotSave;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <EditorTopBar title={t.saved.title} left onBack={() => navigation.popToTop()} />

      <View style={styles.statusRow}>
        <View style={[styles.checkCircle, status === 'error' && styles.errorCircle]}>
          {status === 'saving' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <CheckMark color="#fff" s={20} />
          )}
        </View>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Pressable style={styles.thumb} onPress={() => photoUri && setViewerOpen(true)}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
            ) : null}
          </Pressable>
          <View style={styles.cardInfo}>
            <Text numberOfLines={1} style={styles.fileName}>
              {fileName}
            </Text>
            <Text style={styles.fileMeta}>{t.saved.blurredPhoto}</Text>
            <Text numberOfLines={1} style={styles.fileMeta}>
              {asset ? t.saved.savedToGallery : status === 'error' ? t.saved.notSaved : '…'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon={<ImageGlyph color={colors.peri} s={19} />}
          label={t.common.view}
          onPress={() => photoUri && setViewerOpen(true)}
        />
        <ActionButton
          icon={<TrashIcon color="#ff6b6b" s={18} />}
          label={t.common.delete}
          color="#ff6b6b"
          onPress={confirmDelete}
        />
        <ActionButton icon={<ShareIcon color={colors.peri} s={19} />} label={t.common.share} onPress={share} />
      </View>

      <View style={styles.spacer} />
      <AdBanner />

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <Pressable style={styles.viewer} onPress={() => setViewerOpen(false)}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} resizeMode="contain" style={styles.viewerImage} />
          ) : null}
          <Text style={styles.viewerHint}>{t.saved.tapToClose}</Text>
        </Pressable>
      </Modal>

      <Modal visible={showRate} transparent animationType="fade" onRequestClose={() => setShowRate(false)}>
        <Pressable style={styles.rateBackdrop} onPress={() => setShowRate(false)}>
          <Pressable style={styles.rateCard} onPress={() => {}}>
            <View style={styles.rateLogoWrap}>
              <Image source={appIcon} style={styles.rateLogo} />
            </View>
            <Text style={styles.rateText}>
              {t.saved.rateText}
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => rate(i)} hitSlop={6}>
                  <Text style={[styles.star, i <= rating && styles.starFilled]}>
                    {i <= rating ? '★' : '☆'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setShowRate(false)} hitSlop={8}>
              <Text style={styles.rateLater}>{t.common.notNow}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  label,
  color = colors.mutedD,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      {({ pressed }) => (
        <>
          <View style={[styles.actionTile, pressed && styles.actionTilePressed]}>{icon}</View>
          <Text style={[styles.actionLabel, { color }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  spacer: { flex: 1, minHeight: 24 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    marginLeft: 18,
  },
  checkCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCircle: { backgroundColor: '#ff6b6b' },
  statusText: { color: colors.white, fontWeight: '700', fontSize: 18 },
  card: {
    marginTop: 20,
    marginHorizontal: 18,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  cardTop: { flexDirection: 'row' },
  thumb: { width: 108, height: 104, backgroundColor: '#39414b', overflow: 'hidden' },
  cardInfo: { flex: 1, padding: 14, justifyContent: 'center' },
  fileName: { color: colors.white, fontWeight: '600', fontSize: 15 },
  fileMeta: { color: colors.mutedD, fontSize: 12.5, marginTop: 4 },
  actions: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  action: { alignItems: 'center' },
  actionTile: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTilePressed: { backgroundColor: colors.chip, borderColor: colors.peri },
  actionLabel: { marginTop: 8, fontWeight: '600', fontSize: 12.5 },
  viewer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: { width: '100%', height: '85%' },
  viewerHint: { color: colors.mutedD, fontSize: 13, marginTop: 12 },
  rateBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  rateCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 26,
    paddingVertical: 30,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  rateLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rateLogo: { width: 56, height: 56, borderRadius: 14 },
  rateText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 25,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  star: {
    fontSize: 42,
    color: colors.mutedD,
    lineHeight: 48,
  },
  starFilled: { color: colors.star },
  rateLater: {
    color: colors.mutedD,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 22,
  },
});
