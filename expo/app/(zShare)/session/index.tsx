import { Stack, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { RepWeightRecord } from 'share/interfaces/Records';
import { Button } from '~/components/ui/button';
import { XStack, YStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { WeightUnit } from '~/types/units';
import { round } from '~/utils/misc/round-numbers';
import { minutesPassed } from '~/utils/misc/time';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useOptionStore } from '~/utils/stores/option-store';
import { useWorkoutStore } from '~/utils/stores/session-store';
import Slider from '@react-native-community/slider';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { FlashList } from '@shopify/flash-list';
import { ExerciseRecordItem } from '~/components/ui/ExerciseRecordItem';
import { toast } from 'sonner-native';

const SessionPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useWorkoutStore((s) => s.current);
  const endSession = useWorkoutStore((s) => s.end);
  const preferredUnit = useOptionStore((s) => s.unit.workoutWeight);
  const colors = useColors();

  const [remark, setRemark] = useState(false);
  if (!session) {
    router.dismiss();
  }

  const [rpe, setRpe] = useState(5);
  const getSessionVolume = useCallback(() => {
    const volume = session!.exercises.reduce((acc, ex) => {
      if (ex.type === 'reps_with_weight') {
        const record = ex.record as RepWeightRecord[];
        record.forEach((r) => (acc += r.weight * r.reps));
      }
      return acc;
    }, 0);
    return preferredUnit === WeightUnit.kg ? round(volume) : round(volume / 2);
  }, [session, preferredUnit]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('workout.session_details'),
          headerShown: true,
        }}
      />
      <View className="relative flex h-full w-full flex-col">
        <YStack fill={false} className="w-full" align="center">
          <ThemedIcon name="Smile" size={72} color={colors.text} />
          <XStack
            gap="none"
            padding="none"
            fill={false}
            className="w-full bg-transparent"
            justify="around">
            <YStack gap="none" padding="none" fill={false} className="bg-transparent">
              <Text className="text-xl text-muted-foreground">{t('workout.duration')}</Text>
              <Text className="text-xl">
                {minutesPassed(new Date(session?.startTime as unknown as string)) + ' min'}
              </Text>
            </YStack>
            <YStack gap="none" padding="none" fill={false} className="bg-transparent">
              <Text className="text-xl text-muted-foreground">{t('workout.exercises')}</Text>
              <Text className="text-xl">{session?.exercises.length}</Text>
            </YStack>
            <YStack gap="none" padding="none" fill={false} className="bg-transparent">
              <Text className="text-xl text-muted-foreground">{t('workout.volume')}</Text>
              <Text className="text-xl">
                {getSessionVolume()}{' '}
                {preferredUnit === WeightUnit.kg ? t('unit.kg') : t('unit.lbs')}
              </Text>
            </YStack>
          </XStack>
        </YStack>
        <View></View>
        <FlashList
          data={session!.exercises}
          keyExtractor={(item) => item.exercisePlanId}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 200 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={(item) => (
            <ExerciseRecordItem
              record={item.item}
              date={session!.startTime as unknown as string}
              options={{ showDate: false, showName: true }}
            />
          )}
          estimatedItemSize={10}
        />
        <View className="absolute bottom-12 flex w-full flex-col gap-2 bg-background px-4 pb-4 pt-2">
          <RPESlider rpe={rpe} setRpe={setRpe} />
          <XStack fill={false} padding="none">
            <Button
              className="flex-1"
              onPress={() => {
                endSession(rpe);
                router.replace('/');
                toast.success(t('workout.session_completed'));
              }}>
              <Text>{t('workout.end_session')}</Text>
            </Button>
            <RemarkDialog remarkDiag={remark} setRemarkDiag={setRemark} />
          </XStack>
        </View>
      </View>
    </>
  );
};

const RPESlider = ({
  rpe,
  setRpe,
}: {
  rpe: number;
  setRpe: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  const rpeScale = useRef<Record<number, string>>({
    1: t('workout.nothing'),
    2: t('workout.very_easy'),
    3: t('workout.easy'),
    4: t('workout.comfortable'),
    5: t('workout.somewhat_difficult'),
    6: t('workout.difficult'),
    7: t('workout.hard'),
    8: t('workout.very_hard'),
    9: t('workout.extremely_hard'),
    10: t('workout.maximal'),
  });

  return (
    <View className="rounded-lg bg-muted pb-2">
      <XStack fill={false} className="bg-transparent" justify="between">
        <Text
          className="
          text-lg font-bold">
          {t('workout.rpe')}: {rpe}
        </Text>
        <Text
          className="
          text-lg font-bold">
          {rpeScale.current[rpe]}
        </Text>
      </XStack>
      <Slider
        value={rpe}
        onSlidingComplete={setRpe}
        minimumValue={1}
        maximumValue={10}
        step={1}
        thumbTintColor={colors.text}
        minimumTrackTintColor={colors.text}
        maximumTrackTintColor={colors.primary}
      />
    </View>
  );
};

const RemarkDialog = ({
  remarkDiag,
  setRemarkDiag,
}: {
  remarkDiag: boolean;
  setRemarkDiag: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const currSession = useWorkoutStore((s) => s.current);
  const log = useWorkoutStore((s) => s.log);
  return (
    <Dialog open={remarkDiag} onOpenChange={setRemarkDiag}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="p-0">
          <ThemedIcon name="NotebookPen" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('commont.remarks')}</DialogTitle>
          <DialogDescription>
            <Input
              className="min-h-96 w-full"
              placeholder={t('workout.enter_remark')}
              value={currSession?.remarks || ''}
              onChangeText={(s) => {
                log({
                  remarks: s,
                });
              }}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>
              <Text>{t('common.finish')}</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default SessionPage;
