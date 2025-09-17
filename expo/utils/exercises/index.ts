import { Exercise } from 'share/exercises/types/exercise';
import { exercises } from 'share/exercises/exercises.json';

export const getExerciseById = (id: number) => exercises.find((e) => e.id === id) as Exercise;
