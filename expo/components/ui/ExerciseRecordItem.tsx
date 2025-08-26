import {
  ExerciseRecord,
  RepRecord,
  RepWeightRecord,
  SetType,
  TimeRecord,
} from 'share/interfaces/Records';
import { useExerciseImage } from '~/utils/hooks/use-exercise-image';
import { exercises } from 'share/exercises/exercises.json';
import { Image } from 'expo-image';
import { XStack, YStack } from './Stacks';
import { Text } from './text';
import { useOptionStore } from '~/utils/stores/option-store';
import { useTranslation } from 'react-i18next';
import { WeightUnit } from '~/types/units';
import { round } from '~/utils/misc/round-numbers';
import { RecordType } from 'share/exercises/types/exercise';
import { predict1RM } from '~/utils/misc/rm-predict';

interface ExerciseRecordOption {
  showImg?: boolean;
  showName?: boolean;
  showDate?: boolean;
}

const defaultExRecOption: ExerciseRecordOption = {
  showImg: true,
  showName: false,
  showDate: true,
};
export const ExerciseRecordItem = ({
  record,
  date,
  options,
}: {
  record: ExerciseRecord;
  date: string;
  options?: ExerciseRecordOption;
}) => {
  const { t } = useTranslation();
  options = { ...defaultExRecOption, ...options };

  const ex = exercises.find((ex) => ex.id === record.exerciseId)!;
  const img = useExerciseImage(ex.path, { animate: false });
  const lang = useOptionStore((s) => s.language);

  return (
    <XStack fill={false} className="rounded-lg bg-muted" align="center">
      {options.showImg && (
        <Image source={img} style={{ width: 96, height: 96, borderRadius: 8 }} contentFit="cover" />
      )}
      <YStack fill={false} className="bg-transparent pl-4" padding="none">
        {options.showDate && (
          <Text className="wrap text-lg font-bold">{new Date(date).toLocaleDateString(lang)}</Text>
        )}
        {options.showName && (
          <Text numberOfLines={2} className="wrap w-full text-lg font-bold">
            {ex.name}
          </Text>
        )}
        {record.type === RecordType.reps_with_weight && (
          <RepWeightDisplay logs={record.record as RepWeightRecord[]} />
        )}
        {record.type === RecordType.reps && <RepDisplay logs={record.record as RepRecord[]} />}
        {record.type === RecordType.time && <TimeDisplay logs={record.record as TimeRecord[]} />}
        {record.remarks && (
          <Text className="text-lg">
            {t('common.remarks')}: {record.remarks}
          </Text>
        )}
      </YStack>
    </XStack>
  );
};

const RepWeightDisplay = ({ logs }: { logs: RepWeightRecord[] }) => {
  const preferredUnit = useOptionStore((s) => s.unit.workoutWeight);
  const { t } = useTranslation();
  const max1RM = Math.max(...logs.map((log) => predict1RM(log)));

  return (
    <YStack fill={false} className="w-full bg-transparent" padding="none">
      {logs.map((log, i) => (
        <XStack key={i} className="w-full flex-wrap bg-transparent" padding="none">
          <Text className="text-lg">{i + 1}.</Text>
          <Text className="text-lg">
            {preferredUnit === WeightUnit.lbs ? round(log.weight * 2.2) : log.weight}
          </Text>
          <Text className="text-lg uppercase">
            {preferredUnit === WeightUnit.lbs ? t('unit.lbs') : t('unit.kg')}
          </Text>
          <Text className="text-lg">x</Text>
          <Text className="text-lg">{log.reps}</Text>
          {log.type === SetType.warmup && <Text className="text-lg text-blue-500">W</Text>}
          {log.type === SetType.superset && <Text className="text-lg text-purple-500">S</Text>}
          {log.type === SetType.dropset && <Text className="text-lg text-orange-500">D</Text>}
        </XStack>
      ))}
      <Text className="text-lg">
        {t('workout.predicted_1rm')}:{' '}
        {preferredUnit === WeightUnit.lbs ? round(max1RM * 2.2) : max1RM}{' '}
        {preferredUnit === WeightUnit.lbs ? t('unit.lbs') : t('unit.kg')}
      </Text>
    </YStack>
  );
};

const RepDisplay = ({ logs }: { logs: RepRecord[] }) => {
  const { t } = useTranslation();

  return (
    <YStack fill={false} className="w-full bg-transparent" padding="none">
      {logs.map((log, i) => (
        <XStack key={i} className="w-full flex-wrap bg-transparent" padding="none">
          <Text className="text-lg">{i + 1}.</Text>
          <Text className="text-lg">{log.reps}</Text>
          <Text className="text-lg">{t('workout.reps')}</Text>
          {log.type === SetType.warmup && <Text className="text-lg text-blue-500">W</Text>}
          {log.type === SetType.superset && <Text className="text-lg text-purple-500">S</Text>}
          {log.type === SetType.dropset && <Text className="text-lg text-orange-500">D</Text>}
        </XStack>
      ))}
    </YStack>
  );
};

const TimeDisplay = ({ logs }: { logs: TimeRecord[] }) => {
  const { t } = useTranslation();

  return (
    <YStack fill={false} className="w-full bg-transparent" padding="none">
      {logs.map((log, i) => (
        <XStack key={i} className="w-full flex-wrap bg-transparent" padding="none">
          <Text className="text-lg">{i + 1}.</Text>
          <Text className="text-lg">{log.time}</Text>
          <Text className="text-lg">{t('workout.seconds')}</Text>
        </XStack>
      ))}
    </YStack>
  );
};
