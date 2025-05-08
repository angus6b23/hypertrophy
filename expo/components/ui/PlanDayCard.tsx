import { PlanDay } from 'share/interfaces/Workout';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Text } from './text';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './dropdown-menu';
import { ThemedIcon } from './ThemedIcon';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { useColors } from '~/utils/rn-reusables/useColors';
import { XStack } from './Stacks';
import { PlanDayContext } from '~/app/(tabs)/workout';
import { TouchableNativeFeedback } from 'react-native';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import { Item } from 'react-native-picker-select';

export const PlanDayCard = ({
  day,
  idx,
  drag,
}: {
  day: PlanDay;
  idx: number;
  drag: RenderItemParams<Item>['drag'];
}) => {
  return (
    <TouchableNativeFeedback onLongPress={drag}>
      <Card className="w-full border-0 bg-muted text-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <Text className="text-lg">{day.name}</Text>
          </CardTitle>
          <CardDropDown idx={idx} />
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground">{day.day}</Text>
        </CardContent>
      </Card>
    </TouchableNativeFeedback>
  );
};

export const CardDropDown = (props: { idx: number }) => {
  const { t } = useTranslation();
  const colors = useColors();
  const { setShow, setIdx, setShowDelete } = useContext(PlanDayContext);

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
            setIdx(props.idx);
            setShow(true);
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
            setIdx(props.idx);
            setShowDelete(true);
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
  );
};
