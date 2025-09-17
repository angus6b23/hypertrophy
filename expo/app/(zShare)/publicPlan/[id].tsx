import { toast } from 'sonner-native';
import { useCallback, useEffect, useState } from 'react';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { SafeAreaView, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { FlashList } from '@shopify/flash-list';

import { nanoid } from 'nanoid/non-secure';

import Loading from '~/views/common/Loading';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { useAccountStore } from '~/utils/stores/account-store';
import { useWeekday } from '~/utils/hooks/use-weekday';
import { getExerciseById } from '~/utils/exercises';
import { backend } from '~/utils/backend';
import { Text } from '~/components/ui/text';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack, YStack } from '~/components/ui/Stacks';
import { ExerciseItemSimple } from '~/components/ui/ExerciseItem';
import { PlanDay, PublicPlanDetails } from 'share/interfaces/Workout';

const BACK_URL = '/(tabs)/workout/listPlan';
const PublicPlanPage = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PublicPlanDetails>();

  useEffect(() => {
    hydratePlan();
  }, []);

  const hydratePlan = useCallback(async () => {
    try {
      const res = await backend.plans.getPublicPlanDetails(Number(id));
      setPlan(res);
    } catch (err) {
      toast.error((err as Error).message);
      router.push(BACK_URL);
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (!id) {
    return <Redirect href={BACK_URL} />;
  }

  return (
    <>
      <SafeAreaView className="relative flex-1">
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: plan?.name || t('workout.public_plans'),
            headerRight: () => <HeaderRightButton plan={plan} />,
          }}
        />
        {loading && <Loading />}
        {plan && (
          <>
            <YStack className="bg-muted rounded-lg mx-4 my-2" fill={false}>
              <View>
                <Text className="text-xl">{t('workout.description') + ':'}</Text>
                <Text className="text-muted-foreground text-lg">{plan.description}</Text>
              </View>
              <XStack
                fill={false}
                className="w-full bg-transparent"
                padding="none"
                justify="around">
                <YStack
                  fill={false}
                  justify="center"
                  align="center"
                  gap="sm"
                  padding="none"
                  className="bg-transparent">
                  <Text className="text-xl">{plan.days.length.toString()}</Text>
                  <Text className="text-xl text-muted-foreground">{t('workout.days')}</Text>
                </YStack>
                <YStack
                  fill={false}
                  justify="center"
                  align="center"
                  gap="sm"
                  padding="none"
                  className="bg-transparent">
                  <Text className="text-xl">
                    {plan.days.reduce((acc, day) => acc + day.exercises.length, 0).toString()}
                  </Text>
                  <Text className="text-xl text-muted-foreground">{t('workout.exercises')}</Text>
                </YStack>
              </XStack>
            </YStack>
            <FlashList
              data={plan.days}
              keyExtractor={(_item, i) => i.toString()}
              contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: 48,
                paddingHorizontal: 12,
              }}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={(item) => (
                <>
                  <DayView day={item.item} isWeekday={plan.isWeekday} />
                </>
              )}
              estimatedItemSize={12}
            />
          </>
        )}
      </SafeAreaView>
    </>
  );
};

const HeaderRightButton = ({ plan }: { plan: PublicPlanDetails | undefined }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const add = useWorkoutPlanStore((s) => s.add);
  const update = useWorkoutPlanStore((s) => s.update);

  const handleAdd = useCallback(async () => {
    const newId = nanoid();
    if (plan) {
      const { id, ...newPlan } = { ...plan, localId: newId, isPublic: false };
      newPlan.days.forEach((day) => {
        day.exercises.forEach((ex) => {
          delete ex.id;
        });
        delete day.id;
      });
      add(newPlan);
      router.dismissAll();
      toast.success(t('workout.added_to_your_plans'));
      if (isLoggedIn) {
        try {
          const { id } = await backend.plans.add(newPlan);
          update(newId, { id }, false);
        } catch (err) {
          toast.error((err as Error).message);
        }
      }
    }
  }, [plan]);

  return (
    <>
      {plan && (
        <Button>
          <Text className="text-lg" onPress={handleAdd}>
            {t('workout.add_to_plan')}
          </Text>
        </Button>
      )}
    </>
  );
};

const DayView = ({ day, isWeekday }: { day: PlanDay; isWeekday: boolean }) => {
  const { t } = useTranslation();
  const string = useWeekday(day.day);

  return (
    <YStack fill={false} className="bg-muted rounded-lg w-full" gap="sm">
      <Collapsible className="w-full bg-transparent">
        <XStack
          className="w-full bg-transparent"
          fill={false}
          justify="between"
          padding="none"
          align="center">
          <YStack fill={false} padding="none" className="bg-transparent" gap="sm">
            <XStack fill={false} padding="none" className="bg-transparent" gap="sm">
              <Text className="text-foreground text-xl">
                {isWeekday ? string : `${t('common.day')} ${day.day + 1}`}
              </Text>
              <Text className="text-xl font-bold">{day.name}</Text>
            </XStack>
            <Text className="text-lg text-muted-foreground">
              {day.exercises.length} {t('workout.exercises')}
            </Text>
          </YStack>
          <CollapsibleTrigger asChild>
            <Button variant="ghost">
              <ThemedIcon name="ChevronsUpDown" size={16} />
            </Button>
          </CollapsibleTrigger>
        </XStack>
        <CollapsibleContent>
          <FlashList
            data={day.exercises}
            keyExtractor={(item) => item.localId}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={(item) => (
              <>
                <ExerciseItemSimple
                  className="bg-tranparent"
                  size={96}
                  exercise={getExerciseById(item.item.exerciseId)}>
                  <Text className="text-muted-foreground">
                    {item.item.targetSets && `${item.item.targetSets} ${t('workout.sets')}`}
                    {item.item.targetReps && ` X ${item.item.targetReps} ${t('workout.reps')}`}
                  </Text>
                  <Text className="text-muted-foreground">
                    {item.item.restTime &&
                      `${item.item.restTime} ${t('common.seconds_short')} ${t('workout.rest')}`}
                  </Text>
                </ExerciseItemSimple>
              </>
            )}
            estimatedItemSize={12}
          />
        </CollapsibleContent>
      </Collapsible>
    </YStack>
  );
};

export default PublicPlanPage;
