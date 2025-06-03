import { useCallback, useEffect, useState } from 'react';
import {
  RepRecord,
  RepWeightRecord,
  SetType,
  TimeRecord,
  ExerciseRecord,
} from 'share/interfaces/Records';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { XStack } from './Stacks';
import { Input } from './input';
import { Text } from './text';
import { Button } from './button';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ThemedIcon } from './ThemedIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { RecordType } from 'share/exercises/types/exercise';
import { useOptionStore } from '~/utils/stores/option-store';
import { WeightUnit } from '~/types/units';
import { round } from '~/utils/misc/round-numbers';

interface LogRepWeightRecord extends Omit<RepWeightRecord, 'reps' | 'weight' | 'type'> {
  reps?: string;
  weight?: string;
  type?: SetType;
}
export const RepWithWeightRecordForm = ({
  prefill,
  exercisePlanId,
  exId,
}: {
  prefill: RepWeightRecord[];
  exercisePlanId: string;
  exId: number;
}) => {
  const { t } = useTranslation();
  const [pf, setPf] = useState(prefill);
  const [form, setForm] = useState<LogRepWeightRecord[]>([]);
  const [pointer, setPointer] = useState(0);
  const workoutStore = useWorkoutStore();
  const preferredUnit = useOptionStore((os) => os.unit.workoutWeight);

  useEffect(() => {
    if (!workoutStore.current) return;
    const record = workoutStore.current.exercises.find(
      (ex) => ex.exercisePlanId === exercisePlanId
    );
    if (!record) return;
    const logs = record.record as RepWeightRecord[];
    setForm(
      logs.map((r) => ({
        ...r,
        weight:
          preferredUnit === WeightUnit.lbs ? round(r.weight * 2.2).toString() : r.weight.toString(),
        reps: r.reps.toString(),
      }))
    );
    setPointer(logs.length);
  }, [workoutStore.current, exercisePlanId]);

  const handleRepChange = useCallback(
    (index: number, value: string) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { reps: value } as Partial<LogRepWeightRecord>]);
      } else {
        setForm((prevState) => prevState.map((r, i) => (i === index ? { ...r, reps: value } : r)));
      }
    },
    [form, setForm]
  );

  const handleWeightChange = useCallback(
    (index: number, value: string) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { weight: value } as Partial<LogRepWeightRecord>]);
      } else {
        setForm((prevState) =>
          prevState.map((r, i) => (i === index ? { ...r, weight: value } : r))
        );
      }
    },
    [form, setForm]
  );

  const handleTypeChange = useCallback(
    (index: number) => (type: SetType) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { type }] as Partial<LogRepWeightRecord>[]);
      } else {
        setForm((prevState) => prevState.map((r, i) => (i === index ? { ...r, type } : r)));
      }
    },
    [form, setForm]
  );

  const handleLog = useCallback(() => {
    const merged: RepWeightRecord[] = [];
    const finished = pointer >= pf.length - 1;

    for (let i = 0; i <= Math.min(pointer, pf.length - 1); i++) {
      merged.push({
        ...pf[i],
        ...form[i],
        reps: Number(form[i]?.reps) || pf[i].reps,
        weight: Number(form[i]?.weight) || pf[i].weight,
      });
    }
    if (!workoutStore.current) {
      workoutStore.start();
      workoutStore.log({
        exercises: [
          {
            exercisePlanId,
            exerciseId: exId,
            record: merged,
            type: RecordType.reps_with_weight,
            finished,
          },
        ],
      });
      return;
    } else {
      const curr = workoutStore.current!;
      const currEx = curr.exercises.findIndex((ex) => ex.exercisePlanId === exercisePlanId);
      let newRecords: ExerciseRecord[];
      if (currEx !== -1) {
        newRecords = curr.exercises.map((ex, i) =>
          i === currEx ? { ...ex, record: merged, finished } : ex
        );
      } else {
        newRecords = [
          ...curr.exercises,
          {
            exerciseId: exId,
            exercisePlanId,
            record: merged,
            type: RecordType.reps_with_weight,
            finished,
          },
        ];
      }
      workoutStore.log({ exercises: newRecords });
    }
  }, [pf, form, pointer, workoutStore]);

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
              value={form[i]?.weight}
              onChangeText={(value) => handleWeightChange(i, value)}
            />
            {preferredUnit === WeightUnit.lbs ? (
              <Text className="text-lg uppercase">{t('unit.lbs')}</Text>
            ) : (
              <Text className="text-lg uppercase">{t('unit.kg')}</Text>
            )}
            <Text className="text-lg">x</Text>
            <Input
              className="w-20 text-center"
              placeholder={row.reps.toString()}
              editable={i <= pointer}
              value={form[i]?.reps}
              onChangeText={(value) => handleRepChange(i, value)}
            />
            <Text className="text-lg uppercase">{t('workout.reps')}</Text>
            <SetTypeButton
              state={form[i]?.type !== undefined ? form[i]?.type! : row.type}
              onChange={handleTypeChange(i)}
              disabled={i > pointer}
            />
          </XStack>
        );
      })}
      <Button variant="secondary" onPress={() => setPf([...pf, prefill[prefill.length - 1]])}>
        <Text>{t('workout.add_set')}</Text>
      </Button>
      <Button onPress={handleLog}>
        <Text>{t('common.log')}</Text>
      </Button>
    </>
  );
};

interface LogRepRecord extends Partial<Omit<RepRecord, 'reps'>> {
  reps?: string;
}

export const RepRecordForm = ({
  prefill,
  exercisePlanId,
  exId,
}: {
  prefill: RepRecord[];
  exercisePlanId: string;
  exId: number;
}) => {
  const { t } = useTranslation();
  const [pf, setPf] = useState(prefill);
  const [form, setForm] = useState<LogRepRecord[]>([]);
  const [pointer, setPointer] = useState(0);
  const workoutStore = useWorkoutStore();

  useEffect(() => {
    if (!workoutStore.current) return;
    const record = workoutStore.current.exercises.find(
      (ex) => ex.exercisePlanId === exercisePlanId
    );
    if (!record) return;
    const logs = record.record as RepRecord[];
    setForm(logs.map((r) => ({ ...r, reps: r.reps.toString() })));
    setPointer(logs.length);
  }, [workoutStore.current]);

  const handleRepChange = useCallback(
    (index: number, value: string) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { reps: value } as Partial<LogRepRecord>]);
      } else {
        setForm((prevState) => prevState.map((r, i) => (i === index ? { ...r, reps: value } : r)));
      }
    },
    [form, setForm]
  );

  const handleTypeChange = useCallback(
    (index: number) => (type: SetType) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { type }] as Partial<LogRepRecord>[]);
      } else {
        setForm((prevState) => prevState.map((r, i) => (i === index ? { ...r, type } : r)));
      }
    },
    [form, setForm]
  );

  const handleLog = useCallback(() => {
    const merged: RepRecord[] = [];
    const finished = pointer >= pf.length - 1;

    for (let i = 0; i <= Math.min(pointer, pf.length - 1); i++) {
      merged.push({ ...pf[i], ...form[i], reps: Number(form[i]?.reps) || pf[i].reps });
    }
    if (!workoutStore.current) {
      workoutStore.start();
      workoutStore.log({
        exercises: [
          {
            exercisePlanId,
            exerciseId: exId,
            record: merged,
            type: RecordType.reps,
            finished,
          },
        ],
      });
      return;
    } else {
      const curr = workoutStore.current!;
      const currEx = curr.exercises.findIndex((ex) => ex.exercisePlanId === exercisePlanId);
      let newRecords: ExerciseRecord[];
      if (currEx !== -1) {
        newRecords = curr.exercises.map((ex, i) =>
          i === currEx ? { ...ex, record: merged, finished } : ex
        );
      } else {
        newRecords = [
          ...curr.exercises,
          {
            exerciseId: exId,
            exercisePlanId,
            record: merged,
            type: RecordType.reps,
            finished,
          },
        ];
      }
      workoutStore.log({ exercises: newRecords });
    }
  }, [pf, form, pointer, workoutStore]);
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
              className="mx-4 w-20 flex-1 text-center"
              placeholder={row.reps.toString()}
              editable={i <= pointer}
              value={form[i]?.reps?.toString()}
              onChangeText={(s) => handleRepChange(i, s)}
              keyboardType="numeric"
            />
            <Text className="text-lg uppercase">{t('workout.reps')}</Text>
            <SetTypeButton
              state={form[i]?.type !== undefined ? form[i]?.type! : row.type}
              onChange={handleTypeChange(i)}
              disabled={i > pointer}
            />
          </XStack>
        );
      })}
      <Button variant="secondary" onPress={() => setPf([...pf, prefill[prefill.length - 1]])}>
        <Text>{t('workout.add_set')}</Text>
      </Button>
      <Button onPress={handleLog}>
        <Text>{t('common.log')}</Text>
      </Button>
    </>
  );
};

interface LogTimeRecord extends Partial<Omit<TimeRecord, 'time'>> {
  time?: string;
}

export const TimeRecordForm = ({
  prefill,
  exercisePlanId,
  exId,
}: {
  prefill: TimeRecord[];
  exercisePlanId: string;
  exId: number;
}) => {
  const { t } = useTranslation();
  const [pf, setPf] = useState(prefill);
  const [form, setForm] = useState<LogTimeRecord[]>([]);
  const [pointer, setPointer] = useState(0);
  const workoutStore = useWorkoutStore();

  useEffect(() => {
    if (!workoutStore.current) return;
    const record = workoutStore.current.exercises.find(
      (ex) => ex.exercisePlanId === exercisePlanId
    );
    if (!record) return;
    const logs = record.record as TimeRecord[];
    setForm(logs.map((r) => ({ time: r.time.toString() })));
    setPointer(logs.length);
  }, [workoutStore.current]);

  const handleTimeChange = useCallback(
    (index: number, value: string) => {
      if (!form[index]) {
        setForm((prevState) => [...prevState, { time: value } as Partial<LogTimeRecord>]);
      } else {
        setForm((prevState) => prevState.map((r, i) => (i === index ? { ...r, time: value } : r)));
      }
    },
    [form, setForm]
  );

  const handleLog = useCallback(() => {
    const merged: TimeRecord[] = [];
    const finished = pointer >= pf.length - 1;

    for (let i = 0; i <= Math.min(pointer, pf.length - 1); i++) {
      merged.push({ ...pf[i], ...form[i], time: Number(form[i]?.time) || pf[i].time });
    }
    if (!workoutStore.current) {
      workoutStore.start();
      workoutStore.log({
        exercises: [
          {
            exercisePlanId,
            exerciseId: exId,
            record: merged,
            type: RecordType.time,
            finished,
          },
        ],
      });
      return;
    } else {
      const curr = workoutStore.current!;
      const currEx = curr.exercises.findIndex((ex) => ex.exercisePlanId === exercisePlanId);
      let newRecords: ExerciseRecord[];
      if (currEx !== -1) {
        newRecords = curr.exercises.map((ex, i) =>
          i === currEx ? { ...ex, record: merged, finished } : ex
        );
      } else {
        newRecords = [
          ...curr.exercises,
          {
            exerciseId: exId,
            exercisePlanId,
            record: merged,
            type: RecordType.time,
            finished,
          },
        ];
      }
      workoutStore.log({ exercises: newRecords });
    }
  }, [pf, form, pointer, workoutStore]);

  return (
    <>
      {pf.map((row, i) => (
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
            className="mx-4 w-20 flex-1 text-center"
            placeholder={row.time.toString()}
            editable={i <= pointer}
            value={form[i]?.time?.toString()}
            onChangeText={(s) => handleTimeChange(i, s)}
            keyboardType="numeric"
          />
          <Text className="text-lg uppercase">{t('workout.seconds')}</Text>
        </XStack>
      ))}
      <Button variant="secondary" onPress={() => setPf([...pf, prefill[prefill.length - 1]])}>
        <Text>{t('workout.add_set')}</Text>
      </Button>
      <Button onPress={handleLog}>
        <Text>{t('common.log')}</Text>
      </Button>
      );
    </>
  );
};
const SetTypeButton = ({
  state,
  onChange,
  disabled,
}: {
  state: SetType;
  onChange: (type: SetType) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" disabled={disabled}>
          {state === SetType.warmup ? (
            <Text className="text-blue-500">W</Text>
          ) : state === SetType.normal ? (
            <Text className="text-muted-foreground">N</Text>
          ) : state === SetType.dropset ? (
            <Text className="text-orange-500">D</Text>
          ) : (
            <Text className="text-purple-500">S</Text>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="flex justify-between" onPress={() => onChange(SetType.warmup)}>
          <Text className="text-blue-500">W</Text>
          <Text>{t('workout.warmup_set')}</Text>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between" onPress={() => onChange(SetType.normal)}>
          <Text className="text-muted-foreground">N</Text>
          <Text>{t('workout.normal_set')}</Text>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onPress={() => onChange(SetType.dropset)}>
          <Text className="text-orange-500">D</Text>
          <Text>{t('workout.drop_set')}</Text>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between"
          onPress={() => onChange(SetType.superset)}>
          <Text className="text-purple-500">S</Text>
          <Text>{t('workout.super_set')}</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
