export interface Measurement {
  date: Date;
  weight?: number | null;
  height?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  localId: string;
}
