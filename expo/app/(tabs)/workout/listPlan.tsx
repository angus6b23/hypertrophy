import { Label } from '@rn-primitives/dropdown-menu';
import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { t } from 'i18next';
import { nanoid } from 'nanoid/non-secure';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import MaterialTabs from 'react-native-material-tabs';
import { Plan, PlanDay } from 'share/interfaces/Workout';
import { toast } from 'sonner-native';

import { PlanCard } from '~/components/ui/PlanCard';
import { XStack, YStack } from '~/components/ui/Stacks';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';

const ListPlanPage = () => {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <MaterialTabs
        items={[t('plan.plans'), t('plan.public_plans')]}
        selectedIndex={tab}
        onChange={setTab}
        barColor={colors.card}
        indicatorColor={colors.primary}
        activeTextColor={colors.text}
        inactiveTextColor={colors.text}
      />
      {tab === 0 && <MyPlans />}
      {tab === 1 && <PublicPlans />}
    </>
  );
};

export const MyPlansContext = createContext({
  showDialog: false,
  setShowDialog: (_bool: boolean) => {},
  planId: '',
  setPlanId: (_id: string) => {},
});

const MyPlans = () => {
  const workoutPlanStore = useWorkoutPlanStore();
  const [planId, setPlanId] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  return (
    <MyPlansContext.Provider value={{ planId, setPlanId, showDialog, setShowDialog }}>
      <PlanDialog />
      <FlashList
        data={workoutPlanStore.plans}
        renderItem={(item) => <PlanCard plan={item.item} />}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8 }}
      />
      <Button
        size="floating"
        className="absolute bottom-6 right-6"
        onPress={() => setShowDialog(true)}>
        <ThemedIcon name="Plus" size={26} inverted />
      </Button>
    </MyPlansContext.Provider>
  );
};

const PlanDialog = () => {
  const ctx = useContext(MyPlansContext);
  const workoutPlanStore = useWorkoutPlanStore();
  const initState = {
    name: '',
    description: '',
    isWeekday: true,
    isPublic: true,
  };
  const [state, setState] = useState<Omit<Plan, 'localId' | 'days'>>(initState);
  useEffect(() => {
    if (ctx.planId) {
      const currentPlan = workoutPlanStore.plans.find((plan) => plan.localId === ctx.planId);
      if (currentPlan) {
        setState(currentPlan);
      } else {
        ctx.setPlanId('');
      }
    }
  }, [ctx.planId]);
  const handleSubmit = useCallback(() => {
    if (!ctx.planId) {
      const localId = nanoid(10);
      const days: PlanDay[] = [];
      const newPlan = { ...state, localId, days } as Plan;
      workoutPlanStore.add(newPlan);
      toast.success(t('plan.plan_added'));
      ctx.setShowDialog(false);
      setState(initState);
    } else {
      const currentPlan = workoutPlanStore.plans.find(
        (plan) => plan.localId === ctx.planId
      ) as Plan;
      workoutPlanStore.update(ctx.planId, { ...currentPlan, ...state });
      toast.success(t('plan.plan_modified'));
      ctx.setShowDialog(false);
      setState(initState);
    }
  }, [ctx, state]);
  return (
    <Dialog open={ctx.showDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ctx.planId === '' ? t('plan.create_new_plan') : t('plan.edit_plan')}
          </DialogTitle>
        </DialogHeader>
        <YStack padding="none" fill={false} className="w-full">
          <View className="w-full">
            <Label>{t('common.name')}</Label>
            <Input
              className="w-full"
              placeholder={t('plan.your_plan_name')}
              value={state.name}
              onChangeText={(name) => setState((prevState) => ({ ...prevState, name }))}
            />
          </View>
          <View className="w-full">
            <Label>{t('common.description')}</Label>
            <Input
              className="w-full"
              placeholder={t('plan.a_short_description_of_your_plan')}
              value={state.description}
              onChangeText={(description) =>
                setState((prevState) => ({ ...prevState, description }))
              }
            />
          </View>
          <XStack fill={false} padding="none">
            <Checkbox
              checked={state.isWeekday}
              onCheckedChange={(isWeekday) =>
                setState((prevState) => ({ ...prevState, isWeekday }))
              }
            />
            <Label>{t('plan.use_weekday_for_plan')}</Label>
          </XStack>
          <XStack fill={false} padding="none">
            <Checkbox
              checked={state.isPublic}
              onCheckedChange={(isPublic) => setState((prevState) => ({ ...prevState, isPublic }))}
            />
            <Label>{t('plan.make_plan_public')}</Label>
          </XStack>
        </YStack>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" onPress={handleSubmit}>
              <Text>{ctx.planId === '' ? t('common.add') : t('common.edit')}</Text>
            </Button>
            <Button className="flex-1" variant="outline" onPress={() => ctx.setShowDialog(false)}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListPlanPage;
