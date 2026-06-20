import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import FaceDetection from '@react-native-ml-kit/face-detection';
import type { BlurRegion } from '../navigation/types';

export type DetectionResult = {
  // Normalized image to display. Orientation is baked in so the detected
  // boxes line up exactly with what the user sees.
  uri: string;
  width: number;
  height: number;
  regions: BlurRegion[];
};

// Reuse the placeholder tones so detected-face chips keep the original look.
const TONES = ['#b3bdc7', '#c4cbb9', '#aeb6c8', '#c9b8a6', '#a9c0b5', '#bcae9e'];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Runs Google ML Kit face detection fully on-device (no network) on a single
 * image and returns blur regions expressed as fractions (0-1) of the image, so
 * they scale to any display size.
 */
export async function detectFaces(sourceUri: string): Promise<DetectionResult> {
  // Re-encode the image first. This bakes in any EXIF rotation and gives us the
  // upright pixel dimensions that ML Kit's coordinates are relative to.
  const context = ImageManipulator.manipulate(sourceUri);
  const rendered = await context.renderAsync();
  const image = await rendered.saveAsync({ compress: 1, format: SaveFormat.JPEG });

  const faces = await FaceDetection.detect(image.uri, {
    performanceMode: 'accurate',
    landmarkMode: 'none',
    contourMode: 'none',
  });

  const { width, height } = image;
  const regions: BlurRegion[] = await Promise.all(
    faces.map(async (f, i) => {
      const thumbUri = await cropFace(image.uri, f.frame, width, height);
      return {
        id: `face-${Date.now()}-${i}`,
        x: clamp01(f.frame.left / width),
        y: clamp01(f.frame.top / height),
        w: clamp01(f.frame.width / width),
        h: clamp01(f.frame.height / height),
        tone: TONES[i % TONES.length],
        blurred: false,
        kind: 'face' as const,
        thumbUri,
      };
    })
  );

  return { uri: image.uri, width, height, regions };
}

type Frame = { left: number; top: number; width: number; height: number };

// Crops a single face (with a little padding) out of the image so it can be
// shown as the thumbnail in the "Faces Detected" row.
async function cropFace(
  uri: string,
  frame: Frame,
  imgW: number,
  imgH: number
): Promise<string | undefined> {
  try {
    const padX = frame.width * 0.2;
    const padY = frame.height * 0.2;
    const originX = Math.max(0, Math.round(frame.left - padX));
    const originY = Math.max(0, Math.round(frame.top - padY));
    const cropW = Math.min(Math.round(frame.width + padX * 2), imgW - originX);
    const cropH = Math.min(Math.round(frame.height + padY * 2), imgH - originY);
    if (cropW <= 0 || cropH <= 0) return undefined;

    const ctx = ImageManipulator.manipulate(uri);
    ctx.crop({ originX, originY, width: cropW, height: cropH });
    const rendered = await ctx.renderAsync();
    const out = await rendered.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    return out.uri;
  } catch {
    return undefined;
  }
}
