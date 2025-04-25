export interface Measurement {
  id: string;
  userId: string;
  takenBy: 'self' | 'tailor';
  dateTaken: Date;
  height: number;
  weight: number;
  units: 'cm' | 'inches';

  // Upper body
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLength: number;
  bicep: number;
  wrist: number;

  // Lower body
  inseam: number;
  outseam: number;
  thigh: number;
  knee: number;
  calf: number;
  ankle: number;

  // For shirts
  shirtLength: number;

  // For jackets/coats
  jacketLength: number;

  // Notes and fit preferences
  fitPreference: 'slim' | 'regular' | 'relaxed';
  posture?: string;
  rightShoulder?: number;
  leftShoulder?: number;
  notes?: string;

  // Reference photos
  referencePhotoUrls?: string[];
}