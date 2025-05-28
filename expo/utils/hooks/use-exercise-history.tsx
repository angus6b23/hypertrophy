import {
  CardioRecord,
  RepRecord,
  RepWeightRecord,
  SetType,
  TimeRecord,
} from 'share/interfaces/Records';
import { useWorkoutStore } from '../stores/session-store';
import exerciseData from 'share/exercises/exercises.json';

export const useExerciseHistory = (id: number) => {
  const { workouts } = useWorkoutStore();
  const targetRecord = workouts.findLast((w) => w.exercises.some((e) => e.exerciseId === id));
  const recordType =
    exerciseData.exercises.find((item) => item.id === id)?.record_type || 'reps_with_weight';

  const defaultRepWithWeightRecord = new Array(3).fill({
    weight: 10,
    reps: 10,
    type: SetType.normal,
  }) as RepWeightRecord[];
  const defaultRepRecord = new Array(3).fill({
    reps: 10,
    type: SetType.normal,
  }) as RepRecord[];
  const defaultTimeRecord = new Array(3).fill({ time: 60 }) as TimeRecord[];
  const defaultCardioRecord = {
    time: 30 * 60,
  } as CardioRecord;

  if (!targetRecord) {
    switch (recordType) {
      case 'reps_with_weight':
        return { type: recordType, record: defaultRepWithWeightRecord };
      case 'reps':
        return { type: recordType, record: defaultRepRecord };
      case 'time':
        return { type: recordType, record: defaultTimeRecord };
      case 'cardio':
        return { type: recordType, record: defaultCardioRecord };
      default:
        throw new Error('unknown record type');
    }
  } else {
    return {
      type: recordType,
      record: targetRecord.exercises.find((e) => e.exerciseId === id)!.record! as
        | RepRecord[]
        | CardioRecord
        | RepWeightRecord[]
        | TimeRecord[],
    };
  }
};
