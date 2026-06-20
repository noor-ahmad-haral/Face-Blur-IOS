import React from 'react';
import { View } from 'react-native';

// Person-silhouette placeholder used for mock "detected face" / recent-photo
// tiles, matching the Avatar() shape from the original promo (head + shoulders).
export default function Avatar({ size = 120, tone = '#aeb9c4' }: { size?: number; tone?: string }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: '50%',
          top: size * 0.04,
          marginLeft: -(size * 0.24),
          width: size * 0.48,
          height: size * 0.48,
          borderRadius: size * 0.24,
          backgroundColor: tone,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: '50%',
          top: size * 0.52,
          marginLeft: -(size * 0.46),
          width: size * 0.92,
          height: size * 0.62,
          borderTopLeftRadius: size * 0.46,
          borderTopRightRadius: size * 0.46,
          backgroundColor: tone,
        }}
      />
    </View>
  );
}
