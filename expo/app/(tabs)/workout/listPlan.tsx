import { Label } from '@rn-primitives/dropdown-menu';
import { FlashList } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { t } from 'i18next';
import { nanoid } from 'nanoid/non-secure';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useAccountStore } from '~/utils/stores/account-store';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';

const ListPlanPage = () => {
  const [tab, setTab] = useState(0);
  const colors = useColors();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('plan.workout_plans') }} />
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
  showDeleteDialog: false,
  setShowDeleteDialog: (_bool: boolean) => {},
  planId: '',
  setPlanId: (_id: string) => {},
});

const MyPlans = () => {
  const workoutPlanStore = useWorkoutPlanStore();
  const [planId, setPlanId] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <MyPlansContext.Provider
      value={{
        planId,
        setPlanId,
        showDialog,
        setShowDialog,
        showDeleteDialog,
        setShowDeleteDialog,
      }}>
      <View className="relative flex-1">
        <PlanDialog />
        <DeleteConfirmDialog />
        <FlashList
          data={workoutPlanStore.plans}
          renderItem={(item) => <PlanCard plan={item.item} />}
          ItemSeparatorComponent={() => <View className="h-4" />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
        />
        <Button
          size="floating"
          className="absolute bottom-6 right-6"
          onPress={() => setShowDialog(true)}>
          <ThemedIcon name="Plus" size={26} inverted />
        </Button>
      </View>
    </MyPlansContext.Provider>
  );
};

const PlanDialog = () => {
  const ctx = useContext(MyPlansContext);
  const plans = useWorkoutPlanStore((state) => state.plans);
  const add = useWorkoutPlanStore((state) => state.add);
  const change = useWorkoutPlanStore((state) => state.change);
  const update = useWorkoutPlanStore((state) => state.update);
  const currentPlanId = useWorkoutPlanStore((state) => state.currentPlan);
  const router = useRouter();
  // Initial state for adding or editing plan dialog
  const initState: Omit<Plan, 'localId' | 'days' | 'lastUpdate'> = {
    name: '',
    description: '',
    isWeekday: true,
    isPublic: true,
  };
  // State for saving form state
  const [state, setState] = useState(initState);

  // Listen to context planId, set form state to selected plan when planId is not empty
  useEffect(() => {
    if (ctx.planId) {
      const currentPlan = plans.find((plan) => plan.localId === ctx.planId);
      if (currentPlan) {
        setState(currentPlan);
      } else {
        ctx.setPlanId('');
      }
    }
  }, [ctx.planId]);

  const handleSubmit = useCallback(() => {
    let localId;
    // Add plan if current plan does not exist
    if (!ctx.planId) {
      localId = nanoid(10);
      const days: PlanDay[] = [];
      const newPlan = { ...state, localId, days, lastUpdate: new Date().toISOString() };
      add(newPlan);
      toast.success(t('plan.plan_added'));
    } else {
      // Edit plan if current plan exist
      localId = ctx.planId;
      const currentPlan = plans.find((plan) => plan.localId === ctx.planId) as Plan;
      update(ctx.planId, { ...currentPlan, ...state });
      toast.success(t('plan.plan_modified'));
    }
    // Automatically set the current plan to new plan and redirect user back to workout page if no plan exists before
    if (!currentPlanId) {
      change(localId);
      router.push('/(tabs)/workout');
    }
    ctx.setShowDialog(false);
    ctx.setPlanId('');
    setState(initState);
  }, [ctx, state, plans]);

  return (
    <Dialog
      open={ctx.showDialog}
      onOpenChange={(val) => {
        ctx.setShowDialog(val);
        ctx.setPlanId('');
        setState(initState);
      }}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>
            {ctx.planId === '' ? t('plan.create_new_plan') : t('plan.edit_plan')}
          </DialogTitle>
        </DialogHeader>
        <YStack padding="none" fill={false} className="w-full">
          <View className="w-full">
            <Label className="text-foreground">{t('common.name')}</Label>
            <Input
              className="w-full"
              placeholder={t('plan.your_plan_name')}
              value={state.name}
              onChangeText={(name) => setState((prevState) => ({ ...prevState, name }))}
            />
          </View>
          <View className="w-full">
            <Label className="text-foreground">{t('common.description')}</Label>
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
            <Label className="text-foreground">{t('plan.use_weekday_for_plan')}</Label>
          </XStack>
          <XStack fill={false} padding="none">
            <Checkbox
              checked={state.isPublic}
              onCheckedChange={(isPublic) => setState((prevState) => ({ ...prevState, isPublic }))}
            />
            <Label className="text-foreground">{t('plan.make_plan_public')}</Label>
          </XStack>
        </YStack>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" onPress={handleSubmit}>
              <Text>{ctx.planId === '' ? t('common.add') : t('common.edit')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmDialog = () => {
  const { t } = useTranslation();
  const ctx = useContext(MyPlansContext);
  const { remove } = useWorkoutPlanStore();
  const { isLoggedIn } = useAccountStore();

  const handleDelete = useCallback(async () => {
    remove(ctx.planId);
    if (isLoggedIn) {
      try {
        // TODO: Add plan workout remove to backend
      } catch {}
    }
    ctx.setShowDeleteDialog(false);
    ctx.setPlanId('');
    toast.success(t('common.delete_success'));
  }, [ctx.planId]);

  return (
    <Dialog
      open={ctx.showDeleteDialog}
      onOpenChange={(val) => {
        ctx.setShowDeleteDialog(val);
        ctx.setPlanId('');
      }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.confirm_delete')}</DialogTitle>
          <DialogDescription>
            {t('common.are_you_sure_to_delete_this_workout_plan')}
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
                ctx.setShowDeleteDialog(false);
                ctx.setPlanId('');
              }}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListPlanPage;
