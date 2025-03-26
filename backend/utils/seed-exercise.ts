import json from "share/exercises/exercises.json";
import { db } from "../db";
import { Exercise, exercises } from "../db/schema/exercise";

/**
 * Seeds the database with the exercise data from exercises.json
 *
 */
export const seedExercise = async () => {
  const exercisesData = json.exercises;
  for (const exercise of exercisesData) {
    let {
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
