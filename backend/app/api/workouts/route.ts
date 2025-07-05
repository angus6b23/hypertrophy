import {
  addWorkoutController,
  listOwnWorkoutController,
} from "@/controllers/workouts";

export const GET = listOwnWorkoutController;
export const POST = addWorkoutController;
