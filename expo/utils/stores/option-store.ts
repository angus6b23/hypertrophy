import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './persist';

import { LengthUnit, WeightUnit } from '~/types/units';
import { Locales } from '~/utils/i18next/resources';
type State = {
  theme: 'light' | 'dark' | 'system';
  language: Locales;
  unit: {
    workoutWeight: WeightUnit;
    measurementWeight: WeightUnit;
    measurementLength: LengthUnit;
  };
};

type Action = {
  changeTheme: (theme: State['theme']) => void;
  changeLanguage: (lang: State['language']) => void;
  changeUnit: (type: keyof State['unit'], payload: WeightUnit | LengthUnit) => void;
};

export const useOptionStore = create<State & Action>()(
  persist<State & Action>(
    (set) => ({
      theme: 'system',
      language: 'en-US',
      unit: {
        workoutWeight: WeightUnit.kg,
        measurementWeight: WeightUnit.kg,
        measurementLength: LengthUnit.cm,
      },
      changeTheme: (theme) => set(() => ({ theme })),
      changeLanguage: (lang) => set(() => ({ language: lang })),
      changeUnit: (type, payload) =>
        set((prevState) => ({ unit: { ...prevState.unit, [type]: payload } })),
    }),
    {
      name: 'optionStorage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export const getLang = useOptionStore.getState().language;
export const setLang = (lang: Locales) => useOptionStore.setState({ language: lang });
