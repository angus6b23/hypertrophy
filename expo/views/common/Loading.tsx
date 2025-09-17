import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { YStack } from '~/components/ui/Stacks';

function Loading() {
  const { t } = useTranslation();

  return (
    <YStack
      justify="center"
      align="center"
      className="absolute top-0 left-0 w-full h-full bg-background/60 backdrop-blur-md">
      <YStack fill={false} padding="none" className="bg-transparent animate-spin">
        <ThemedIcon name="Shell" size={48} />
        <Text>{t('common.loading')}</Text>
      </YStack>
    </YStack>
  );
}

export default Loading;
