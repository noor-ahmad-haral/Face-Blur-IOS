import React from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export default function PillButton({
  label,
  icon,
  bg,
  textColor = colors.onBtn,
  onPress,
  outline,
  style,
}: {
  label: string;
  icon?: React.ReactNode;
  bg?: string;
  textColor?: string;
  onPress?: () => void;
  outline?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        bg ? { backgroundColor: bg } : null,
        outline ? styles.outline : null,
        pressed ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: 'transparent',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
});
