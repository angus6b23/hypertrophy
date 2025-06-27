import { round } from './round-numbers';

interface WeightReps {
  weight: number;
  reps: number;
}

// NSCATABLE only contains prediction for 1 - 10 and 12 reps, 0.77 is duplicated for prediction of 11 reps
const NSCATABLE = [1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.77, 0.75];
export const predict1RM = (set: WeightReps) => {
  let { reps } = set;

  reps = Math.round(reps);
  if (reps <= 0) return 0;

  // Use 12reps for reps larger than 12
  reps = Math.min(11, reps);
  return round(set.weight / NSCATABLE[reps - 1]);
};
