import { round } from './round-numbers';

interface WeightReps {
  weight: number;
  reps: number;
}

export interface RmOptions {
  table: 'nsca' | 'brzycki' | 'dos_Remedios';
}

// NSCATABLE only contains prediction for 1 - 10 and 12 reps, 0.77 is duplicated for prediction of 11 reps
export const NSCA_TABLE = [
  1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.75, 0.7, 0.67, 0.65,
] as const;

export const BRZYCKI_TABLE = [
  1, 0.95, 0.9, 0.88, 0.86, 0.83, 0.8, 0.78, 0.76, 0.75, 0.72, 0.7,
] as const;

export const DOS_REMEDIOS_TABLE = [1, 0.92, 0.9, 0.87, 0.85, 0.82, 0.75, 0.7, 0.65, 0.6] as const;

export const predict1RM = (set: WeightReps, options?: RmOptions) => {
  let { weight, reps } = set;
  if (reps <= 0) return 0;

  if (options?.table === 'brzycki') {
    reps = Math.min(12, reps);
    const factor = BRZYCKI_TABLE[reps - 1];
    return round(weight / factor);
  } else if (options?.table === 'dos_Remedios') {
    reps = Math.min(15, reps);
    let factor;
    if (reps <= 6) {
      factor = DOS_REMEDIOS_TABLE[reps - 1];
    } else if (reps === 7 || reps === 8) {
      factor = DOS_REMEDIOS_TABLE[6];
    } else if (reps === 9 || reps === 10) {
      factor = DOS_REMEDIOS_TABLE[7];
    } else if (reps === 11 || reps === 12) {
      factor = DOS_REMEDIOS_TABLE[8];
    } else {
      factor = DOS_REMEDIOS_TABLE[9];
    }
    return round(weight / factor);
  } else {
    reps = Math.min(15, reps);
    let factor;
    if (reps <= 12) {
      factor = NSCA_TABLE[reps - 1];
    } else {
      factor = NSCA_TABLE[12];
    }
    return round(weight / factor);
  }
};
