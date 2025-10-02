import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';

import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';

import { toast } from 'sonner-native';

import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { round } from '~/utils/misc/round-numbers';
import { Text } from '~/components/ui/text';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '~/components/ui/collapsible';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack, YStack } from '~/components/ui/Stacks';

interface TDEEForm {
  sex: 'male' | 'female';
  age?: number;
  weight?: number;
  height?: number;
  activity: number;
}

const activityFactor = [1.2, 1.375, 1.55, 1.725, 1.9, 2.4] as const;

const TDEECalculator = () => {
  const { t } = useTranslation();
  const measurements = useMeasurementStore((s) => s.data);
  const colors = useColors();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    let weight: number | undefined;
    let height: number | undefined;
    for (let i = measurements.length - 1; i >= 0; i--) {
      const data = measurements[i];
      if (data.weight && !weight) {
        weight = data.weight;
      }
      if (data.height && !height) {
        height = data.height;
      }
      if (weight && height) break;
    }
    setForm((prevState) => ({ ...prevState, weight, height }));
  }, [measurements]);

  const [form, setForm] = useState<TDEEForm>({ sex: 'male', activity: 0 });

  const handleChange = useCallback(
    (key: keyof TDEEForm) => (val: TDEEForm[typeof key]) => {
      setForm((prevState) => ({ ...prevState, [key]: val }));
    },
    []
  );

  const getBMR = useCallback(() => {
    if (!form.weight || !form.height || !form.age) {
      throw new Error(t('tools.all_fields_are_required'));
    }
    let basic = 10 * form.weight + 6.25 * form.height - 5 * form.age;
    if (form.sex === 'male') {
      return round(basic + 5);
    } else {
      return round(basic - 161);
    }
  }, [form]);
  const getTDEE = useCallback(() => {
    try {
      const bmr = getBMR();
      toast.success(round(bmr * activityFactor[form.activity]).toString());
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [form, getBMR]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: t('tools.tdee_calculator') }} />
      <SafeAreaView className="relative p-4 pb-16">
        <ScrollView>
          <Collapsible className="w-full bg-muted rounded-md p-4 my-4">
            <CollapsibleTrigger>
              <XStack
                fill={false}
                padding="none"
                className="bg-transparent w-full"
                align="center"
                justify="between">
                <XStack fill={false} padding="none" className="bg-transparent">
                  <ThemedIcon name="MessageCircleQuestion" />
                  <Text className="text-lg">{t('tools.not_sure_how_to_use?')}</Text>
                </XStack>
                <View className="p-2">
                  <ThemedIcon name="ChevronsDownUp" size={16} />
                </View>
              </XStack>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 border-t-2 border-t-border pt-2 duration-200">
              <Text>{t('tools.tdee_description')}</Text>
            </CollapsibleContent>
          </Collapsible>
          <YStack padding="none">
            <XStack fill={false} padding="none" justify="between" align="center">
              <View>
                <Text className="text-lg font-bold">{t('tools.sex')}:</Text>
              </View>
              <View>
                <RadioGroup
                  value={form.sex}
                  onValueChange={handleChange('sex') as (val: string) => void}
                  className="flex flex-row justify-around items-center">
                  <RadioGroupItem value="male" id="male" />
                  <Label
                    htmlFor="male"
                    className="text-lg"
                    onPress={() => handleChange('sex')('male')}>
                    {t('tools.male')}
                  </Label>
                  <RadioGroupItem value="female" id="female" />
                  <Label
                    htmlFor="female"
                    className="text-lg"
                    onPress={() => handleChange('sex')('female')}>
                    {t('tools.female')}
                  </Label>
                </RadioGroup>
              </View>
            </XStack>
            <XStack fill={false} padding="none" justify="between" align="center">
              <Text className="text-lg font-bold">{t('tools.age')}:</Text>
              <Input
                className="text-lg flex-1 text-center"
                value={form.age?.toString()}
                inputMode="numeric"
                selectTextOnFocus
                onChangeText={(s) => handleChange('age')(Number(s))}></Input>
            </XStack>
            <XStack fill={false} padding="none" justify="between" align="center">
              <Text className="text-lg font-bold">{t('measurement.weight')}:</Text>
              <Input
                className="text-lg flex-1 text-center"
                value={form.weight?.toString()}
                inputMode="numeric"
                selectTextOnFocus
                onChangeText={(s) => handleChange('weight')(Number(s))}></Input>
              <Text>{t('unit.kg')}</Text>
            </XStack>
            <XStack fill={false} padding="none" justify="between" align="center">
              <Text className="text-lg font-bold">{t('measurement.height')}:</Text>
              <Input
                className="text-lg flex-1 text-center"
                value={form.height?.toString()}
                inputMode="numeric"
                selectTextOnFocus
                onChangeText={(s) => handleChange('height')(Number(s))}></Input>
              <Text>{t('unit.cm')}</Text>
            </XStack>
            <XStack fill={false} padding="none" justify="between" align="center">
              <Text className="text-lg">{t('tools.activity_level')}:</Text>
              <RNPickerSelect
                onValueChange={handleChange('activity')}
                value={form.activity}
                placeholder={t('tools.activity_level')}
                style={{
                  inputAndroid: {
                    fontSize: 16,
                    paddingRight: 12,
                    color: colors.text,
                    borderColor: colors.border,
                    borderRadius: 12,
                  },
                  inputIOS: {
                    fontSize: 16,
                    color: colors.text,
                  },
                }}
                items={[
                  {
                    label: t('tools.little_or_no_exercise'),
                    value: 0,
                    key: 'no',
                  },
                  { label: t('tools.light_exercise'), value: 1, key: 'light' },
                  {
                    label: t('tools.moderate_exercise'),
                    value: 2,
                    key: 'moderate',
                  },
                  {
                    label: t('tools.heavy_exercise'),
                    value: 3,
                    key: 'heavy',
                  },
                  {
                    label: t('tools.physical_job_or_hard_exercise'),
                    value: 4,
                    key: 'hard',
                  },
                  {
                    label: t('tools.professional_athelete'),
                    value: 5,
                    key: 'athelete',
                  },
                ]}
                Icon={() => <></>}
                darkTheme={colorScheme === 'dark'}
                useNativeAndroidPickerStyle={false}
              />
            </XStack>
            <Button className="w-full" onPress={getTDEE}>
              <Text>{t('tools.calculate')}</Text>
            </Button>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default TDEECalculator;

// t("tools.little_or_no_exercise");
// t("tools.light_exercise");
// t("tools.moderate_exercise");
// t("tools.heavy_exercise")
// t("tools.physical_job_or_hard_exercise")
// t("tools.professional_athelete")
