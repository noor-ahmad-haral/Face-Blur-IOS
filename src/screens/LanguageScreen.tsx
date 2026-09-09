import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n, LANGUAGES } from '../i18n';
import PillButton from '../components/PillButton';
import { GlobeIcon, CheckMark } from '../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

export default function LanguageScreen({ navigation }: Props) {
  const { t, lang, setLanguage } = useI18n();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.globeWrap}>
          <GlobeIcon color={colors.peri} s={34} />
        </View>
        {/* Both lines re-render in the tapped language, so the choice previews
            itself before the user commits to it. */}
        <Text style={styles.title}>{t.onboarding.chooseLanguage}</Text>
        <Text style={styles.sub}>{t.onboarding.chooseLanguageSub}</Text>
      </View>

      <ScrollView style={styles.listWrap} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((l, i) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              onPress={() => setLanguage(l.code)}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{l.label}</Text>
              {active ? <CheckMark color={colors.peri} s={16} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <PillButton
        label={t.common.continue}
        bg={colors.blue}
        onPress={() => navigation.navigate('Onboarding')}
        style={styles.cta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 18, paddingBottom: 4 },
  globeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#161d27',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { color: colors.white, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  sub: {
    color: colors.mutedD,
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  listWrap: { flex: 1, marginTop: 18 },
  list: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.cardDivider },
  rowPressed: { backgroundColor: '#ffffff0d' },
  label: { color: colors.white, fontSize: 16 },
  labelActive: { color: colors.peri, fontWeight: '700' },
  cta: { marginHorizontal: 22, marginTop: 16, marginBottom: 14, justifyContent: 'center' },
});
