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

export type PhotoRef = {
  photoUri?: string;
  mock?: MockPhoto;
};

export type RootStackParamList = {
  Home: undefined;
  Editor: PhotoRef;
  Crop: PhotoRef & { onConfirm: (region: BlurRegion) => void };
  SavedFiles: PhotoRef & { fileName: string; fileSizeMB: number; regionsCount: number };
};
