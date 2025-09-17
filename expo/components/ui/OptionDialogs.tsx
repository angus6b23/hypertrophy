import { t } from 'i18next';
import { XStack, YStack } from './Stacks';
import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Text } from './text';
import { useOptionStore } from '~/utils/stores/option-store';
import { useCallback, useState } from 'react';
import { Input } from './input';

export const SetDialogs = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const initVal = useOptionStore((s) => s.workout.defaultSets);
  const workoutSettings = useOptionStore((s) => s.workout);
  const modify = useOptionStore((s) => s.modify);

  const [val, setVal] = useState(initVal);
  const handleChange = useCallback((s: string) => {
    const num = Number(s);
    if (!isNaN(num)) {
      setVal(num);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const payload = {
      workout: {
        ...workoutSettings,
        defaultSets: val,
      },
    };
    modify(payload);
    setOpen(false);
  }, [val]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('option.default_set')}</DialogTitle>
          <DialogDescription>
            <YStack padding="none" fill={false}>
              <Text>{t('option.default_number_of_sets_for_exercise_when_you_add_to_workout')}</Text>
              <Input
                autoFocus
                inputMode="numeric"
                className="w-full"
                value={val.toString()}
                onChangeText={(s) => handleChange(s)}
              />
            </YStack>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild>
              <Button className="flex-1" onPress={handleConfirm}>
                <Text>{t('common.confirm')}</Text>
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

export const RepDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const initVal = useOptionStore((s) => s.workout.defaultReps);
  const workoutSettings = useOptionStore((s) => s.workout);
  const modify = useOptionStore((s) => s.modify);

  const [val, setVal] = useState(initVal);
  const handleChange = useCallback((s: string) => {
    const num = Number(s);
    if (!isNaN(num)) {
      setVal(num);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const payload = {
      workout: {
        ...workoutSettings,
        defaultReps: val,
      },
    };
    modify(payload);
    setOpen(false);
  }, [val]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('option.default_reps')}</DialogTitle>
          <DialogDescription>
            <YStack padding="none" fill={false}>
              <Text>{t('option.default_reps_for_exercises_when_you_add_to_workout')}</Text>
              <Input
                autoFocus
                inputMode="numeric"
                className="w-full"
                value={val.toString()}
                onChangeText={(s) => handleChange(s)}
              />
            </YStack>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild>
              <Button className="flex-1" onPress={handleConfirm}>
                <Text>{t('common.confirm')}</Text>
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

export const RestDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const initVal = useOptionStore((s) => s.workout.defaultRest);
  const workoutSettings = useOptionStore((s) => s.workout);
  const modify = useOptionStore((s) => s.modify);

  const [val, setVal] = useState(initVal);
  const handleChange = useCallback((s: string) => {
    const num = Number(s);
    if (!isNaN(num)) {
      setVal(num);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const payload = {
      workout: {
        ...workoutSettings,
        defaultRest: val,
      },
    };
    modify(payload);
    setOpen(false);
  }, [val]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-96">
        <DialogHeader>
          <DialogTitle>{t('option.default_rest')}</DialogTitle>
          <DialogDescription>
            <YStack padding="none" fill={false}>
              <Text>{t('option.default_rest_time_for_exercises_when_you_add_to_workout')}</Text>
              <Input
                autoFocus
                inputMode="numeric"
                className="w-full"
                value={val.toString()}
                onChangeText={(s) => handleChange(s)}
              />
            </YStack>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} justify="between" padding="none" className="w-full">
            <DialogClose asChild>
              <Button className="flex-1" onPress={handleConfirm}>
                <Text>{t('common.confirm')}</Text>
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
