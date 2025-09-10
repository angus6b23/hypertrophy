import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Dispatch, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Workout } from 'share/interfaces/Records';
import { YStack, XStack } from '~/components/ui/Stacks';
import { Text } from '~/components/ui/text';
import { WeightUnit } from '~/types/units';
import { minutesPassed } from '~/utils/misc/time';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { useTranslation } from 'react-i18next';
import { useOptionStore } from '~/utils/stores/option-store';
import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';
import { ExerciseRecordItem } from '~/components/ui/ExerciseRecordItem';
import { getSessionVolume } from '~/utils/misc/session-data';
import { useAccountStore } from '~/utils/stores/account-store';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { useColors } from '~/utils/rn-reusables/useColors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { t } from 'i18next';
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
import { backend } from '~/utils/backend';
import { toast } from 'sonner-native';

const WorkoutDayContext = createContext<{
  id: string;
  setId: Dispatch<React.SetStateAction<string>>;
}>({
  id: '',
  setId: () => {},
});

const WorkoutDayView = () => {
  const router = useRouter();
  const { date: paraDate } = useLocalSearchParams();
  const workouts = useWorkoutStore((s) => s.workouts);
  const [sessions, setSessions] = useState<Workout[]>([]);
  const [id, setId] = useState('');

  const date = new Date(paraDate as string);
  if (!date) {
    router.dismiss();
  }

  useEffect(() => {
    const filtered = workouts.filter((w) => {
      const wDate = new Date(w.startTime).toISOString().split('T')[0];
      return wDate === date.toISOString().split('T')[0];
    });
    setSessions(filtered);
  }, [workouts]);

  return (
    <>
      <WorkoutDayContext.Provider value={{ id, setId }}>
        <Stack.Screen options={{ title: date.toLocaleDateString(), headerShown: true }} />
        <FlashList
          data={sessions}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 48 }}
          ItemSeparatorComponent={() => <View className="h-8" />}
          renderItem={(item) => (
            <>
              <SessionHeader workout={item.item} />
              <FlashList
                data={item.item.exercises}
                keyExtractor={(inner, i) => `${item.item.localId}-${inner.exercisePlanId}-${i}`}
                contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
                ItemSeparatorComponent={() => <View className="h-4" />}
                renderItem={(inner) => (
                  <ExerciseRecordItem
                    record={inner.item}
                    date={item.item.startTime as unknown as string}
                    options={{ showDate: false, showName: true }}
                  />
                )}
              />
            </>
          )}
          estimatedItemSize={2}
        />
        <DeleteWorkoutDialog />
      </WorkoutDayContext.Provider>
    </>
  );
};

const SessionHeader = ({ workout }: { workout: Workout }) => {
  const { t } = useTranslation();

  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const preferredUnit = useOptionStore((s) => s.unit.workoutWeight);

  return (
    <YStack fill={false} className="w-full bg-muted" align="center">
      <XStack
        fill={false}
        className="w-full bg-transparent"
        justify="between"
        padding="none"
        align="center">
        <Text className="text-xl font-bold">{t('workout.session_summary')}</Text>
        <XStack fill={false} padding="none" className="bg-transparent" align="center" gap="none">
          {isLoggedIn && (
            <XStack fill={false} padding="none" className="bg-transparent" align="end" gap="sm">
              {/* FIXME: icon color mismatch  */}
              <ThemedIcon name={workout.public ? 'Earth' : 'EarthLock'} size={20} />
              <Text className="text-muted-foreground">
                {workout.public ? t('common.public') : t('common.private')}
              </Text>
            </XStack>
          )}
          <SessionHeaderDropdown workout={workout} />
        </XStack>
      </XStack>
      <XStack
        gap="none"
        padding="none"
        fill={false}
        className="w-full bg-transparent"
        justify="between">
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.duration')}</Text>
          <Text className="text-xl">
            {minutesPassed(new Date(workout.startTime), new Date(workout.endTime!)) +
              ' ' +
              t('common.min')}
          </Text>
        </YStack>
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.exercises')}</Text>
          <Text className="text-xl">{workout.exercises.length}</Text>
        </YStack>
        <YStack gap="none" padding="none" fill={false} className="bg-transparent">
          <Text className="text-xl text-muted-foreground">{t('workout.volume')}</Text>
          <Text className="text-xl">
            {getSessionVolume(workout, preferredUnit)}{' '}
            {preferredUnit === WeightUnit.kg ? t('unit.kg') : t('unit.lbs')}
          </Text>
        </YStack>
        {workout.RPE && (
          <YStack gap="none" padding="none" fill={false} className="bg-transparent">
            <Text className="text-xl text-muted-foreground">{t('workout.rpe')}</Text>
            <Text className="text-xl">{workout.RPE} / 10</Text>
          </YStack>
        )}
      </XStack>
    </YStack>
  );
};

const SessionHeaderDropdown = ({ workout }: { workout: Workout }) => {
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const update = useWorkoutStore((s) => s.update);

  const { t } = useTranslation();
  const colors = useColors();
  const { setId } = useContext(WorkoutDayContext);

  const setVisibility = useCallback(
    (pub: boolean) => {
      update(workout.localId, { public: pub }, false);
    },
    //TODO: Implement api call to backend
    [workout]
  );

  const copyUrl = useCallback(() => {
    //TODO: Implement copy backend share url
  }, [workout]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <ThemedIcon size={20} name="EllipsisVertical" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isLoggedIn && workout.public && (
          <>
            <DropdownMenuItem onPress={() => setVisibility(false)}>
              <XStack
                fill={false}
                padding="sm"
                align="center"
                justify="between"
                className="bg-transparent">
                <ThemedIcon size={16} name="Lock" />
                <Text>{t('workout.set_as_private')}</Text>
              </XStack>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-between flex">
              <XStack
                fill={false}
                padding="sm"
                align="center"
                justify="between"
                className="bg-transparent">
                <ThemedIcon size={16} name="Share2" />
                <Text>{t('workout.copy_share_url')}</Text>
              </XStack>
            </DropdownMenuItem>
          </>
        )}
        {isLoggedIn && !workout.public && (
          <DropdownMenuItem onPress={() => setVisibility(true)}>
            <XStack
              fill={false}
              padding="sm"
              align="center"
              justify="between"
              className="bg-transparent">
              <ThemedIcon size={16} name="LockOpen" />
              <Text>{t('workout.set_as_public')}</Text>
            </XStack>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onPress={() => setId(workout.localId)}>
          <XStack padding="sm" align="center" justify="between" className="bg-transparent">
            <ThemedIcon name="Trash" size={16} color={colors.notification} />
            <Text className="text-destructive">{t('common.delete')}</Text>
          </XStack>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DeleteWorkoutDialog = () => {
  const { id, setId } = useContext(WorkoutDayContext);
  const { t } = useTranslation();

  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const remove = useWorkoutStore((s) => s.remove);

  const handleDelete = useCallback(async () => {
    try {
      remove(id);
      if (isLoggedIn) {
        await backend.workouts.delete(id);
      }
      toast.success(t('workout.workout_deleted'));
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [id]);

  return (
    <Dialog open={id !== ''} onOpenChange={() => setId('')}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="p-0">
          <ThemedIcon name="NotebookPen" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('workout.delete_this_workout?')}</DialogTitle>
          <DialogDescription>
            <Text>{t('workout.all_records_in_this_workout_will_be_removed')}</Text>
            <Text>
              {t('workout.are_you_sure_you_would_like_to_abandon_current_workout_session')}
            </Text>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild onPress={handleDelete}>
              <Button className="flex-1" variant="destructive">
                <Text>{t('common.delete')}</Text>
              </Button>
            </DialogClose>
            <DialogClose className="flex-1" asChild>
              <Button variant="ghost" className="text-center">
                <Text>{t('common.cancel')}</Text>
              </Button>
            </DialogClose>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutDayView;
