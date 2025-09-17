import DateTimePicker from '@react-native-community/datetimepicker';
import { Label } from '@rn-primitives/dropdown-menu';
import { InsertMeasurementSchema } from 'backend/db/schema/measurements';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import { Measurement } from 'share/interfaces/Measurements';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { FormField } from '~/components/ui/FormField';
import { XStack, YStack } from '~/components/ui/Stacks';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { LengthUnit, WeightUnit, lengthUnits, weightUnits } from '~/types/units';
import { backend } from '~/utils/backend';
import { removeNullValues } from '~/utils/misc/remove-null-values';
import { toCm, toKg } from '~/utils/misc/unit-conversion';
import { useAccountStore } from '~/utils/stores/account-store';
import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { useOptionStore } from '~/utils/stores/option-store';

export const MeasurementModal = () => {
  const { t } = useTranslation();
  // Store states and functions
  const data = useMeasurementStore((state) => state.data);
  const add = useMeasurementStore((state) => state.add);
  const update = useMeasurementStore((state) => state.update);
  const preferredUnit = useOptionStore((state) => state.unit);
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const language = useOptionStore((s) => s.language);

  const router = useRouter();
  const { id } = useLocalSearchParams();

  // State for form
  const [state, setState] = useState<Measurement>({
    date: new Date(),
    id: null,
    localId: nanoid(10),
    weight: null,
    height: null,
    bodyFat: null,
    chest: null,
    waist: null,
    hip: null,
    lastUpdate: new Date(),
  });

  // State for existing record
  const [recordExist, setRecordExist] = useState(false);
  // State for units in form
  const [unit, setUnits] = useState({
    weight: preferredUnit.measurementWeight,
    height: preferredUnit.measurementLength,
    chest: preferredUnit.measurementLength,
    waist: preferredUnit.measurementLength,
    hip: preferredUnit.measurementLength,
  });
  // State for date picker dispaly
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search for record and form state when id changes
  useEffect(() => {
    if (id) {
      const record = data.find((item) => item.localId === id);
      if (record) {
        setRecordExist(true);
        setState(record);
      }
    }
  }, [id, data]);

  const handleUnitChange = useCallback(
    (type: keyof typeof unit, newUnit: WeightUnit | LengthUnit) => {
      setUnits((prevState) => ({ ...prevState, [type]: newUnit }));
    },
    [setUnits]
  );
  const handleFormChange = useCallback(
    (key: keyof typeof state, value: Date | string | number | null) => {
      if (value === 0) value = null;
      setState((prevState) => ({ ...prevState, [key]: value ?? null }));
    },
    [setState]
  );
  const handleSubmit = useCallback(async () => {
    // Helper Function for handling conversion of units
    const unitChange = (data: Measurement) => {
      data.weight = data.weight ? toKg(Number(data.weight), unit.weight) : null;
      data.height = data.height ? toCm(Number(data.height), unit.height) : null;
      data.bodyFat = data.bodyFat ? Number(data.bodyFat) : null;
      data.hip = data.hip ? toCm(Number(data.hip), unit.hip) : null;
      data.chest = data.chest ? toCm(Number(data.chest), unit.chest) : null;
      data.waist = data.waist ? toCm(Number(data.waist), unit.waist) : null;
      return data;
    };
    // Parse and validate data
    const result = InsertMeasurementSchema.omit({ id: true, ownerId: true }).safeParse(
      unitChange(state)
    );

    // Throw error if parsing not success
    if (!result.success || !result.data) {
      toast.error(result.error.errors[0].message);
      console.error(result.error);
      return;
    }
    // Remove null fields from result
    removeNullValues(result.data);

    const newRecord = result.data as Measurement;
    // Check for fields entered (date, localId and any one of the field)
    if (Object.keys(newRecord!).length < 3) {
      toast.error(t('message.no_field_entered'));
      return;
    }

    // Update records locally and remotely
    if (recordExist) {
      update(newRecord.localId, newRecord);
      if (isLoggedIn) {
        try {
          if (newRecord.id) {
            await backend.measurement.update(newRecord);
          } else {
            const res = await backend.measurement.add(newRecord);
            update(newRecord.localId, res);
          }
        } catch (error) {
          toast.error((error as Error).message);
        }
      }
      toast.success(t('message.meaasurement_updated'));
      router.back();
    } else {
      // Add new record locally and remotely
      add(newRecord);
      if (isLoggedIn) {
        try {
          const res = await backend.measurement.add(newRecord);
          update(newRecord.localId, res);
        } catch (err) {
          toast.error((err as Error).message);
        }
      }
      toast.success(t('message.measurement_added'));
      router.dismissAll();
    }
  }, [state, unit]);

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      width: 100,
      marginTop: 'auto',
      paddingLeft: 80,
    },
    inputAndroid: {
      width: 100,
      marginTop: 'auto',
    },
  });

  const translateItem = useCallback((items: Item[]) => {
    return items.map((item) => ({
      ...item,
      label: t(`unit.${item.label}`),
    }));
  }, []);
  const translatedWeightUnit = useRef(translateItem(weightUnits));
  const translatedLengthUnit = useRef(translateItem(lengthUnits));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: 'modal',
          title: t('measurement.add_measurements'),
        }}
        name={t('measurement.add_measurements')}
      />
      <YStack padding="lg" justify="between" className="pb-16">
        <ScrollView
          className="w-full "
          contentContainerStyle={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
          <TouchableOpacity
            className="flex w-full flex-col gap-2"
            onPress={() => setShowDatePicker(true)}>
            <Label className="text-lg font-bold text-foreground">{t('measurement.date')}</Label>
            <Label className="text-lg text-foreground">
              {state.date.toLocaleDateString(language)}
            </Label>
            {showDatePicker && (
              <DateTimePicker
                value={state.date}
                mode="date"
                maximumDate={new Date()}
                onChange={(_e, date) => {
                  setShowDatePicker(false);
                  handleFormChange('date', date || new Date());
                }}
              />
            )}
          </TouchableOpacity>
          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.weight')}
              value={state.weight?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('weight', value)}
            />
            <View>
              <RNPickerSelect
                placeholder={{}}
                textInputProps={{ textAlign: 'right' }}
                style={pickerSelectStyles}
                value={unit.weight}
                onValueChange={(value) => handleUnitChange('weight', value)}
                items={translatedWeightUnit.current}
              />
            </View>
          </XStack>

          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.height')}
              value={state.height?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('height', value)}
            />

            <View>
              <RNPickerSelect
                placeholder={{}}
                textInputProps={{ textAlign: 'right' }}
                style={pickerSelectStyles}
                value={unit.height}
                onValueChange={(value) => handleUnitChange('height', value)}
                items={translatedLengthUnit.current}
              />
            </View>
          </XStack>
          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.body_fat')}
              value={state.bodyFat?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('bodyFat', value)}
            />
            <Text className="mb-2 w-[100] pl-2 text-lg">%</Text>
          </XStack>
          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.chest')}
              value={state.chest?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('chest', value)}
            />
            <View>
              <RNPickerSelect
                placeholder={{}}
                textInputProps={{ textAlign: 'right' }}
                style={pickerSelectStyles}
                value={unit.chest}
                onValueChange={(value) => handleUnitChange('chest', value)}
                items={translatedLengthUnit.current}
              />
            </View>
          </XStack>
          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.hip')}
              value={state.hip?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('hip', value)}
            />
            <View>
              <RNPickerSelect
                placeholder={{}}
                textInputProps={{ textAlign: 'right' }}
                style={pickerSelectStyles}
                value={unit.hip}
                onValueChange={(value) => handleUnitChange('hip', value)}
                items={translatedLengthUnit.current}
              />
            </View>
          </XStack>
          <XStack fill={false} padding="none" align="end">
            <FormField
              label={t('measurement.waist')}
              value={state.waist?.toString()}
              inputMode="decimal"
              onChangeText={(value: string) => handleFormChange('waist', value)}
            />
            <View>
              <RNPickerSelect
                placeholder={{}}
                textInputProps={{ textAlign: 'right' }}
                style={pickerSelectStyles}
                value={unit.waist}
                onValueChange={(value) => handleUnitChange('waist', value)}
                items={translatedLengthUnit.current}
              />
            </View>
          </XStack>
        </ScrollView>
        <YStack padding="none" justify="end" fill={false} className="w-full">
          <Button className="w-full" onPress={handleSubmit}>
            <Text>{recordExist ? t('common.update') : t('common.add')} </Text>
          </Button>
        </YStack>
      </YStack>
    </>
  );
};
export default MeasurementModal;
