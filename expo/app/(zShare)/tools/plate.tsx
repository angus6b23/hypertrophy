import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Stack } from 'expo-router';

import { TouchableOpacity, View } from 'react-native';

import { t } from 'i18next';

import { toast } from 'sonner-native';

import { useOptionStore } from '~/utils/stores/option-store';
import { toKg } from '~/utils/misc/unit-conversion';
import { round } from '~/utils/misc/round-numbers';
import { WeightUnit } from '~/types/units';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack, YStack } from '~/components/ui/Stacks';
import { InputError } from 'share/interfaces/error-codes';

const PlateCalculator = () => {
  const { t } = useTranslation();

  const defaultUnit = useOptionStore((state) => state.unit.workoutWeight);
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>(defaultUnit);
  const [barWeight, setBarWeight] = useState('20');
  const [plates, setPlates] = useState<number[]>([]);

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

  const appendPlates = useCallback(
    (weight: number) => () => {
      setPlates((prevState) => [...prevState, weight]);
    },
    []
  );

  const removePlates = useCallback(() => {
    setPlates((prevState) => prevState.slice(0, prevState.length - 1));
  }, []);

  const drawPlates = useCallback(() => {
    return plates
      .map((p) => p)
      .sort((a, b) => a - b)
      .map((plate, i) => {
        switch (plate) {
          case 1.25: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-12 bg-slate-400 rounded-sm border-border border-2"
              />
            );
          }
          case 2.5: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-16 bg-slate-600 rounded-sm border-border border-2"
              />
            );
          }
          case 5: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-24 bg-black rounded-sm border-border border-2"
              />
            );
          }
          case 10: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-24 bg-green-500 rounded-sm border-border border-2"
              />
            );
          }
          case 15: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-24 bg-yellow-300 rounded-sm border-border border-2"
              />
            );
          }
          case 20: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-24 bg-blue-700 rounded-sm border-border border-2"
              />
            );
          }
          case 25: {
            return (
              <View
                key={`${plate},${i}`}
                className="w-[10] h-24 bg-red-600 rounded-sm border-border border-2"
              />
            );
          }
        }
      });
  }, [plates]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: t('tools.plate_calculator') }} />
      <SafeAreaView className="p-4 pt-0">
        <SetWeightDialog
          open={open}
          setOpen={setOpen}
          currWeight={calculateTotal()}
          unit={unit}
          setPlates={setPlates}
          base={Number(barWeight)}
        />
        <XStack fill={false} padding="none" justify="center" align="center">
          <TouchableOpacity className="p-4 pt-0" onPress={() => setOpen(true)}>
            <Text className="text-6xl min-w-24 text-center">{calculateTotal()}</Text>
          </TouchableOpacity>
          <XStack fill={false} padding="none" align="center">
            <Text className="text-2xl">{t(`unit.${unit}`)}</Text>
            <Button variant="ghost" className="p-0" onPress={changeUnit}>
              <ThemedIcon name="ArrowLeftRight" size={18} />
            </Button>
          </XStack>
        </XStack>
        <XStack fill={false} padding="none" justify="center" align="center" className="h-24 gap-1">
          {/* Bar shape */}
          <View className="absolute w-full h-4 bg-slate-300 rounded-md" />
          {/* Left side plates */}
          <XStack fill={false} padding="none" className="h-24 bg-transparent gap-1" align="center">
            {drawPlates()}
          </XStack>
          {/* Center empty spaces */}
          <View className="w-4 h-8 bg-slate-300 mr-36" />
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
          <XStack fill={false} padding="none" justify="around" className="flex-wrap">
            <Button
              className="w-32 aspect-square bg-zinc-200"
              onPress={removePlates}
              disabled={plates.length === 0}>
              <Text className="text-2xl text-black text-center">{t('tools.remove_plate')}</Text>
            </Button>
            <Button className="w-32 aspect-square bg-slate-400" onPress={appendPlates(1.25)}>
              <Text className="text-2xl text-white">
                {unit === WeightUnit.kg ? `+ 1.25 ${t('unit.kg')}` : `+ 2.75 ${t('unit.lbs')}`}
              </Text>
            </Button>
            <Button className="w-32 aspect-square bg-slate-600" onPress={appendPlates(2.5)}>
              <Text className="text-2xl text-white">
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

const SetWeightDialog = ({
  open,
  setOpen,
  currWeight,
  unit,
  base,
  setPlates,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currWeight: number;
  unit: WeightUnit;
  base: number;
  setPlates: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const [val, setVal] = useState(currWeight);

  const handleEnter = useCallback(() => {
    let weight = Number(val);
    const res: number[] = [];

    if (isNaN(weight)) {
      toast.error(InputError.not_number);
    }
    if (isNaN(base)) {
      toast.error(InputError.not_number);
    }
    weight = unit === WeightUnit.kg ? Number(val) : toKg(Number(val), WeightUnit.lbs);
    weight -= base;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    while (weight > 2.5) {
      for (const plate of plates) {
        if (weight >= plate * 2) {
          weight -= plate * 2;
          res.push(plate);
          break;
        }
      }
    }
    setPlates(res);
  }, [val, unit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('tools.set_weight')}</DialogTitle>
          <DialogDescription>
            <YStack padding="none" fill={false}>
              <Text>{t('tools.i_want_to_see_a_bar_with')}</Text>
              <XStack fill={false} padding="none" align="center">
                <Input
                  autoFocus
                  inputMode="numeric"
                  className="flex-1"
                  value={val.toString()}
                  selectTextOnFocus
                  onChangeText={(s) => setVal(s)}
                />
                <Text className="">{t(`unit.${unit}`)}</Text>
              </XStack>
            </YStack>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild>
              <Button className="flex-1" onPress={handleEnter}>
                <Text>{t('common.enter')}</Text>
              </Button>
            </DialogClose>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default PlateCalculator;
