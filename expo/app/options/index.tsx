import { Stack, useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { OptionListItem } from './option-list-item';

import { List, ListItem } from '~/components/ui/List';
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
import { LengthUnit, WeightUnit } from '~/types/units';
import { backend } from '~/utils/backend';
import { readFile, writeFile } from '~/utils/filesystem';
import { localeName, Locales, locales } from '~/utils/i18next/resources';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { useAccountStore } from '~/utils/stores/account-store';
import { useMeasurementStore } from '~/utils/stores/measurement-store';
import { useOptionStore } from '~/utils/stores/option-store';
import { RepDialog, RestDialog, SetDialogs } from '~/components/ui/OptionDialogs';
import { Checkbox } from '~/components/ui/checkbox';

const OptionContext = createContext({
  showLogoutDialog: false,
  setLogoutDialog: (_val: boolean) => {},
});

function OptionPage() {
  const { t } = useTranslation();
  const [showLogoutDialog, setLogoutDialog] = useState(false);
  return (
    <>
      <Stack.Screen options={{ title: t('common.options'), headerShown: true }} />
      <OptionContext.Provider value={{ showLogoutDialog, setLogoutDialog }}>
        <LogoutDialog />
        <ScrollView>
          <YStack gap="lg">
            <AccountSetting />
            <UISettings />
            <WorkoutSetting />
            <UnitSettings />
            <DataSettings />
          </YStack>
        </ScrollView>
      </OptionContext.Provider>
    </>
  );
}

const UISettings = () => {
  const { t, i18n } = useTranslation();

  const { setColorScheme } = useColorScheme();
  const options = useOptionStore();
  const handleThemeChange = useCallback((val: typeof options.theme) => {
    options.changeTheme(val);
    setColorScheme(val);
  }, []);
  const handleLanguageChange = useCallback((val: Locales) => {
    options.changeLanguage(val);
    i18n.changeLanguage(val);
  }, []);
  const getLanguages = useCallback(() => {
    return locales.map((locale) => {
      return {
        label: localeName[locale],
        value: locale,
      };
    });
  }, []);
  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('common.UI')}</Text>
        <List>
          <OptionListItem
            value={options.theme}
            onValueChange={handleThemeChange}
            label={t('common.theme')}
            icon="SunMoon"
            items={[
              { label: t('common.system'), value: 'system', key: 'system' },
              { label: t('common.light'), value: 'light', key: 'light' },
              { label: t('common.dark'), value: 'dark', key: 'dark' },
            ]}
          />
          <OptionListItem
            value={options.language}
            onValueChange={handleLanguageChange}
            label={t('common.language')}
            items={getLanguages()}
            icon="Languages"
          />
        </List>
      </YStack>
    </>
  );
};

export const UnitSettings = () => {
  const { t } = useTranslation();
  const options = useOptionStore();

  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('option.preferred_units')}</Text>
        <List>
          <OptionListItem
            value={options.unit.workoutWeight}
            onValueChange={(val: WeightUnit) => options.changeUnit('workoutWeight', val)}
            label={t('unit.workout_weight')}
            icon="Dumbbell"
            items={[
              { label: t('unit.kg'), value: WeightUnit.kg },
              { label: t('unit.lbs'), value: WeightUnit.lbs },
            ]}
          />
          <OptionListItem
            value={options.unit.measurementWeight}
            onValueChange={(val: WeightUnit) => {
              options.changeUnit('measurementWeight', val);
            }}
            label={t('unit.measurement_weight')}
            icon="Weight"
            items={[
              { label: t('unit.kg'), value: WeightUnit.kg },
              { label: t('unit.lbs'), value: WeightUnit.lbs },
            ]}
          />
          <OptionListItem
            value={options.unit.measurementLength}
            onValueChange={(val: LengthUnit) => options.changeUnit('measurementLength', val)}
            label={t('unit.measurement_length')}
            icon="Ruler"
            items={[
              { label: t('unit.cm'), value: LengthUnit.cm },
              { label: t('unit.inch'), value: LengthUnit.inch },
              { label: t('unit.feet'), value: LengthUnit.feet },
            ]}
          />
        </List>
      </YStack>
    </>
  );
};

const DataSettings = () => {
  const { t } = useTranslation();

  const measurements = useMeasurementStore((state) => state.data);
  const exportData = useCallback(async () => {
    try {
      // TODO: add implementation for workout
      const workouts: string[] = [];
      const data = {
        workouts,
        measurements,
      };
      const dataJSON = JSON.stringify(data);

      await writeFile({
        name: `hypertrophy-data-${new Date().toISOString()}.json`,
        mimeType: 'application/json',
        content: dataJSON,
      });
      toast.success(t('message.data_exported_successfully'));
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [measurements]);

  // TODO: Implement zod data verification and set state
  const importData = useCallback(async () => {
    try {
      const text = await readFile();
      return text;
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, []);
  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('option.data')}</Text>
        <List>
          <ListItem icon={<ThemedIcon name="FolderOutput" />} action={exportData}>
            <Text className="text-lg">{t('option.export_data')}</Text>
          </ListItem>
          <ListItem icon={<ThemedIcon name="FolderInput" />} action={importData}>
            <Text className="text-lg">{t('option.import_data')}</Text>
          </ListItem>
        </List>
      </YStack>
    </>
  );
};

const AccountSetting = () => {
  const { t } = useTranslation();
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const displayName = useAccountStore((s) => s.displayName);
  const instance = useAccountStore((s) => s.instance);
  const profile = useOptionStore((s) => s.profile);
  const modify = useOptionStore((s) => s.modify);

  const changeDefaultShare = useCallback(() => {
    modify(
      profile.defaultShare
        ? { profile: { defaultShare: false } }
        : { profile: { defaultShare: true } }
    );
  }, [profile.defaultShare]);

  const router = useRouter();

  const ctx = useContext(OptionContext);
  return (
    <>
      <YStack padding="none">
        <Text className="text-xl">{t('option.account')}</Text>
        <List>
          {isLoggedIn ? (
            <>
              <ListItem icon={<ThemedIcon name="User" />} action={() => ctx.setLogoutDialog(true)}>
                <Text className="text-lg">{`${t('option.logged_in_as')} ${displayName}`}</Text>
                <Text className="text-muted-foreground">{instance}</Text>
              </ListItem>
              <ListItem
                icon={<ThemedIcon name="Earth" />}
                select={
                  <Checkbox checked={profile.defaultShare} onCheckedChange={changeDefaultShare} />
                }
                action={changeDefaultShare}>
                <Text className="text-lg">{t('option.share_workout_by_default')}</Text>
              </ListItem>
            </>
          ) : (
            <ListItem icon={<ThemedIcon name="User" />} action={() => router.push('/login')}>
              <Text className="text-lg">{`${t('option.login_now')} ${displayName}`}</Text>
            </ListItem>
          )}
          {/* TODO: Add auto share workout and profile setting */}
        </List>
      </YStack>
    </>
  );
};

const LogoutDialog = () => {
  const { t } = useTranslation();
  const ctx = useContext(OptionContext);
  const accountStore = useAccountStore();

  const handleLogout = useCallback(async () => {
    try {
      await backend.auth.logout();
      accountStore.logout();
      toast.success(t('auth.logged_out_successfully'));
      ctx.setLogoutDialog(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, []);
  return (
    <Dialog open={ctx.showLogoutDialog} onOpenChange={(val) => ctx.setLogoutDialog(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('option.confirm_logout')}</DialogTitle>
          <DialogDescription>
            {t('option.do_you_want_to_logout_current_account?')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <XStack fill={false} padding="none">
            <Button className="flex-1" variant="destructive" onPress={handleLogout}>
              <Text>{t('common.confirm')}</Text>
            </Button>
            <Button className="flex-1" onPress={() => ctx.setLogoutDialog(false)}>
              <Text>{t('common.cancel')}</Text>
            </Button>
          </XStack>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const WorkoutSetting = () => {
  const { t } = useTranslation();
  const [setDiag, setSetDiag] = useState(false);
  const [repDiag, setRepDiag] = useState(false);
  const [restDiag, setRestDiag] = useState(false);

  const workoutSetting = useOptionStore((s) => s.workout);
  return (
    <>
      <Text className="text-xl">{t('option.workout_settings')}</Text>
      <List>
        <ListItem
          icon={<ThemedIcon name="Logs" />}
          action={() => setSetDiag(true)}
          select={<Text className="text-right">{workoutSetting.defaultSets}</Text>}>
          <Text className="text-lg">{t('option.default_sets')}</Text>
        </ListItem>
        <ListItem
          icon={<ThemedIcon name="Tally5" />}
          action={() => setRepDiag(true)}
          select={<Text className="text-right">{workoutSetting.defaultReps}</Text>}>
          <Text className="text-lg">{t('option.default_reps')}</Text>
        </ListItem>
        <ListItem
          icon={<ThemedIcon name="Timer" />}
          action={() => setRestDiag(true)}
          select={<Text className="text-right">{workoutSetting.defaultRest}</Text>}>
          <Text className="text-lg">{t('option.default_rest_time')}</Text>
        </ListItem>
      </List>
      <View className="h-0">
        <SetDialogs open={setDiag} setOpen={setSetDiag} />
        <RestDialog open={restDiag} setOpen={setRestDiag} />
        <RepDialog open={repDiag} setOpen={setRepDiag} />
      </View>
    </>
  );
};
export default OptionPage;
