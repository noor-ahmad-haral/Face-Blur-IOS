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
export type EffectKind = 'blur' | 'pixelate' | 'emoji';
export type BlurShape = 'rect' | 'oval';

export type EffectSettings = {
  kind: EffectKind;
  shape: BlurShape;
  // 1-10; mapped to an Image blurRadius when rendering.
  intensity: number;
  // 1-10; mapped to a mosaic block edge. Kept separate from `intensity` so
  // blur and pixelate each remember their own setting.
  pixelSize: number;
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
  pixelSize: 2,
  emoji: EMOJI_CHOICES[0],
};

export const MIN_INTENSITY = 1;
export const MAX_INTENSITY = 10;

// Intensity 1-10 -> Image blurRadius. Keeps the low end usable (still
// recognisably blurred) and the high end fully anonymising.
export function blurRadiusFor(intensity: number) {
  return Math.round(8 + (intensity - MIN_INTENSITY) * 4.5);
}

export const MIN_PIXEL_SIZE = 1;
export const MAX_PIXEL_SIZE = 10;

// Mosaic block edge, in display px, at the two ends of the slider.
const PIXEL_EDGE_MIN = 10;
const PIXEL_EDGE_MAX = 46;
// A region is never split into more blocks than this per side. Each block is a
// view, so without a ceiling a large face at the fine end of the slider would
// cost thousands of them.
const PIXEL_MAX_ACROSS = 16;

// Pixel size 1-10 -> block edge in display px, for a region whose shorter side
// is `minDim`. Blocks are square and sized in screen terms, so a big face gets
// more of them than a small one, the way a real mosaic filter behaves.
export function pixelCellFor(pixelSize: number, minDim: number) {
  const t = (pixelSize - MIN_PIXEL_SIZE) / (MAX_PIXEL_SIZE - MIN_PIXEL_SIZE);
  const requested = PIXEL_EDGE_MIN + t * (PIXEL_EDGE_MAX - PIXEL_EDGE_MIN);
  return Math.max(requested, minDim / PIXEL_MAX_ACROSS);
}

export type PhotoRef = {
  photoUri?: string;
  mock?: MockPhoto;
};

export type RootStackParamList = {
  LanguageSelect: undefined;
  Onboarding: undefined;
  Home: undefined;
  Settings: undefined;
  Editor: PhotoRef;
  Crop: PhotoRef & { onConfirm: (region: BlurRegion) => void };
  Effects: { settings: EffectSettings; onApply: (settings: EffectSettings) => void };
  SavedFiles: PhotoRef & { fileName: string; fileSizeMB: number; regionsCount: number };
};
