import React from 'react';
import { View } from 'react-native';

// Small hand-drawn glyphs, ported 1:1 from the div-based icons in
// project/animations.jsx so the editor chrome matches the real app exactly.

export function InfoIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        borderWidth: 2,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: color, marginTop: s * 0.14 }} />
      <View style={{ width: 2.4, height: s * 0.32, borderRadius: 2, backgroundColor: color, marginTop: 2 }} />
    </View>
  );
}

export function MailIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  return (
    <View
      style={{
        width: s,
        height: s * 0.74,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: color,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -s * 0.2,
          left: s * 0.12,
          width: s * 0.5,
          height: s * 0.5,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function ShieldIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  return (
    <View
      style={{
        width: s * 0.72,
        height: s * 0.86,
        borderWidth: 2,
        borderColor: color,
        borderTopLeftRadius: s * 0.18,
        borderTopRightRadius: s * 0.18,
        borderBottomLeftRadius: s * 0.36,
        borderBottomRightRadius: s * 0.36,
      }}
    />
  );
}

export function DocIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s * 0.74, height: s * 0.92 }}>
      <View
        style={{
          position: 'absolute',
          inset: 0,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 3,
        }}
      />
      {[0.32, 0.5, 0.68].map((t) => (
        <View
          key={t}
          style={{
            position: 'absolute',
            left: s * 0.14,
            right: s * 0.14,
            top: s * t,
            height: 2,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

export function ThumbsUpIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s }}>
      {/* base / palm */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: s * 0.26,
          height: s * 0.5,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 2,
        }}
      />
      {/* thumb + hand */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.28,
          bottom: 0,
          right: 0,
          height: s * 0.56,
          borderWidth: 2,
          borderColor: color,
          borderTopLeftRadius: s * 0.2,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
      {/* raised thumb */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.3,
          top: 0,
          width: s * 0.3,
          height: s * 0.32,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: s * 0.16,
          borderTopRightRadius: s * 0.16,
        }}
      />
    </View>
  );
}

export function ChevronRight({ color = '#8a95a1', s = 14 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: s * 0.5,
          height: s * 0.5,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateX: -s * 0.08 }],
        }}
      />
    </View>
  );
}

export function BackArrow({ color = '#fff' }: { color?: string }) {
  return (
    <View style={{ width: 20, height: 14, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: 0, top: 6, width: 20, height: 2.5, backgroundColor: color, borderRadius: 2 }} />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 1.5,
          width: 9,
          height: 9,
          borderLeftWidth: 2.5,
          borderBottomWidth: 2.5,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function GridDots({ color = '#2a3656', size = 16 }: { color?: string; size?: number }) {
  const dot = size * 0.18;
  const gap = size * 0.16;
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
      ))}
    </View>
  );
}

export function PlusIcon({ color = '#8a95a1', s = 18 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 2.5, height: s, backgroundColor: color, borderRadius: 2 }} />
      <View style={{ position: 'absolute', width: s, height: 2.5, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

export function GearIcon({ color = '#fff', s = 20 }: { color?: string; s?: number }) {
  const teeth = 8;
  const toothW = s * 0.16;
  const toothH = s * 0.2;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: teeth }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: toothW,
            height: toothH,
            backgroundColor: color,
            borderRadius: 1.5,
            transform: [{ rotate: `${i * (360 / teeth)}deg` }, { translateY: -s * 0.31 }],
          }}
        />
      ))}
      {/* donut body — transparent centre shows the button behind it */}
      <View
        style={{
          width: s * 0.58,
          height: s * 0.58,
          borderRadius: s * 0.29,
          borderWidth: s * 0.13,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function SaveIcon({ color = '#2a3656', s = 15 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, borderRadius: 3, borderWidth: 2, borderColor: color }}>
      <View style={{ position: 'absolute', top: -2, left: s * 0.2, width: s * 0.4, height: s * 0.27, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

export function ShareIcon({ color = '#2a3656', s = 18 }: { color?: string; s?: number }) {
  // iOS-style share glyph: a tray (box open at the top) with an arrow rising out of it.
  const stroke = Math.max(2, s * 0.12);
  return (
    <View style={{ width: s, height: s }}>
      {/* tray / box */}
      <View
        style={{
          position: 'absolute',
          left: s * 0.14,
          bottom: 0,
          width: s * 0.72,
          height: s * 0.56,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: s * 0.16,
          borderBottomRightRadius: s * 0.16,
        }}
      />
      {/* arrow stem */}
      <View
        style={{
          position: 'absolute',
          left: s / 2 - stroke / 2,
          top: s * 0.08,
          width: stroke,
          height: s * 0.5,
          backgroundColor: color,
          borderRadius: stroke,
        }}
      />
      {/* arrow head (up chevron) */}
      <View
        style={{
          position: 'absolute',
          left: s / 2 - s * 0.16,
          top: s * 0.09,
          width: s * 0.32,
          height: s * 0.32,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          borderTopLeftRadius: stroke * 0.6,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function TrashIcon({ color = '#2a3656', s = 16 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: 2, width: s, height: 2.2, backgroundColor: color, borderRadius: 2 }} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: s * 0.42,
          height: 3,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 4,
          width: s * 0.74,
          height: s * 0.72,
          borderWidth: 2,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </View>
  );
}

export function StarIcon({ color = '#F5C518', s = 17 }: { color?: string; s?: number }) {
  // Simplified diamond/star block rendered as a rotated square pair to approximate the clip-path star.
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: s * 0.62, height: s * 0.62, backgroundColor: color, transform: [{ rotate: '0deg' }] }} />
      <View style={{ position: 'absolute', width: s * 0.62, height: s * 0.62, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

export function ExtEditIcon({ color = '#fff', s = 18 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, borderRadius: 3, borderWidth: 2, borderColor: color }}>
      <View
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: s * 0.55,
          height: s * 0.55,
          backgroundColor: '#1b2129',
          borderRadius: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: s * 0.3, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
      </View>
    </View>
  );
}

export function CheckMark({ color = '#2a3656', s = 14 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: s * 0.62,
          height: s * 0.34,
          borderLeftWidth: 2.4,
          borderBottomWidth: 2.4,
          borderColor: color,
          transform: [{ rotate: '-45deg' }, { translateY: -s * 0.08 }],
        }}
      />
    </View>
  );
}

export function ImageGlyph({ color = '#2a3656', s = 21 }: { color?: string; s?: number }) {
  return (
    <View style={{ width: s, height: s, borderRadius: 4, borderWidth: 2, borderColor: color, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          left: s * 0.16,
          top: s * 0.16,
          width: s * 0.2,
          height: s * 0.2,
          borderRadius: s * 0.1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: -2,
          right: -2,
          bottom: -2,
          height: s * 0.5,
          backgroundColor: color,
          transform: [{ rotate: '-8deg' }, { translateY: 2 }],
        }}
      />
    </View>
  );
}

export function LockIcon({ peri = '#AEBDF4', blue = '#93A6F2', onBtn = '#2a3656' }: { peri?: string; blue?: string; onBtn?: string }) {
  return (
    <View style={{ width: 150, height: 158, alignItems: 'center' }}>
      <View style={{ width: 86, height: 86, borderRadius: 43, borderWidth: 15, borderColor: peri }} />
      <View
        style={{
          position: 'absolute',
          top: 64,
          width: 130,
          height: 96,
          borderRadius: 22,
          backgroundColor: blue,
          alignItems: 'center',
        }}
      >
        <View style={{ marginTop: 30, width: 16, height: 16, borderRadius: 8, backgroundColor: onBtn }} />
        <View style={{ marginTop: 2, width: 8, height: 20, borderRadius: 4, backgroundColor: onBtn }} />
      </View>
    </View>
  );
}

export function SlidersIcon({ color = '#fff', s = 22 }: { color?: string; s?: number }) {
  // Three horizontal rails with offset knobs — the "adjust" glyph.
  const rails = [
    { y: 0.2, knob: 0.62 },
    { y: 0.5, knob: 0.3 },
    { y: 0.8, knob: 0.72 },
  ];
  return (
    <View style={{ width: s, height: s }}>
      {rails.map((r) => (
        <View key={r.y} style={{ position: 'absolute', left: 0, right: 0, top: s * r.y - 1 }}>
          <View style={{ height: 2, backgroundColor: color, borderRadius: 2 }} />
          <View
            style={{
              position: 'absolute',
              left: s * r.knob - s * 0.09,
              top: -s * 0.08,
              width: s * 0.18,
              height: s * 0.18,
              borderRadius: s * 0.09,
              borderWidth: 2,
              borderColor: color,
              backgroundColor: '#0E1318',
            }}
          />
        </View>
      ))}
    </View>
  );
}
