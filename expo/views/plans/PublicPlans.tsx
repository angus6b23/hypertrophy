import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner-native';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { useAccountStore } from '~/utils/stores/account-store';
import { backend } from '~/utils/backend';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack, YStack } from '~/components/ui/Stacks';
import { RadioDropdown } from '~/components/ui/RadioDropdown';
import { PublicPlan } from 'share/interfaces/Workout';

export const PublicPlans = () => {
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const { t } = useTranslation();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'update' | 'name'>('update');
  const [page, setPage] = useState(0);
  const [asc, setAsc] = useState(false);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [more, setMore] = useState(true);

  const toLoginPage = useCallback(() => {
    router.push('/login');
  }, []);

  const fetchPublicPlans = useCallback(
    async (append = false) => {
      try {
        const plans = await backend.plans.getPublicPlans({
          page,
          sort,
          query,
          asc,
        });
        if (plans.length === 0) setMore(false);
        if (append) {
          setPlans((prevState) => [...prevState, ...plans]);
        } else {
          setPlans(() => [...plans]);
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [query, page, asc, sort]
  );

  const debouncedFetch = useDebouncedCallback(fetchPublicPlans, 250);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPublicPlans(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setMore(true);
    setPage(0);
    debouncedFetch(false);
  }, [query, sort, asc]);

  useEffect(() => {
    debouncedFetch(true);
  }, [page]);

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
      <>
        <YStack fill={false} gap="sm">
          <XStack fill={false} padding="none" gap="sm" align="center">
            <ThemedIcon name="Search" size={16} />
            <Input
              placeholder={t('common.search')}
              value={query}
              onChangeText={(s) => setQuery(s)}
              className="flex-1"
            />
          </XStack>
          <XStack fill={false} padding="none" align="start" justify="between" className="w-full">
            <RadioDropdown
              buttonText={`${t('common.sort_by')}: ${sort === 'update' ? t('common.update_date') : t('common.name')}`}
              items={[
                { label: t('common.update_date'), value: 'update' },
                { label: t('common.name'), value: 'name' },
              ]}
              currentItem={sort}
              callback={(val) => setSort(val)}
            />
            <Button
              variant="secondary"
              onPress={() => {
                setAsc((prevState) => !prevState);
              }}>
              {asc ? (
                <ThemedIcon name="ArrowUpNarrowWide" size={16} />
              ) : (
                <ThemedIcon name="ArrowDownWideNarrow" size={16} />
              )}
            </Button>
          </XStack>
        </YStack>
        <FlashList
          data={plans}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 48,
            paddingHorizontal: 12,
          }}
          ItemSeparatorComponent={() => <View className="h-8" />}
          renderItem={(item) => (
            <>
              <TouchableOpacity
                className="rounded-lg bg-secondary"
                onPress={() => {
                  router.push(`/(zShare)/publicPlan/${item.item.id}`);
                }}>
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
          onEndReached={() => {
            if (more) {
              setPage((prev) => prev + 1);
            }
          }}
          onEndReachedThreshold={1}
        />
      </>
    );
  }
};
