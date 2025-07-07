import { Measurement } from 'share/interfaces/Measurements';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './persist';
interface State {
  data: Measurement[];
}
interface Action {
  add: (data: Measurement) => void;
  update: (localId: string, data: Partial<Measurement>, updateTimeStamp?: boolean) => void;
  delete: (localId: string) => void;
}
export const useMeasurementStore = create<State & Action>()(
  persist<State & Action>(
    (set) => ({
      data: [],
      add: (newData: Measurement) => set((prevState) => ({ data: [newData, ...prevState.data] })),
      update: (localId: string, data: Partial<Measurement>, updateTimeStamp = true) =>
        set((prevState) => ({
          data: prevState.data.map((item) =>
            item.localId === localId
              ? { ...item, ...data, ...(updateTimeStamp && { lastUpdate: new Date() }) }
              : item
          ),
        })),
      delete: (localId: string) =>
        set((prevState) => ({ data: prevState.data.filter((item) => item.localId !== localId) })),
    }),
    { name: 'recordStorage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
