import json from "share/exercises/exercises.json";
import { db } from "../db";
import { exercises } from "../db/schema/exercise";

import { Exercise as ExerciseType } from "share/exercises/types/exercise";
/**
 * Seeds the database with the exercise data from exercises.json
 *
 */
export const seedExercise = async () => {
  const exercisesData: ExerciseType[] = json.exercises;
  for (const exercise of exercisesData) {
    const {
      name,
      mechanic,
      force,
      category,
      primaryMuscles,
      secondaryMuscles,
      equipment,
      instructions,
    } = exercise;
    await db
      .insert(exercises)
      .values({
        name,
        mechanic,
        force,
        category,
        primaryMuscles,
        secondaryMuscles,
        equipment,
        description: instructions.join("\n"),
        recordType: "reps_with_weight",
      })
      .onConflictDoNothing();
  }
};

seedExercise();
