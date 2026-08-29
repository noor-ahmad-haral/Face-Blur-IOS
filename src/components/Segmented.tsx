import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { CheckMark } from './icons';

export type SegmentOption<T extends string> = { value: T; label: string };

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segment,
              i > 0 && styles.divider,
              active && styles.segmentActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            {active ? <CheckMark color={colors.white} s={15} /> : null}
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  divider: { borderLeftWidth: 1.5, borderLeftColor: colors.line },
  segmentActive: { backgroundColor: colors.card },
  label: { color: colors.white, fontSize: 16, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});
