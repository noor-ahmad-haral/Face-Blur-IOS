export type MockPhoto = {
  tone: string;
  gradient: [string, string];
};

export type BlurRegion = {
  id: string;
  // x/y/w/h are fractions (0-1) of the photo frame so they scale to any size.
  x: number;
  y: number;
  w: number;
  h: number;
  tone: string;
  blurred: boolean;
  kind: 'face' | 'custom';
  // Cropped thumbnail of this face, shown in the "Faces Detected" chip row.
  thumbUri?: string;
};

// How a covered region is rendered. Chosen once on the Effects screen and
// applied to every region in the photo.
export type EffectKind = 'blur' | 'emoji';
export type BlurShape = 'rect' | 'oval';

export type EffectSettings = {
  kind: EffectKind;
  shape: BlurShape;
  // 1-10; mapped to an Image blurRadius when rendering.
  intensity: number;
  emoji: string;
};

export const EMOJI_CHOICES = [
  '\u{1F600}', // grinning face
  '\u{1F60E}', // smiling face with sunglasses
  '\u{1F642}', // slightly smiling face
  '\u{1F637}', // face with medical mask
  '\u{1F916}', // robot
  '\u{1F47D}', // alien
  '\u{1F435}', // monkey face
  '\u{1F431}', // cat face
  '\u{1F648}', // see-no-evil monkey
  '\u{1F480}', // skull
  '\u{2B50}', // star
  '\u{2764}\u{FE0F}', // red heart (VS16 forces the colour glyph)
];

export const DEFAULT_EFFECTS: EffectSettings = {
  kind: 'blur',
  shape: 'rect',
  intensity: 5,
  emoji: EMOJI_CHOICES[0],
};

export const MIN_INTENSITY = 1;
export const MAX_INTENSITY = 10;

// Intensity 1-10 -> Image blurRadius. Keeps the low end usable (still
// recognisably blurred) and the high end fully anonymising.
export function blurRadiusFor(intensity: number) {
  return Math.round(8 + (intensity - MIN_INTENSITY) * 4.5);
}

export type PhotoRef = {
  photoUri?: string;
  mock?: MockPhoto;
};

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Editor: PhotoRef;
  Crop: PhotoRef & { onConfirm: (region: BlurRegion) => void };
  Effects: { settings: EffectSettings; onApply: (settings: EffectSettings) => void };
  SavedFiles: PhotoRef & { fileName: string; fileSizeMB: number; regionsCount: number };
};
