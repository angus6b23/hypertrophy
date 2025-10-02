import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { useCallback, useState } from 'react';

import clsx from 'clsx';

import { useColors } from '~/utils/rn-reusables/useColors';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { round } from '~/utils/misc/round-numbers';
import {
  BRZYCKI_TABLE,
  DOS_REMEDIOS_TABLE,
  NSCA_TABLE,
  RmOptions,
  predict1RM,
} from '~/utils/misc/rm-predict';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack } from '~/components/ui/Stacks';

function RmPredictPage() {
  const { t } = useTranslation();
  const colors = useColors();
  const { colorScheme } = useColorScheme();

  const [weight, setWeight] = useState<number>(10);
  const [reps, setReps] = useState<number>(10);
  const [table, setTable] = useState<RmOptions['table']>('nsca');

  const get1Rm = useCallback(() => {
    return predict1RM({ reps, weight }, { table });
  }, [reps, weight, table]);
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: t('tools.rm_predict') }} />
      <SafeAreaView className="relative p-4 pb-16">
        <ScrollView>
          <Collapsible className="w-full bg-muted rounded-md p-4 my-4">
            <CollapsibleTrigger>
              <XStack
                fill={false}
                padding="none"
                className="bg-transparent w-full"
                align="center"
                justify="between">
                <XStack fill={false} padding="none" className="bg-transparent">
                  <ThemedIcon name="MessageCircleQuestion" />
                  <Text className="text-lg">{t('tools.not_sure_how_to_use?')}</Text>
                </XStack>
                <View className="p-2">
                  <ThemedIcon name="ChevronsDownUp" size={16} />
                </View>
              </XStack>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t-2 border-t-border pt-2 duration-200">
              <Text>Content here</Text>
            </CollapsibleContent>
          </Collapsible>
          <XStack padding="none" fill={false} align="center" className="my-4">
            <Text className="text-lg">{t('workout.weight')}:</Text>
            <Input
              inputMode="numeric"
              className="flex-1 text-center"
              value={weight.toString()}
              onChangeText={(s) => setWeight(Number(s))}
              selectTextOnFocus
              returnKeyType="next"
            />
            <Text className="text-xl">x</Text>
            <Input
              inputMode="numeric"
              className="flex-1 text-center"
              value={reps.toString()}
              selectTextOnFocus
              onChangeText={(s) => setReps(Number(s))}
              returnKeyType="done"
            />
            <Text className="text-lg">{t('workout.reps')}</Text>
          </XStack>
          <XStack className="bg-transparent w-full" padding="none" fill={false} justify="between">
            <Text className="text-lg">{t('tools.table')}:</Text>
            <RNPickerSelect
              onValueChange={setTable}
              value={table}
              style={{
                inputAndroid: {
                  fontSize: 16,
                  paddingRight: 12,
                  color: colors.text,
                },
                inputIOS: {
                  fontSize: 16,
                  color: colors.text,
                },
              }}
              items={[
                {
                  label: 'NSCA / Baechle',
                  value: 'nsca',
                  key: 'nsca',
                },
                { label: 'Brzycki', value: 'brzycki', key: 'brzycki' },
                { label: 'dos Remedios', value: 'dos_Remedios', key: 'dos_Remedios' },
              ]}
              Icon={() => <></>}
              darkTheme={colorScheme === 'dark'}
              useNativeAndroidPickerStyle={false}
            />
          </XStack>
          <XStack fill={false} justify="between" className="w-full mt-4">
            <Text className="text-xl font-bold">{t('tools.rm_max')}</Text>
            <Text className="text-xl font-bold">{t('workout.weight')}</Text>
          </XStack>
          {table === 'nsca'
            ? NSCA_TABLE.map((val, i) => (
                <>
                  <XStack
                    key={i}
                    fill={false}
                    justify="between"
                    className={clsx('w-full rounded-lg', {
                      'bg-muted': i % 2 === 0,
                    })}>
                    <Text className="text-xl">{i === 12 ? 15 : i + 1} RM</Text>
                    <Text className="text-xl">{round(get1Rm() * val)}</Text>
                  </XStack>
                </>
              ))
            : table === 'brzycki'
              ? BRZYCKI_TABLE.map((val, i) => (
                  <>
                    <XStack
                      key={i}
                      fill={false}
                      justify="between"
                      className={clsx('w-full rounded-lg', {
                        'bg-muted': i % 2 === 0,
                      })}>
                      <Text className="text-xl">{i === 10 ? 12 : i === 11 ? 15 : i + 1} RM</Text>
                      <Text className="text-xl">{round(get1Rm() * val)}</Text>
                    </XStack>
                  </>
                ))
              : DOS_REMEDIOS_TABLE.map((val, i) => (
                  <>
                    <XStack
                      key={i}
                      fill={false}
                      justify="between"
                      className={clsx('w-full rounded-lg', {
                        'bg-muted': i % 2 === 0,
                      })}>
                      <Text className="text-xl">
                        {i === 6 ? 8 : i === 7 ? 10 : i === 8 ? 12 : i === 9 ? 15 : i + 1} RM
                      </Text>
                      <Text className="text-xl">{round(get1Rm() * val)}</Text>
                    </XStack>
                  </>
                ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

export default RmPredictPage;
