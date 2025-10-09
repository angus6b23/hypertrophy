import { SafeAreaView, TouchableNativeFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack } from '~/components/ui/Stacks';

export default function ToolPage() {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <>
      <SafeAreaView className="relative flex-1">
        <Stack.Screen options={{ headerShown: true }} />
        <XStack className="flex-wrap" justify="around">
          <TouchableNativeFeedback onPress={() => router.push('/(zShare)/tools/rmPredict')}>
            <Card className="p-8 min-w-48 flex-1 flex flex-col gap-4 bg-muted justify-center items-center">
              <ThemedIcon name="Medal" size={32} />
              <Text className="text-xl text-center">{t('tools.rm_calculator')}</Text>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => router.push('/(zShare)/tools/plate')}>
            <Card className="p-8 min-w-48 flex-1 flex flex-col gap-4 bg-muted justify-center items-center">
              <ThemedIcon name="Dumbbell" size={32} />
              <Text className="text-xl text-center">{t('tools.plate_calculator')}</Text>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => router.push('/(zShare)/tools/tdee')}>
            <Card className="p-8 min-w-48 flex-1 flex flex-col gap-4 bg-muted justify-center items-center">
              <ThemedIcon name="Flame" size={32} />
              <Text className="text-xl text-center">{t('tools.TDEE_calculator')}</Text>
            </Card>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <Card className="p-8 min-w-48 flex-1 flex flex-col gap-4 bg-muted justify-center items-center">
              <ThemedIcon name="Replace" size={32} />
              <Text className="text-xl text-center">{t('tools.unit_convertor')}</Text>
            </Card>
          </TouchableNativeFeedback>
        </XStack>
      </SafeAreaView>
    </>
  );
}
