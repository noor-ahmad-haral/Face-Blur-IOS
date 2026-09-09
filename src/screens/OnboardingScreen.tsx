import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { useI18n } from '../i18n';
import PillButton from '../components/PillButton';
import { CheckMark } from '../components/icons';
import { DetectArt, PrivacyArt } from '../components/OnboardingArt';
import { markOnboardingSeen } from '../lib/onboarding';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useI18n();
  // Built here rather than at module scope so the copy follows the active
  // language instead of being frozen at import time.
  const PAGES = [
    {
      key: 'detect',
      art: <DetectArt />,
      title: t.onboarding.title1,
      points: [t.onboarding.point1a, t.onboarding.point1b, t.onboarding.point1c],
    },
    {
      key: 'privacy',
      art: <PrivacyArt />,
      title: t.onboarding.title2,
      points: [t.onboarding.point2a, t.onboarding.point2b, t.onboarding.point2c],
    },
  ];
  const { width: winW, height: winH } = useWindowDimensions();
  // Shrink the artwork on short windows (landscape, foldables, split screen) so
  // the copy and the button still fit without scrolling.
  const artH = Math.min(250, Math.max(140, Math.round(winH * 0.3)));
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isLast = page === PAGES.length - 1;

  async function finish() {
    await markOnboardingSeen();
    // Replace the stack so back never returns to the intro.
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  function next() {
    if (isLast) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * winW, animated: true });
  }

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / winW));
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Fixed height, so the row does not collapse when Skip is hidden. */}
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12} style={({ pressed }) => pressed && { opacity: 0.7 }}>
            <Text style={styles.skip}>{t.common.skip}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.pager}
      >
        {PAGES.map((p) => (
          <View key={p.key} style={{ width: winW }}>
            {/* Scrolls only as a safety net; on a normal screen the content is
                centred and fits without moving. */}
            <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
              <View style={[styles.art, { height: artH }]}>
                <View style={{ transform: [{ scale: artH / 250 }] }}>{p.art}</View>
              </View>
              <Text style={styles.title}>{p.title}</Text>
              <View style={styles.list}>
                {p.points.map((point, i) => (
                  <View key={point} style={[styles.listRow, i > 0 && styles.listRowGap]}>
                    <View style={styles.tick}>
                      <CheckMark color={colors.onBtn} s={12} />
                    </View>
                    <Text style={styles.listText}>{point}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View key={p.key} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      <PillButton
        label={isLast ? t.common.getStarted : t.common.next}
        bg={colors.blue}
        onPress={next}
        style={styles.cta}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  topBar: {
    height: 52,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  skip: { color: colors.mutedD, fontSize: 16, fontWeight: '600' },
  pager: { flex: 1 },
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  art: { alignItems: 'center', justifyContent: 'center' },
  title: {
    marginTop: 18,
    color: colors.white,
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Left-aligned rows, centred as a block, so the ticks line up.
  list: { marginTop: 26, alignSelf: 'center' },
  // Explicit row metrics: letting the row height fall out of font measurement
  // gave uneven gaps between items on the device.
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 26 },
  listRowGap: { marginTop: 16 },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: {
    color: '#c3ccd7',
    fontSize: 16,
    lineHeight: 22,
    includeFontPadding: false,
    flexShrink: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotActive: { width: 22, backgroundColor: colors.peri },
  cta: {
    marginHorizontal: 22,
    marginBottom: 16,
    justifyContent: 'center',
  },
});
