import { useEffect, useState } from 'react';
import { RepWeightRecord } from 'share/interfaces/Records';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { XStack } from './Stacks';
import { Input } from './input';
import { Text } from './text';
import { Button } from './button';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';

export const RepWithWeightRecordForm = ({
  prefill,
  exercisePlanId,
}: {
  prefill: RepWeightRecord[];
  exercisePlanId: string;
}) => {
  const { t } = useTranslation();
  const [pf, setPf] = useState(prefill);
  const [form, setForm] = useState<RepWeightRecord[]>([]);
  const [pointer, setPointer] = useState(0);
  const workoutStore = useWorkoutStore();

  useEffect(() => {
    if (
      workoutStore.current &&
      workoutStore.current.exercises.find((ex) => ex.exercisePlanId === exercisePlanId)
    ) {
      const record = workoutStore.current.exercises.find(
        (ex) => ex.exercisePlanId === exercisePlanId
      )!.record as RepWeightRecord[];
      setForm(record);
      setPointer(record.length - 1);
    }
  }, [workoutStore.current]);

  return (
    <>
      {pf.map((row, i) => {
        return (
          <XStack key={i} fill={false} className="w-full" justify="between" align="center">
            <View className="-ml-4 -mr-2 w-6 p-0 pl-0">
              {i < pointer ? (
                <ThemedIcon size={28} name="Check" />
              ) : i === pointer ? (
                <ThemedIcon size={28} name="ChevronRight" />
              ) : (
                <></>
              )}
            </View>
            <Text className="text-lg">{i + 1}</Text>
            <Input
              className="w-20 text-center"
              placeholder={row.weight.toString()}
              editable={i <= pointer}
            />
            <Text className="text-lg">kgs</Text>
            <Text className="text-lg">x</Text>
            <Input
              className="w-20 text-center"
              placeholder={row.weight.toString()}
              editable={i <= pointer}
            />
            <Text className="text-lg">reps</Text>
          </XStack>
        );
      })}
      <Button variant="secondary" onPress={() => setPf([...pf, prefill[prefill.length - 1]])}>
        <Text>{t('workout.add_set')}</Text>
      </Button>
    </>
  );
};
