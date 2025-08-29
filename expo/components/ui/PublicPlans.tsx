import { useAccountStore } from '~/utils/stores/account-store';
import { Text } from './text';
import { useTranslation } from 'react-i18next';
import { XStack, YStack } from './Stacks';
import { ThemedIcon } from './ThemedIcon';
import { Button } from './button';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { PublicPlan } from 'share/interfaces/Workout';
import { View } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { backend } from '~/utils/backend';
import { FlashList } from '@shopify/flash-list';
import { size } from '@shopify/react-native-skia';
import { TouchableOpacity } from 'react-native';
import exercise from '~/app/(tabs)/exercise';

export const PublicPlans = () => {
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const { t } = useTranslation();
  const router = useRouter();
  const [plans, setPlans] = useState<PublicPlan[]>([]);

  const toLoginPage = useCallback(() => {
    router.push('/login');
  }, []);

  const fetchPublicPlans = useCallback(async (page = 1) => {
    try {
      const plans = await backend.plans.getPublicPlans(page);
      setPlans((prevState) => [...prevState, ...plans]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPublicPlans();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <YStack justify="center" align="center">
        <ThemedIcon name="Key" size={64} />
        <Text className="text-lg">{t('plan.login_to_an_instance_to_explore_public_plans')}</Text>
        <Button onPress={toLoginPage}>
          <Text>{t('common.login')}</Text>
        </Button>
      </YStack>
    );
  } else {
    return (
      <FlashList
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 48, paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => <View className="h-8" />}
        renderItem={(item) => (
          <>
            <TouchableOpacity className="rounded-lg bg-secondary">
              <YStack fill={false} className="bg-transparent">
                <XStack
                  fill={false}
                  padding="none"
                  justify="between"
                  align="center"
                  className="w-full bg-transparent">
                  <Text className="text-lg font-bold">{item.item.name}</Text>
                  <Text className="text-lg">{item.item.owner}</Text>
                </XStack>
                <Text>{item.item.description}</Text>
              </YStack>
            </TouchableOpacity>
          </>
        )}
        estimatedItemSize={2}
      />
    );
  }
};
