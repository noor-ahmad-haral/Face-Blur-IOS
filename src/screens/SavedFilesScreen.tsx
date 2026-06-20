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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import EditorTopBar from '../components/EditorTopBar';
import { CheckMark, ShareIcon, TrashIcon, ImageGlyph } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedFiles'>;

export default function SavedFilesScreen({ navigation, route }: Props) {
  const { photoUri, fileName } = route.params;

  const [asset, setAsset] = useState<MediaLibrary.Asset | null>(null);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const [viewerOpen, setViewerOpen] = useState(false);

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

  async function share() {
    if (!photoUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(photoUri);
    } else {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
    }
  }

  function confirmDelete() {
    Alert.alert('Delete photo', 'Remove this blurred photo from your gallery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: remove },
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
    status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved to your photos' : 'Could not save';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title="Saved" left onBack={() => navigation.popToTop()} />

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
            <Text style={styles.fileMeta}>Blurred photo</Text>
            <Text numberOfLines={1} style={styles.fileMeta}>
              {asset ? 'Saved to Gallery' : status === 'error' ? 'Not saved' : '…'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          icon={<ImageGlyph color={colors.peri} s={19} />}
          label="View"
          onPress={() => photoUri && setViewerOpen(true)}
        />
        <ActionButton
          icon={<TrashIcon color="#ff6b6b" s={18} />}
          label="Delete"
          color="#ff6b6b"
          onPress={confirmDelete}
        />
        <ActionButton icon={<ShareIcon color={colors.peri} s={19} />} label="Share" onPress={share} />
      </View>

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <Pressable style={styles.viewer} onPress={() => setViewerOpen(false)}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} resizeMode="contain" style={styles.viewerImage} />
          ) : null}
          <Text style={styles.viewerHint}>Tap anywhere to close</Text>
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
});
