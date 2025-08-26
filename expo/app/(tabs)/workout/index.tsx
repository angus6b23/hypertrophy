import RNPickerSelect, { Item } from 'react-native-picker-select';
import { Link, Redirect, Stack } from 'expo-router';
import { SafeAreaView, View } from 'react-native';
import { XStack, YStack } from '~/components/ui/Stacks';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { Button } from '~/components/ui/button';
import { PlanDayCard } from '~/components/ui/PlanDayCard';
import { Label } from '@rn-primitives/dropdown-menu';
import { useState, useRef, useEffect, useContext, createContext, useCallback } from 'react';
import { PlanDay } from 'share/interfaces/Workout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { useColorScheme } from 'nativewind';
import { useColors } from '~/utils/rn-reusables/useColors';
import { toast } from 'sonner-native';
import { useCurrentPlan } from '~/utils/hooks/use-current-plan';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

export const PlanDayContext = createContext({
  show: false,
  setShow: (_val: boolean) => {},
  idx: -1,
  setIdx: (_val: number) => {},
  showDelete: false,
  setShowDelete: (_bool: boolean) => {},
});

const WorkoutPage = () => {
  const { t } = useTranslation();
  const currentPlan = useCurrentPlan();
  const update = useWorkoutPlanStore((s) => s.update);
  const [show, setShow] = useState(false);
  const [idx, setIdx] = useState(-1);
  const [showDelete, setShowDelete] = useState(false);

  if (!currentPlan) {
    return <Redirect href="/(tabs)/workout/listPlan" />;
  }

  return (
    <>
      <PlanDayContext.Provider value={{ show, setShow, idx, setIdx, showDelete, setShowDelete }}>
        <Stack.Screen
          options={{
            title: `${t('plan.current_plan')}: ${currentPlan.name}`,
            headerBackVisible: false,
            headerShown: true,
            headerRight: () => (
              <Link href="/(tabs)/workout/listPlan">
                <ThemedIcon name="SquarePen" size={24} />
              </Link>
            ),
          }}
        />
        <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
          <AddDayDialog />
          <DeleteConfirmDialog />
          <DraggableFlatList
            data={currentPlan.days}
            renderItem={(params) => (
              <ScaleDecorator>
                <PlanDayCard
                  idx={params.getIndex() as number}
                  day={params.item}
                  drag={params.drag}
                />
              </ScaleDecorator>
            )}
            keyExtractor={(item) => `${item.name}-${item.day}`}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            ListFooterComponent={() => (
              <Button
                className="mt-4 w-full"
                onPress={() => {
                  setIdx(-1);
                  setShow(true);
                }}>
                <Text>{t('workout.add_workout_day')}</Text>
              </Button>
            )}
            onDragEnd={(params) => {
              const newDays = params.data;
              update(currentPlan.localId, { ...currentPlan, days: newDays });
            }}
          />
        </SafeAreaView>
      </PlanDayContext.Provider>
    </>
  );
};

const AddDayDialog = () => {
  const { show, setShow, idx, setIdx } = useContext(PlanDayContext);
  const currentPlanId = useWorkoutPlanStore((s) => s.currentPlan);
  const update = useWorkoutPlanStore((s) => s.update);

  const { t } = useTranslation();
  const currentPlan = useCurrentPlan();

  const initState: PlanDay = {
    name: '',
    day: 0,
    exercises: [],
  };

  const [state, setState] = useState<PlanDay>(initState);

  useEffect(() => {
    if (idx !== -1) {
      const day = currentPlan.days[idx];
      setState(day);
    }
  }, [idx]);

  const handleSubmit = () => {
    if (state.name === '') {
      toast.error(t('plan.day_name_is_empty'));
      return;
    }
    if (idx === -1) {
      update(currentPlanId, {
        ...currentPlan,
        days: [...currentPlan.days, state],
      });
      toast.success(t('plan.day_added'));
    } else {
      const currentDays = currentPlan.days;
      const newDays = currentDays.map((day, i) => (i === idx ? state : day));
      update(currentPlanId, {
        ...currentPlan,
        days: newDays,
      });
    }
    setState(initState);
    setIdx(-1);
    setShow(false);
  };

  const weekdayItemsRef = useRef<Item[]>([
    { label: t('common.sunday'), value: 0, key: 1 },
    { label: t('common.monday'), value: 1, key: 2 },
    { label: t('common.tuesday'), value: 2, key: 3 },
    { label: t('common.wednesday'), value: 3, key: 4 },
    { label: t('common.thursday'), value: 4, key: 5 },
    { label: t('common.friday'), value: 5, key: 6 },
    { label: t('common.saturday'), value: 6, key: 7 },
  ]);
  const genericdayItemsRef = useRef<Item[]>(
    new Array(12).fill(0).map((_, i) => ({ label: `${i + 1}`, value: i, key: i }))
  );

  return (
    <Dialog
      open={show}
      onOpenChange={(val) => {
        setShow(val);
        setState(initState);
        setIdx(-1);
      }}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('workout.add_workout_day')}</DialogTitle>
        </DialogHeader>
        <YStack padding="none" fill={false} className="w-full">
          <View className="w-full">
            <Label className="text-foreground">{t('common.name')}</Label>
            <Input
              className="w-full"
              placeholder={t('plan.name_of_workout_day')}
              value={state.name}
              onChangeText={(name) => setState((prevState) => ({ ...prevState, name }))}
            />
          </View>
          <View className="flex w-full flex-col">
            <Label className="text-foreground">{t('workout.workout_day')}</Label>
            <DayDropdown
              value={state.day}
              valueChange={(d) => setState((prevState) => ({ ...prevState, day: d }))}
              items={currentPlan.isWeekday ? weekdayItemsRef.current : genericdayItemsRef.current}
            />
          </View>
        </YStack>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" onPress={handleSubmit}>
              <Text>{t(idx === -1 ? 'common.add' : 'common.edit')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DayDropdown = ({
  value,
  valueChange,
  items,
}: {
  value: number;
  valueChange: (v: number) => void;
  items: Item[];
}) => {
  const { colorScheme } = useColorScheme();
  const colors = useColors();
  return (
    <RNPickerSelect
      placeholder={{}}
      onValueChange={valueChange}
      value={value}
      style={{
        inputAndroid: {
          fontSize: 16,
          paddingRight: 12,
          color: colors.text,
          textAlign: 'right',
        },
        inputIOS: {
          flex: 16,
          color: colors.text,
          textAlign: 'right',
        },
      }}
      items={items}
      Icon={() => <></>}
      darkTheme={colorScheme === 'dark'}
      useNativeAndroidPickerStyle={true}
    />
  );
};

const DeleteConfirmDialog = () => {
  const { t } = useTranslation();
  const { idx, setIdx, setShowDelete, showDelete } = useContext(PlanDayContext);
  const update = useWorkoutPlanStore((s) => s.update);
  const currentPlanId = useWorkoutPlanStore((s) => s.currentPlan);
  const currentPlan = useCurrentPlan();

  const handleDelete = useCallback(async () => {
    const newDays = currentPlan.days.filter((_day, i) => i !== idx);
    update(currentPlanId, { ...currentPlan, days: newDays });
    setShowDelete(false);
    setIdx(-1);
    toast.success(t('common.delete_success'));
  }, [idx, currentPlan, currentPlanId]);

  return (
    <Dialog
      open={showDelete}
      onOpenChange={() => {
        setShowDelete(false);
        setIdx(-1);
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.confirm_delete')}</DialogTitle>
          <DialogDescription>
            {t('common.are_you_sure_to_delete_this_workout_day')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" variant="destructive" onPress={handleDelete}>
              <Text>{t('common.confirm')}</Text>
            </Button>
            <Button
              className="flex-1"
              onPress={() => {
                setShowDelete(false);
                setIdx(-1);
              }}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default WorkoutPage;
