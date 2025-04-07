import en_US from 'locales/en-US.json';
import zh_TW from 'locales/zh-TW.json';
export const resources = {
  'en-US': { translation: en_US },
  'zh-TW': { translation: zh_TW },
} as const;

export const locales = Array.from(Object.keys(resources)) as Locales[];
export type Locales = keyof typeof resources;

export const localeName = {
  'en-US': 'English',
  'zh-TW': '正體中文',
} as const;
