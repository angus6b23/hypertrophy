import { RepWeightRecord, Workout } from 'share/interfaces/Records';
import { WeightUnit } from '~/types/units';
import { round } from './round-numbers';
import { minutesPassed } from './time';

export const getSessionVolume = (workout: Workout, unit: WeightUnit) => {
  const volume = workout.exercises.reduce((acc, ex) => {
    if (ex.type === 'reps_with_weight') {
      const record = ex.record as RepWeightRecord[];
      record.forEach((r) => (acc += r.weight * r.reps));
    }
    return acc;
  }, 0);
  return unit === WeightUnit.kg ? round(volume) : round(volume / 2);
};

export const getSessionTime = (workout: Workout) => {
  return minutesPassed(workout.startTime, workout.endTime!);
};
