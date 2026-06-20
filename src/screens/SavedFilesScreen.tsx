import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import EditorTopBar from '../components/EditorTopBar';
import PhotoBackdrop from '../components/PhotoBackdrop';
import { BlurView } from 'expo-blur';
import { CheckMark, ExtEditIcon, SaveIcon, ShareIcon, TrashIcon, StarIcon } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedFiles'>;

export default function SavedFilesScreen({ navigation, route }: Props) {
  const { photoUri, mock, fileName, fileSizeMB, regionsCount } = route.params;

  async function shareFile() {
    if (!photoUri) {
      Alert.alert('Nothing to share', 'This was a mock photo with no file on disk.');
      return;
    }
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(photoUri);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <EditorTopBar title="Saved Files" left onBack={() => navigation.popToTop()} />

      <View style={styles.statusRow}>
        <View style={styles.checkCircle}>
          <CheckMark color="#fff" s={20} />
        </View>
        <Text style={styles.statusText}>1 File Saved, 0 Skipped</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.thumb}>
            <PhotoBackdrop photoUri={photoUri} mock={mock} />
            {regionsCount > 0 && <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />}
          </View>
          <View style={styles.cardInfo}>
            <Text numberOfLines={1} style={styles.fileName}>
              {fileName}
            </Text>
            <Text style={styles.fileMeta}>{fileSizeMB.toFixed(2)} mB</Text>
            <Text style={styles.fileMeta}>/storage/emulated/0/Pictures/Blur Face</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <ActionButton onPress={() => {}}>
            <ExtEditIcon />
          </ActionButton>
          <ActionButton onPress={() => {}}>
            <SaveIcon color="#fff" s={16} />
          </ActionButton>
          <ActionButton onPress={shareFile}>
            <ShareIcon color="#fff" />
          </ActionButton>
          <ActionButton onPress={() => navigation.popToTop()}>
            <TrashIcon color="#fff" />
          </ActionButton>
        </View>
      </View>

      <View style={styles.optionsGrid}>
        <OptionRow icon={<SaveIcon color={colors.blue} s={18} />} label="Replace all" color={colors.blue} onPress={() => navigation.popToTop()} />
        <OptionRow icon={<ShareIcon color={colors.blue} s={20} />} label="Share All" color={colors.blue} onPress={shareFile} />
        <OptionRow icon={<TrashIcon color={colors.blue} s={18} />} label="Delete All" color={colors.blue} onPress={() => navigation.popToTop()} />
        <OptionRow icon={<StarIcon color={colors.star} s={19} />} label="Rate the App" color={colors.star} onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

function ActionButton({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn}>
      {children}
    </Pressable>
  );
}

function OptionRow({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.optionRow}>
      <View style={styles.optionIcon}>{icon}</View>
      <Text style={[styles.optionLabel, { color }]}>{label}</Text>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardDivider,
    paddingVertical: 14,
  },
  actionBtn: { flex: 1, alignItems: 'center' },
  optionsGrid: {
    marginTop: 'auto',
    marginHorizontal: 26,
    marginBottom: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 26,
  },
  optionRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 8,
  },
  optionIcon: { width: 26, alignItems: 'center' },
  optionLabel: { fontWeight: '600', fontSize: 17 },
});
