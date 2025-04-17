import { useRouter } from 'expo-router';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { MeasurementCard } from '~/components/ui/MeasurementCard';
import { XStack, YStack } from '~/components/ui/Stacks';
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
import { useMeasurementStore } from '~/utils/stores/measurement-store';

export const MeasurementContext = createContext({ removeId: '', setRemove: (s: string) => {} });
export const MeasurementPage = () => {
  const measurements = useMeasurementStore((state) => state.data);
  const [remove, setRemove] = useState('');

  return (
    <>
      <MeasurementContext.Provider value={{ removeId: remove, setRemove }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
          <YStack>
            {measurements.map((data) => (
              <MeasurementCard key={data.localId} data={data} />
            ))}
          </YStack>
        </ScrollView>
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
  const { delete: deleteMeasurement } = useMeasurementStore();

  return (
    <Dialog open={ctx.removeId !== ''}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.confirm_delete')}</DialogTitle>
          <DialogDescription>
            {t('common.are_you_sure_to_delete_this_measurement')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button
              className="flex-1"
              variant="destructive"
              onPress={() => {
                deleteMeasurement(ctx.removeId);
                ctx.setRemove('');
              }}>
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
