import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Measurement } from 'share/interfaces/Measurements';

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

import { MeasurementContext } from '~/app/(tabs)/progress/measurement';
import { fromCm, fromKg } from '~/utils/misc/unit-conversion';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useOptionStore } from '~/utils/stores/option-store';

export const MeasurementCard = ({ data }: { data: Measurement }) => {
  const { t } = useTranslation();
  const options = useOptionStore();

  return (
    <Card className="w-full text-foreground">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <Text className="text-lg">
            {new Date(data.date).toLocaleDateString(options.language)}
          </Text>
        </CardTitle>
        <CardDropDown data={data} />
      </CardHeader>
      <CardContent>
        <XStack className="w-full flex-wrap" padding="none" justify="between" fill={false}>
          {data.weight !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.weight')}: {fromKg(data.weight, options.unit.measurementWeight)}{' '}
                {t(`unit.${options.unit.measurementWeight}`)}
              </Text>
            </View>
          )}
          {data.height !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.height')}: {fromCm(data.height, options.unit.measurementLength)}{' '}
                {t(`unit.${options.unit.measurementLength}`)}
              </Text>
            </View>
          )}
          {data.bodyFat !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.body_fat')}: {data.bodyFat} %
              </Text>
            </View>
          )}
          {data.chest !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.chest')}: {fromCm(data.chest, options.unit.measurementLength)}{' '}
                {t(`unit.${options.unit.measurementLength}`)}
              </Text>
            </View>
          )}
          {data.hip !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.hip')}: {fromCm(data.hip, options.unit.measurementLength)}{' '}
                {t(`unit.${options.unit.measurementLength}`)}
              </Text>
            </View>
          )}
          {data.waist !== undefined && (
            <View className="w-1/3">
              <Text>
                {t('measurement.waist')}: {fromCm(data.waist, options.unit.measurementLength)}{' '}
                {t(`unit.${options.unit.measurementLength}`)}
              </Text>
            </View>
          )}
        </XStack>
      </CardContent>
    </Card>
  );
};

export const CardDropDown = (props: { data: Measurement }) => {
  const { t } = useTranslation();
  const colors = useColors();
  const router = useRouter();
  const ctx = useContext(MeasurementContext);

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
            router.push(`/(zShare)/measurement/add-measurement?id=${props.data.localId}`);
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
        <DropdownMenuItem onPress={() => ctx.setRemove(props.data.localId)}>
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
