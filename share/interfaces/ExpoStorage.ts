import { Locales } from "@/expo/utils/i18next/resources";
import { Workout } from "./Records";
import { Measurement } from "./Measurements";

export interface ExpoStorage {
  data: {
    workout: Workout[];
    measurements: Measurement[];
  };
  options: {
    theme: "light" | "dark" | "system";
    language: Locales;
  };
}
