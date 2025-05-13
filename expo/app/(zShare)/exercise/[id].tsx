import { clsx } from 'clsx';
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
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

const ExerciseDetailPage = () => {
  const local = useLocalSearchParams();
  const exerciseRef = useRef(
    exerciseDb.exercises.find((ex) => ex.id === Number(local.id as string))
  );
  const [tab, setTab] = useState('log');
  const [displayBanner, setDisplayBanner] = useState(true);
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y > 50) {
      setDisplayBanner(false);
    }
  }, []);

  return (
    <>
      <SafeAreaView className="relative flex-1">
        <Stack.Screen />
        <ScrollView className="h-full w-full" onScroll={handleScroll} persistentScrollbar>
          {displayBanner && <BannerImage path={exerciseRef.current!.path} />}
          <YStack className={clsx({ 'mt-16': !displayBanner })}>
            <Text className="text-2xl font-bold">{exerciseRef.current!.name}</Text>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full flex-row">
                <TabsTrigger value="log" className="flex-1">
                  <Text>{t('common.log')}</Text>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <Text>{t('common.history')}</Text>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  <Text>{t('common.details')}</Text>
                </TabsTrigger>
              </TabsList>
              {/* TODO:Implement log function */}
              <TabsContent value="log">
                <Text>Log</Text>
              </TabsContent>
              {/* TODO: Implement record viewing */}
              <TabsContent value="history">
                <Text>History</Text>
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
  return (
    <Button
      variant="secondary"
      size="floating"
      onPress={() => router.back()}
      className="absolute left-4 top-16 aspect-square rounded-full bg-foreground/60">
      <ThemedIcon name="ChevronLeft" size={24} inverted />
    </Button>
  );
};

const BannerImage = ({ path }: { path: string }) => {
  const [imgs, setImgs] = useState<any[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => {
    const image = require.context(`../../../../share/exercises/exercises/`, true, /.*jpg/);
    const id1 = `./${path}/images/0.jpg`;
    const id2 = `./${path}/images/1.jpg`;
    const img1 = image(id1);
    const img2 = image(id2);
    setImgs([img1, img2]);
  }, []);

  useEffect(() => {
    let interval: any;
    if (imgs.length > 0) {
      interval = setInterval(() => {
        setImgIdx((prev) => (prev + 1 >= imgs.length ? 0 : prev + 1));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [imgs]);
  return <Image source={imgs[imgIdx]} style={{ width: '100%', height: 256 }} contentFit="cover" />;
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
          <Badge variant="default" className="w-fit flex-none" onTouchEnd={(e) => console.log(e)}>
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

export default ExerciseDetailPage;
