import { TouchableNativeFeedback, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';

import { UnitConversion } from '~/utils/misc/unit-conversion';
import usePicker, { PickerItem } from '~/utils/hooks/use-picker';
import {
  EnergyUnit,
  LengthUnit,
  WeightUnit,
  energyUnits,
  lengthUnits,
  weightUnits,
} from '~/types/units';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack } from '~/components/ui/Stacks';
import { CustomTab } from '~/components/ui/CustomTab';

const UnitPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('tools.unit_convertor'), headerShown: true }} />
      <CustomTab
        routes={[
          {
            key: 'length',
            icon: 'Ruler',
            title: t('unit.length'),
          },
          {
            key: 'weight',
            icon: 'Weight',
            title: t('unit.weight'),
          },
          {
            key: 'energy',
            icon: 'Flame',
            title: t('unit.energy'),
          },
        ]}
        screens={({ route }) => {
          switch (route.key) {
            case 'weight':
              return (
                <MainView
                  items={weightUnits}
                  defaultInputUnit={WeightUnit.kg}
                  defaultOutputUnit={WeightUnit.lbs}
                  conversion={UnitConversion.weight.convert}
                />
              );
            case 'length':
              return (
                <MainView
                  items={lengthUnits}
                  defaultInputUnit={LengthUnit.m}
                  defaultOutputUnit={LengthUnit.feet}
                  conversion={UnitConversion.length.convert}
                />
              );
            case 'energy':
              return (
                <MainView
                  items={energyUnits}
                  defaultInputUnit={EnergyUnit.joule}
                  defaultOutputUnit={EnergyUnit.kcal}
                  conversion={UnitConversion.energy.convert}
                />
              );
            default:
              return <></>;
          }
        }}
        tabViewProps={{
          swipeEnabled: false,
          animationEnabled: false,
        }}
        tabBarProps={{ scrollEnabled: false }}
      />
    </>
  );
};

const MainView = <T,>({
  items,
  defaultInputUnit,
  defaultOutputUnit,
  conversion,
}: {
  items: PickerItem<string>[];
  defaultInputUnit: T;
  defaultOutputUnit: T;
  conversion: (val: number, from: T, to: T) => number;
}) => {
  const [input, setInput] = useState<string>('0');
  const [inputUnit, setInputUnit] = useState(defaultInputUnit);
  const [outputUnit, setOutputUnit] = useState(defaultOutputUnit);
  const [inputDialog, inputTrigger] = usePicker<any>({ items, onSelect: setInputUnit });
  const [outputDialog, outputTrigger] = usePicker<any>({
    items: items.filter(({ value }) => value !== inputUnit),
    onSelect: setOutputUnit,
  });

  const swapUnits = useCallback(() => {
    const temp = outputUnit;
    setOutputUnit(inputUnit);
    setInputUnit(temp);
  }, [inputUnit, outputUnit]);

  const getOutput = useCallback(() => {
    return conversion(Number(input), inputUnit, outputUnit);
  }, [inputUnit, outputUnit, input]);

  useEffect(() => {
    if (inputUnit === outputUnit) {
      const newUnit = items.find(({ value }) => value !== inputUnit);
      if (newUnit) {
        setOutputUnit(newUnit.value as T);
      }
    }
  }, [inputUnit]);

  const { t } = useTranslation();
  return (
    <>
      {inputDialog}
      {outputDialog}
      <View className="w-full bg-green-500 flex justify-center">
        <TouchableNativeFeedback onPress={inputTrigger}>
          <View className="bg-secondary p-4">
            <Text className="text-2xl">{t(`unit.${inputUnit}`)}</Text>
            <XStack fill={false} className="bg-transparent" justify="end" align="end">
              <Input
                className="!text-6xl !h-20 translate-y-4 min-w-32 bg-transparent text-right !align-text-bottom"
                keyboardType="number-pad"
                value={input}
                onChangeText={setInput}></Input>
              <View className="bg-background rounded-md">
                <Text className="text-2xl p-2 w-12 text-center aspect-square">
                  {inputUnit as string}
                </Text>
              </View>
            </XStack>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={swapUnits}>
          <View className="bg-background flex-row justify-center flex p-2 w-full">
            <ThemedIcon name="ArrowUpDown" size={24} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={outputTrigger}>
          <View className="bg-background p-4">
            <Text className="text-2xl">{t(`unit.${outputUnit}`)}</Text>
            <XStack fill={false} className="bg-transparent" justify="end" align="end">
              <Text className="text-6xl translate-y-4 p-2">{getOutput()}</Text>
              <View className="bg-secondary rounded-md">
                <Text className="text-2xl p-2 w-12 text-center aspect-square">
                  {outputUnit as string}
                </Text>
              </View>
            </XStack>
          </View>
        </TouchableNativeFeedback>
      </View>
    </>
  );
};

export default UnitPage;
