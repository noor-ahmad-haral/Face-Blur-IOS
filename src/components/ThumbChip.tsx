import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function ThumbChip({
  children,
  badge,
  dashed,
}: {
  children: React.ReactNode;
  badge?: number;
  dashed?: boolean;
}) {
  return (
    <View
      style={[
        styles.chip,
        dashed && { borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed' },
      ]}
    >
      {children}
      {badge != null && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.chip,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.peri,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.onBtn,
    fontWeight: '700',
    fontSize: 10,
  },
});
