import { useTranslation } from 'react-i18next';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { XStack } from '~/components/ui/Stacks';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export const AbandonDialog = ({
  abdDiag,
  setAbdDiag,
}: {
  abdDiag: boolean;
  setAbdDiag: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const abandon = useWorkoutStore((s) => s.abandon);
  const handleConfirm = useCallback(() => {
    abandon();
    router.replace('/(tabs)/workout');
  }, []);
  return (
    <Dialog open={abdDiag} onOpenChange={setAbdDiag}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="p-0">
          <ThemedIcon name="NotebookPen" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('workout.abondon_session')}</DialogTitle>
          <DialogDescription>
            <Text>{t('workout.all_records_in_current_session_will_be_removed')}</Text>
            <Text>
              {t('workout.are_you_sure_you_would_like_to_abandon_current_workout_session')}
            </Text>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild>
              <Button className="flex-1" variant="destructive" onPress={handleConfirm}>
                <Text>{t('common.abandon')}</Text>
              </Button>
            </DialogClose>
            <DialogClose className="flex-1" asChild>
              <Button variant="ghost" className="text-center">
                <Text>{t('common.cancel')}</Text>
              </Button>
            </DialogClose>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
