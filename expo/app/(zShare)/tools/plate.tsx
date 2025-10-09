import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Stack } from 'expo-router';

import { View } from 'react-native';

import { round } from '~/utils/misc/round-numbers';
import { WeightUnit } from '~/types/units';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack } from '~/components/ui/Stacks';

const PlateCalculator = () => {
  const { t } = useTranslation();

  const [total, setTotal] = useState(0);
  const [unit, setUnit] = useState<WeightUnit>(WeightUnit.kg);
  const [barWeight, setBarWeight] = useState('20');
  const [plates, setPlates] = useState<Number[]>([]);

  const changeUnit = useCallback(() => {
    setUnit((prevState) => (prevState === WeightUnit.kg ? WeightUnit.lbs : WeightUnit.kg));
  }, []);

  const calculateTotal = useCallback(() => {
    let total = Number(barWeight);
    plates.forEach((weight) => {
      total += weight * 2;
    });
    return unit === WeightUnit.kg ? round(total) : round(total * 2.2);
  }, [barWeight, plates, unit]);

  const appendPlates = (weight: number) => () => {
    setPlates((prevState) => [...prevState, weight]);
  };

  const drawPlates = useCallback(() => {
    return plates
      .sort((a, b) => a - b)
      .map((plate) => {
        switch (plate) {
          case 1.25: {
            return <View className="w-[10] h-12 bg-slate-600 rounded-sm" />;
          }
          case 2.5: {
            return <View className="w-[10] h-16 bg-slate-500 rounded-sm" />;
          }
          case 5: {
            return <View className="w-[10] h-24 bg-black rounded-sm" />;
          }
          case 10: {
            return <View className="w-[10] h-24 bg-green-500 rounded-sm" />;
          }
          case 15: {
            return <View className="w-[10] h-24 bg-yellow-300 rounded-sm" />;
          }
          case 20: {
            return <View className="w-[10] h-24 bg-blue-700 rounded-sm" />;
          }
          case 25: {
            return <View className="w-[10] h-24 bg-red-600 rounded-sm" />;
          }
        }
      });
  }, [plates]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: t('tools.plate_calculator') }} />
      <SafeAreaView className="flex-1 relative p-4">
        <XStack fill={false} padding="none" justify="center" align="center">
          <Text className="text-6xl min-w-24 text-center">{calculateTotal()}</Text>
          <XStack fill={false} padding="none" align="center">
            <Text className="text-2xl">{t(`unit.${unit}`)}</Text>
            <Button variant="ghost" className="p-0" onPress={changeUnit}>
              <ThemedIcon name="ArrowLeftRight" size={18} />
            </Button>
          </XStack>
        </XStack>
        <XStack fill={false} padding="none" justify="center" align="center" className="h-24">
          {/* Bar shape */}
          <View className="absolute w-full h-4 bg-slate-300 rounded-md" />
          {/* Left side plates */}
          <XStack fill={false} padding="none" className="h-24 bg-transparent gap-1" align="center">
            {drawPlates()}
          </XStack>
          {/* Center empty spaces */}
          <View className="w-4 h-8 bg-slate-300 mr-28" />
          <View className="w-4 h-8 bg-slate-300" />
          <XStack
            fill={false}
            padding="none"
            className="h-24 bg-transparent flex-row-reverse gap-1"
            align="center"
            gap="sm">
            {drawPlates()}
          </XStack>
        </XStack>
        <XStack fill={false} padding="none" className="pt-4" align="center">
          <Text className="text-xl font-bold">{t('tool.bar_weight') + ':'}</Text>
          <Input
            className="flex-1 text-center"
            value={barWeight.toString()}
            inputMode="numeric"
            selectTextOnFocus
            onChangeText={(s) => setBarWeight(s)}
          />
          <Text className="text-xl">{t('unit.kg')}</Text>
        </XStack>
        <XStack fill={false} padding="none" className="pt-4 flex-wrap" justify="center">
          <Button
            className="w-full bg-foreground"
            onPress={() => {
              setPlates([]);
              setBarWeight('20');
            }}>
            <Text className="text-2xl text-background">{t('common.clear')}</Text>
          </Button>
          <XStack fill={false} padding="none" justify="between" className="flex-wrap">
            <Button className="w-32 aspect-square bg-slate-300" onPress={appendPlates(1.25)}>
              <Text className="text-2xl text-black">
                {unit === WeightUnit.kg ? `+ 1.25 ${t('unit.kg')}` : `+ 2.75 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-slate-300" onPress={appendPlates(2.5)}>
              <Text className="text-2xl text-black">
                {unit === WeightUnit.kg ? `+ 2.5 ${t('unit.kg')}` : `+ 5 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-black" onPress={appendPlates(5)}>
              <Text className="text-2xl text-white">
                {unit === WeightUnit.kg ? `+ 5 ${t('unit.kg')}` : `+ 10 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-green-500" onPress={appendPlates(10)}>
              <Text className="text-2xl text-black">
                {unit === WeightUnit.kg ? `+ 10 ${t('unit.kg')}` : `+ 20 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-yellow-300" onPress={appendPlates(15)}>
              <Text className="text-2xl text-black">
                {unit === WeightUnit.kg ? `+ 15 ${t('unit.kg')}` : `+ 30 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-blue-700" onPress={appendPlates(20)}>
              <Text className="text-2xl text-white">
                {unit === WeightUnit.kg ? `+ 20 ${t('unit.kg')}` : `+ 40 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-red-600" onPress={appendPlates(25)}>
              <Text className="text-2xl text-white">
                {unit === WeightUnit.kg ? `+ 25 ${t('unit.kg')}` : `+ 50 ${t('unit.lbs')}`}
              </Text>
            </Button>
          </XStack>
        </XStack>
      </SafeAreaView>
    </>
  );
};

export default PlateCalculator;
