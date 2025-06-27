import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import exerciseDb from 'share/exercises/exercises.json';
import { Exercise } from 'share/exercises/types/exercise';

import { XStack, YStack } from '~/components/ui/Stacks';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { useExerciseImage } from '~/utils/hooks/use-exercise-image';
import { useWorkoutStore } from '~/utils/stores/session-store';
import { ExerciseRecord } from 'share/interfaces/Records';
import { FlashList } from '@shopify/flash-list';
import { ExerciseRecordItem } from '~/components/ui/ExerciseRecordItem';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useDebouncedCallback } from 'use-debounce';

const ExerciseDetailPage = () => {
  const local = useLocalSearchParams();
  const exerciseRef = useRef(
    exerciseDb.exercises.find((ex) => ex.id === Number(local.id as string))
  );
  const [tab, setTab] = useState('history');

  return (
    <>
      <SafeAreaView className="relative flex-1">
        <Stack.Screen />
        <ScrollView className="h-full w-full">
          <BannerImage path={exerciseRef.current!.path} />
          <YStack>
            <Text className="text-2xl font-bold">{exerciseRef.current!.name}</Text>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full flex-row">
                <TabsTrigger value="history" className="flex-1">
                  <Text>{t('common.history')}</Text>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  <Text>{t('common.details')}</Text>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <ExerciseHistory id={Number(local.id)} />
              </TabsContent>
              <TabsContent value="details" asChild>
                <ExerciseDetails ex={exerciseRef.current! as Exercise} />
              </TabsContent>
            </Tabs>
          </YStack>
        </ScrollView>
        <FloatingButton />
      </SafeAreaView>
    </>
  );
};

const FloatingButton = () => {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams();

  return (
    <>
      <Button
        variant="secondary"
        size="floating"
        onPress={() => router.back()}
        className="absolute left-4 top-16 aspect-square rounded-full bg-foreground/60">
        <ThemedIcon name="ChevronLeft" size={24} inverted />
      </Button>
      <Button
        className="absolute bottom-4 right-4"
        size="floating"
        onPress={() => router.push(`/(zShare)/exercise/adhoc?id=${id as string}`)}>
        <ThemedIcon name="Plus" color={colors.background} size={28} />
      </Button>
    </>
  );
};

export const BannerImage = ({ path, name }: { path: string; name?: string }) => {
  const img = useExerciseImage(path);
  // const [imgs, setImgs] = useState<any[]>([]);
  // const [imgIdx, setImgIdx] = useState(0);
  // useEffect(() => {
  //   const image = require.context(`../../../../share/exercises/exercises/`, true, /.*jpg/);
  //   const id1 = `./${path}/images/0.jpg`;
  //   const id2 = `./${path}/images/1.jpg`;
  //   const img1 = image(id1);
  //   const img2 = image(id2);
  //   setImgs([img1, img2]);
  // }, []);
  //
  // useEffect(() => {
  //   let interval: any;
  //   if (imgs.length > 0) {
  //     interval = setInterval(() => {
  //       setImgIdx((prev) => (prev + 1 >= imgs.length ? 0 : prev + 1));
  //     }, 800);
  //   }
  //   return () => clearInterval(interval);
  // }, [imgs]);
  return (
    <Image
      source={img}
      style={{ width: '100%', height: 256 }}
      contentFit="cover"
      className="absolute left-0 top-0"
    />
  );
};

const ExerciseDetails = ({ ex }: { ex: Exercise }) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <YStack padding="none" className="py-4" fill={false}>
      {ex.aliases && ex.aliases.length > 0 && (
        <Text className="text-lg text-muted-foreground">{ex.aliases?.join(',')}</Text>
      )}
      <Text className="text-xl font-bold">
        {t(`exercise.${ex.level}`)}
        {ex.mechanic && '・' + t(`exercise.${ex.mechanic}`)}・{t(`exercise.${ex.category}`)}
      </Text>
      <YStack fill={false} padding="none">
        {/* TODO: Fix Badge size, link not working for some reason */}
        <Pressable
          onTouchEnd={() => router.push(`/exercise/list?primaryMuscle=${ex.primaryMuscles}`)}>
          <Badge variant="default" className="w-fit flex-none">
            <Text className="text-md">{t(`exercise.${ex.primaryMuscles}`)}</Text>
          </Badge>
        </Pressable>
        <XStack padding="none" fill={false} className="flex-wrap">
          {ex.secondaryMuscles.map((mm, i) => (
            <Pressable onTouchEnd={() => router.push(`/exercise/list?primaryMuscle=${mm}`)} key={i}>
              <Badge variant="secondary">
                <Text className="text-md">{t(`exercise.${mm}`)}</Text>
              </Badge>
            </Pressable>
          ))}
        </XStack>

        <Link href={`/exercise/list?equipment=${ex.equipment}`}>
          <Badge variant="outline" className="flex-none">
            <Text className="text-md">{t(`exercise.${ex.equipment}`)}</Text>
          </Badge>
        </Link>
        <YStack fill={false} padding="none" className="w-full">
          <Text className="text-lg font-bold">{t('exercise.instruction')}</Text>
          {ex.instructions.map((instruction, i) => (
            <XStack key={i} fill={false} padding="none" className="w-full flex-wrap">
              <Text className="text-md">{i + 1 + '.'}</Text>
              <Text className="text-md flex-1">{instruction}</Text>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
};

interface ExerciseRecordWithDate extends ExerciseRecord {
  date: string;
}
const ExerciseHistory = ({ id }: { id: number }) => {
  const workouts = useWorkoutStore((state) => state.workouts);
  const [displayCount, setDisplayCount] = useState(10);

  const getLogs = useCallback(() => {
    const res: ExerciseRecordWithDate[] = [];
    for (let i = workouts.length - 1; i >= 0; i--) {
      const session = workouts[i];
      const logs = session.exercises;
      for (const log of logs) {
        if (log.exerciseId === id) {
          res.push({ ...log, date: session.startTime as unknown as string });
        }
        if (res.length >= displayCount) break;
      }
      if (res.length >= displayCount) break;
    }
    return res;
  }, [displayCount]);

  const append = useDebouncedCallback(() => {
    setDisplayCount((prev) => prev + 10);
  }, 200);
  return (
    <>
      <FlashList
        data={getLogs()}
        keyExtractor={(_item, i) => i.toString()}
        contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 8, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => (
          <ExerciseRecordItem
            record={item.item}
            date={item.item.date}
            options={{ showDate: true, showName: false, showImg: false }}
          />
        )}
        ListEmptyComponent={() => <NoHistory />}
        estimatedItemSize={10}
        onEndReached={append}
        onEndReachedThreshold={1}
      />
    </>
  );
};

const NoHistory = () => {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <YStack fill={true} padding="none" justify="center" align="center" className="h-96 w-full">
      <ThemedIcon name="ListFilterPlus" size={96} color={colors.neutral} />
      <Text className="text-md text-muted-foreground">{t('workout.no_history_found')}</Text>
      <Text className="text-md text-muted-foreground">{t('workout.do_some_workout')}</Text>
    </YStack>
  );
};

export default ExerciseDetailPage;
