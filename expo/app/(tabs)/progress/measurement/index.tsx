import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { MeasurementCard } from '~/components/ui/MeasurementCard';
import { XStack } from '~/components/ui/Stacks';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { backend } from '~/utils/backend';
import { useInfinityScroll } from '~/utils/hooks/infinity-scroll';
import { useAccountStore } from '~/utils/stores/account-store';
import { useMeasurementStore } from '~/utils/stores/measurement-store';

export const MeasurementContext = createContext({ removeId: '', setRemove: (s: string) => {} });
export const MeasurementPage = () => {
  const measurements = useMeasurementStore((state) => state.data);
  const [remove, setRemove] = useState('');
  const [innerData, infinityScroll] = useInfinityScroll(measurements);

  return (
    <>
      <MeasurementContext.Provider value={{ removeId: remove, setRemove }}>
        <FlashList
          data={innerData}
          keyExtractor={(item) => item.localId}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={(item) => <MeasurementCard data={item.item} />}
          estimatedItemSize={200}
          onEndReached={infinityScroll}
          onEndReachedThreshold={1}
        />

        <FloatingButton />
        <DeleteConfirmDialog />
      </MeasurementContext.Provider>
    </>
  );
};
const FloatingButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      size="floating"
      onPress={() => router.push('/(zShare)/measurement/add-measurement')}
      className="absolute bottom-6 right-6 aspect-square bg-foreground">
      <ThemedIcon name="Plus" size={28} inverted />
    </Button>
  );
};

const DeleteConfirmDialog = () => {
  const { t } = useTranslation();
  const ctx = useContext(MeasurementContext);
  const { data, delete: deleteMeasurement } = useMeasurementStore();
  const { isLoggedIn } = useAccountStore();
  const handleDelete = useCallback(async () => {
    deleteMeasurement(ctx.removeId);
    if (isLoggedIn) {
      try {
        const item = data.find((item) => item.localId === ctx.removeId);
        if (item && item.id) {
          await backend.measurement.delete(item.localId);
        }
      } catch {}
    }
    ctx.setRemove('');
    toast.success(t('common.delete_success'));
  }, [ctx.removeId]);

  return (
    <Dialog open={ctx.removeId !== ''} onOpenChange={() => ctx.setRemove('')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.confirm_delete')}</DialogTitle>
          <DialogDescription>
            {t('common.are_you_sure_to_delete_this_measurement')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" variant="destructive" onPress={handleDelete}>
              <Text>{t('common.confirm')}</Text>
            </Button>
            <Button className="flex-1" onPress={() => ctx.setRemove('')}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
