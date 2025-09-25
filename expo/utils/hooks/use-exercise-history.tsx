import { PlanExercise } from 'share/interfaces/Workout';
import {
  AnyRecord,
  CardioRecord,
  RepRecord,
  RepWeightRecord,
  SetType,
  TimeRecord,
} from 'share/interfaces/Records';
import { RecordType } from 'share/exercises/types/exercise';
import exerciseData from 'share/exercises/exercises.json';
import { useWorkoutStore } from '../stores/session-store';

type MultiRecord = RepRecord[] | RepWeightRecord[] | TimeRecord[];

export const useExerciseHistory = (
  exercise: PlanExercise
): { type: RecordType; record: AnyRecord } => {
  const { exerciseId: id } = exercise;
  const workouts = useWorkoutStore((s) => s.workouts);
  const currentSession = useWorkoutStore((s) => s.current);

  // Current record defined as record in current session
  const currentRecord = currentSession?.exercises.find((ex) => ex.exerciseId === id);
  const previousSession = workouts.findLast((w) => w.exercises.some((e) => e.exerciseId === id));

  // Previous record defined as the latest record in ended previous sesesions
  const previousRecord = previousSession?.exercises.find((e) => e.exerciseId === id);
  const recordType = exerciseData.exercises.find((item) => item.id === id)!
    .record_type as RecordType;

  const defaultRepWithWeightRecord = new Array(exercise.targetSets || 3).fill({
    weight: 0,
    reps: exercise.targetReps || 10,
    type: SetType.normal,
  }) as RepWeightRecord[];

  const defaultRepRecord = new Array(exercise.targetSets || 3).fill({
    reps: exercise.targetReps || 10,
    type: SetType.normal,
  }) as RepRecord[];

  const defaultTimeRecord = new Array(exercise.targetSets || 3).fill({ time: 60 }) as TimeRecord[];

  const defaultCardioRecord = {
    time: 30 * 60,
  } as CardioRecord;

  if (!previousRecord && !currentRecord) {
    // Return default prefilled records if current and previous record not found
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
  } else if (currentRecord && previousRecord && recordType !== RecordType.cardio) {
    // If both current record and previous record exist, return the one with longer length
    return {
      type: recordType,
      record:
        (currentRecord?.record as MultiRecord).length! >
        (previousRecord?.record as MultiRecord).length!
          ? (currentRecord.record as AnyRecord)
          : generateRecord(previousRecord.record as MultiRecord, exercise),
    };
  } else if (previousRecord && recordType !== 'cardio') {
    // Fill the previous record to target sets if previous record lenght is smaller than  that
    return {
      type: recordType,
      record: generateRecord(previousRecord.record as MultiRecord, exercise),
    };
  } else {
    return {
      type: recordType,
      record: currentRecord?.record || (previousRecord?.record as AnyRecord),
    };
  }
};

const generateRecord = (record: MultiRecord, planExercise: PlanExercise) => {
  if (record.length >= (planExercise.targetSets || 3)) return record;
  return new Array(planExercise.targetSets || 3).fill(null).map((_, i) => {
    if (i <= record.length - 1) {
      return record[i];
    } else {
      return record[record.length - 1];
    }
  }) as AnyRecord;
};
