import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { BackArrow } from './icons';
import { colors } from '../theme/colors';

export default function EditorTopBar({
  title,
  left,
  onBack,
}: {
  title?: string;
  left?: boolean;
  onBack?: () => void;
}) {
  if (left) {
    return (
      <View style={styles.bar}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.leftGroup}>
          <BackArrow />
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.bar}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backOnly}>
        <BackArrow />
      </Pressable>
      {title ? <Text style={[styles.title, styles.centeredTitle]}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  leftGroup: {
    position: 'absolute',
    left: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backOnly: {
    position: 'absolute',
    left: 24,
  },
  title: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 17,
  },
  centeredTitle: {
    textAlign: 'center',
  },
});
