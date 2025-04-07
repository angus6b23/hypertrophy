import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { OptionListItem } from './option-list-item';

import { List } from '~/components/ui/List';
import { YStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { LengthUnit, WeightUnit } from '~/types/units';
import { localeName, Locales, locales } from '~/utils/i18next/resources';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { useOptionStore } from '~/utils/stores/option-store';

function OptionPage() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('common.options'), headerShown: true }} />
      <ScrollView>
        <YStack gap="lg">
          <UISettings />
          <UnitSettings />
        </YStack>
      </ScrollView>
    </>
  );
}

const UISettings = () => {
  const { t, i18n } = useTranslation();

  const { setColorScheme } = useColorScheme();
  const options = useOptionStore();
  const handleThemeChange = useCallback((val: typeof options.theme) => {
    options.changeTheme(val);
    setColorScheme(val);
  }, []);
  const handleLanguageChange = useCallback((val: Locales) => {
    options.changeLanguage(val);
    i18n.changeLanguage(val);
  }, []);
  const getLanguages = useCallback(() => {
    return locales.map((locale) => {
      return {
        label: localeName[locale],
        value: locale,
      };
    });
  }, []);
  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('common.UI')}</Text>
        <List>
          <OptionListItem
            value={options.theme}
            onValueChange={handleThemeChange}
            label={t('common.theme')}
            icon="SunMoon"
            items={[
              { label: t('common.system'), value: 'system', key: 'system' },
              { label: t('common.light'), value: 'light', key: 'light' },
              { label: t('common.dark'), value: 'dark', key: 'dark' },
            ]}
          />
          <OptionListItem
            value={options.language}
            onValueChange={handleLanguageChange}
            label={t('common.language')}
            items={getLanguages()}
            icon="Languages"
          />
        </List>
      </YStack>
    </>
  );
};

export const UnitSettings = () => {
  const { t } = useTranslation();
  const options = useOptionStore();

  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('option.preferred_units')}</Text>
        <List>
          <OptionListItem
            value={options.unit.workoutWeight}
            onValueChange={(val: WeightUnit) => options.changeUnit('workoutWeight', val)}
            label={t('unit.workout_weight')}
            icon="Dumbbell"
            items={[
              { label: t('unit.kg'), value: WeightUnit.kg },
              { label: t('unit.lbs'), value: WeightUnit.lbs },
            ]}
          />
          <OptionListItem
            value={options.unit.measurementWeight}
            onValueChange={(val: WeightUnit) => {
              options.changeUnit('measurementWeight', val);
            }}
            label={t('unit.measurement_weight')}
            icon="Weight"
            items={[
              { label: t('unit.kg'), value: WeightUnit.kg },
              { label: t('unit.lbs'), value: WeightUnit.lbs },
            ]}
          />
          <OptionListItem
            value={options.unit.measurementLength}
            onValueChange={(val: LengthUnit) => options.changeUnit('measurementLength', val)}
            label={t('unit.measurement_length')}
            icon="Ruler"
            items={[
              { label: t('unit.cm'), value: LengthUnit.cm },
              { label: t('unit.inch'), value: LengthUnit.inch },
              { label: t('unit.feet'), value: LengthUnit.feet },
            ]}
          />
        </List>
      </YStack>
    </>
  );
};
export default OptionPage;
