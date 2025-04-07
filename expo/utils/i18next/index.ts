import Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { Locales, resources } from './resources';
import { getLang, setLang } from '../stores/option-store';

const initI18n = async () => {
  // Get saved language from mmkv storage
  let savedLang = getLang as Locales;

  // Search from device languages and try to match available langauges
  if (!savedLang) {
    const deviceLangs = Localization.getLocales();
    for (const lang of deviceLangs) {
      if (lang.languageTag in resources) {
        savedLang = lang.languageTag as Locales;
        setLang(savedLang);
        break;
      }
    }
  }

  // Fall back to en-US if still not found
  if (!savedLang) {
    savedLang = 'en-US';
    setLang(savedLang);
  }
  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: 'en-US',
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
    },
  });
};
initI18n();

export default i18n;
