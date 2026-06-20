import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import type { PhotoRef } from '../navigation/types';

// Renders either the real picked photo, or (when the user tapped a mock
// "Recent" tile that has no backing image) the same gradient + silhouette
// placeholder used by the source design.
export default function PhotoBackdrop({ photoUri, mock, style }: PhotoRef & { style?: any }) {
  if (photoUri) {
    return <Image source={{ uri: photoUri }} resizeMode="cover" style={[StyleSheet.absoluteFill, style]} />;
  }
  return (
    <LinearGradient colors={mock?.gradient ?? ['#586675', '#2e3540']} style={[StyleSheet.absoluteFill, styles.center, style]}>
      <Avatar size={180} tone={mock?.tone ?? '#aab4bf'} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
