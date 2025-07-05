import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { View } from 'react-native';
import { ExerciseItem } from '~/components/ui/ExerciseItem';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise } from 'share/exercises/types/exercise';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';

import DraggableFlatList, { DragEndParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { PlanExercise } from 'share/interfaces/Workout';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { useColors } from '~/utils/rn-reusables/useColors';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { t } from 'i18next';
import { XStack } from '~/components/ui/Stacks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { useAccountStore } from '~/utils/stores/account-store';
import { backend } from '~/utils/backend';
import { toast } from 'sonner-native';

const DayCotext = createContext({
  showEdit: false,
  setShowEdit: (_bool: boolean) => {},
  id: '',
  planExercises: [] as PlanExercise[],
});

const ExerciseDay = () => {
  const local = useLocalSearchParams();
  const idx = Number(local.idx as string);

  const currentPlan = useCurrentPlan();
  const [currentDay, setCurrentDay] = useState(currentPlan.days[idx]);

  const [showEdit, setShowEdit] = useState(false);
  const [id, setId] = useState('');

  const updateWorkout = useWorkoutPlanStore((s) => s.update);
  const currSession = useWorkoutStore((s) => s.current);
  const colors = useColors();
  const loggedIn = useAccountStore((s) => s.isLoggedIn);

  useEffect(() => {
    setCurrentDay(currentPlan.days[idx]);
  }, [idx, currentPlan]);

  const handleDrag = useCallback(
    async (d: DragEndParams<PlanExercise>) => {
      updateWorkout(currentPlan.localId, {
        ...currentPlan,
        days: currentPlan.days.map((day, i) =>
          i !== idx
            ? day
            : {
                ...day,
                exercises: d.data,
              }
        ),
      });
      if (loggedIn) {
        try {
          if (currentPlan.id) {
            backend.plans.update(currentPlan.id, currentPlan);
          } else {
            const res = await backend.plans.add(currentPlan);
            updateWorkout(currentPlan.localId, res, false);
          }
        } catch (err) {
          toast.error((err as Error).message);
        }
      }
    },
    [currentDay, currentPlan, idx, loggedIn]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      updateWorkout(currentPlan.localId, {
        ...currentPlan,
        days: currentPlan.days.map((day, i) =>
          i !== idx
            ? day
            : {
                ...day,
                exercises: day.exercises.filter((ex) => ex.localId !== id),
              }
        ),
      });

      if (loggedIn) {
        try {
          if (currentPlan.id) {
            backend.plans.update(currentPlan.id, currentPlan);
          } else {
            const res = await backend.plans.add(currentPlan);
            updateWorkout(currentPlan.localId, res, false);
          }
        } catch (err) {
          toast.error((err as Error).message);
        }
      }
    },
    [currentDay, currentPlan, idx, loggedIn]
  );

  return (
    <>
      <Stack.Screen options={{ title: `${currentDay.name}`, headerShown: true }} />
      <DayCotext.Provider
        value={{
          showEdit,
          setShowEdit,
          id,
          planExercises: currentDay.exercises,
        }}>
        <DraggableFlatList
          data={currentPlan.days[idx].exercises}
          keyExtractor={(item) => item.localId as string}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 64 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={(item) => {
            const ex = exerciseDb.exercises.find(
              (ex) => ex.id === item.item.exerciseId
            )! as Exercise;
            return (
              <ScaleDecorator>
                <View className="relative flex flex-row items-center rounded-lg bg-muted">
                  <ExerciseItem
                    exercise={ex}
                    drag={item.drag}
                    href={`/(zShare)/exercise/logs?day=${idx}&exercise=${item.getIndex()}&exercisePlanId=${item.item.localId}`}
                    size={96}
                    className="w-full max-w-96 flex-1 rounded-lg bg-muted"
                  />
                  {currSession &&
                    currSession.exercises.find((ex) => item.item.localId! === ex.exercisePlanId)
                      ?.finished && (
                      <View className="absolute right-4">
                        <ThemedIcon name="CircleCheck" color={colors.text} size={32} />
                      </View>
                    )}

                  <View className="absolute right-0 top-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ThemedIcon name="EllipsisVertical" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-52" align="end">
                        <DropdownMenuItem
                          onPress={() => {
                            setId(item.item.localId);
                            setShowEdit(true);
                          }}>
                          <XStack
                            padding="sm"
                            align="center"
                            justify="between"
                            style={{ backgroundColor: 'transparent' }}>
                            <ThemedIcon name="Pencil" size={16} />
                            <Text>{t('common.edit')}</Text>
                          </XStack>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onPress={() => {
                            handleDelete(item.item.localId);
                          }}>
                          <XStack
                            padding="sm"
                            align="center"
                            justify="between"
                            style={{ backgroundColor: 'transparent' }}>
                            <ThemedIcon name="Trash" size={16} color={colors.notification} />
                            <Text className="text-destructive">{t('common.delete')}</Text>
                          </XStack>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </View>
                </View>
              </ScaleDecorator>
            );
          }}
          ListFooterComponent={<AddExerciseButton idx={idx} />}
          onDragEnd={handleDrag}
        />
        <EditDialog />
      </DayCotext.Provider>
    </>
  );
};

const AddExerciseButton = ({ idx }: { idx: number }) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Button className="mt-4" onPress={() => router.push(`/(zShare)/exercise/add?idx=${idx}`)}>
      <Text>{t('common.add_exercise')}</Text>
    </Button>
  );
};

const EditDialog = () => {
  const { t } = useTranslation();
  const ctx = useContext(DayCotext);

  return (
    <Dialog open={ctx.showEdit} onOpenChange={(e) => ctx.setShowEdit(e)}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>{t('plan.edit_exercise')}</DialogTitle>
          <DialogDescription>{t('plan.target_reps')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" variant="destructive">
              <Text>{t('common.confirm')}</Text>
            </Button>
            <Button className="flex-1" onPress={() => ctx.setShowEdit(false)}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDay;
