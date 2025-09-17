import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Plan } from 'share/interfaces/Workout';

import { XStack } from './Stacks';
import { ThemedIcon } from './ThemedIcon';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Text } from './text';

import { MyPlansContext } from '~/app/(tabs)/workout/listPlan';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useWorkoutPlanStore } from '~/utils/stores/workout-plan-store';
import { useRouter } from 'expo-router';

export const PlanCard = ({ plan }: { plan: Plan }) => {
  const currentPlan = useWorkoutPlanStore((s) => s.currentPlan);
  const change = useWorkoutPlanStore((s) => s.change);

  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Card className="w-full text-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <Text className="text-lg">{plan.name}</Text>
        </CardTitle>
        <CardDropDown id={plan.localId} />
      </CardHeader>
      <CardContent>
        <Text className="text-muted-foreground">{plan.description}</Text>
        <Button
          onPress={() => {
            change(plan.localId);
            router.replace('/(tabs)/workout');
          }}
          className="mt-2 w-full"
          disabled={currentPlan === plan.localId}>
          <Text>
            {currentPlan === plan.localId ? t('plan.current_plan') : t('plan.set_as_current_plan')}
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
};

export const CardDropDown = (props: { id: string }) => {
  const { t } = useTranslation();
  const colors = useColors();
  const ctx = useContext(MyPlansContext);
  const currentPlan = useWorkoutPlanStore((s) => s.currentPlan);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <ThemedIcon name="EllipsisVertical" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align="end">
        <DropdownMenuItem
          onPress={() => {
            ctx.setPlanId(props.id);
            ctx.setShowDialog(true);
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
        {props.id !== currentPlan && (
          <DropdownMenuItem
            onPress={() => {
              ctx.setPlanId(props.id);
              ctx.setShowDeleteDialog(true);
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
