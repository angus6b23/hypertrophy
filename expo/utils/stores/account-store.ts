import Constants from 'expo-constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './persist';

const { manifest } = Constants;
type AccountState = {
  instance: string;
  username: string;
  displayName: string;
  isLoggedIn: boolean;
};

type AccountAction = {
  changeInstance: (newInstance: AccountState['instance']) => void;
  login: (names: { username: string; displayName: string }) => void;
  logout: () => void;
};

export const useAccountStore = create<AccountState & AccountAction>()(
  persist<AccountState & AccountAction>(
    (set) => ({
      instance:
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        `http://${manifest.debuggerHost.split(':').shift()}:3000`,
      username: '',
      displayName: '',
      isLoggedIn: false,

      changeInstance: (newInstance) => set(() => ({ instance: newInstance })),
      login: (names) =>
        set(() => ({ username: names.username, displayName: names.displayName, isLoggedIn: true })),
      logout: () => set(() => ({ username: '', displayName: '', isLoggedIn: false })),
    }),
    {
      name: 'optionStorage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export const instance = useAccountStore.getState().instance as string;
