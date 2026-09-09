// Brand blue, matched to the promo artwork heading. Every blue in the app
// derives from this one value — change it here and the whole app follows.
const brand = '#2563EB';

export const colors = {
  ink: '#0E1318',
  frame: '#2a313b',
  chip: '#1b2129',

  // Light tint of the brand hue, for anything *drawn* on the dark UI: icon
  // strokes, accent text, borders, active states. The brand blue itself only
  // reaches 3.6:1 against the near-black background, where this reaches 8.7:1.
  peri: '#8FB0FF',

  // Primary fill (buttons, the lock mark). Always label it with `onBlue`:
  // white on brand is 5.2:1, whereas the dark `onBtn` would be 2.3:1.
  blue: brand,
  brand,
  onBlue: '#FFFFFF',

  // Text and icons sitting on the light `peri` fills — 5.6:1.
  onBtn: '#2a3656',

  white: '#FFFFFF',
  mutedD: '#8a95a1',
  line: '#3a4250',
  green: '#3FB950',
  star: '#F5C518',
  card: '#252b34',
  cardDivider: '#ffffff10',
};

export const fonts = {
  display: undefined as string | undefined, // system default; matches Poppins fallback stack
};
