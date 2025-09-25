import { useTranslation } from 'react-i18next';

import { useColors } from '~/utils/rn-reusables/useColors';
import { ThemedIcon } from './ThemedIcon';
import { YStack } from './Stacks';
import { Text } from './text';

const NoHistory = () => {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <YStack fill={true} padding="none" justify="center" align="center" className="h-96 w-full">
      <ThemedIcon name="ListFilterPlus" size={96} color={colors.neutral} />
      <Text className="text-md text-muted-foreground">{t('workout.no_history_found')}</Text>
      <Text className="text-md text-muted-foreground">{t('workout.do_some_workout')}</Text>
    </YStack>
  );
};
export default NoHistory;
