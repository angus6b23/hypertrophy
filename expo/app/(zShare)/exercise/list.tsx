import { useDebouncedCallback } from 'use-debounce';
import { ScrollView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import {
  Category,
  Equipment,
  Exercise,
  Force,
  Mechanic,
  Muscle,
} from 'share/exercises/types/exercise';
import exerciseDb from 'share/exercises/exercises.json';

import { enumToObject } from '~/utils/typescript/enumToObject';
import { useInfinityScroll } from '~/utils/hooks/infinity-scroll';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { XStack, YStack } from '~/components/ui/Stacks';
import { RadioDropdown } from '~/components/ui/RadioDropdown';
import { ExerciseItem, ExerciseItemWithCheckbox } from '~/components/ui/ExerciseItem';
import { CheckboxDropdown } from '~/components/ui/CheckboxDropdown';

interface ExerciseFilter {
  searchTerm?: string;
  force?: Force;
  mechanic?: Mechanic;
  equipment?: Equipment;
  primaryMuscle?: Muscle;
  secondaryMuscle?: Muscle[];
  category?: Category;
}

const ExerciseContext = createContext<{
  filter: ExerciseFilter;
  setFilter: React.Dispatch<React.SetStateAction<ExerciseFilter>>;
  exercises: Exercise[];
}>({
  filter: {},
  setFilter: () => {},
  exercises: [],
});

interface ExerciseListProps {
  inner?: boolean;
  useCheckList?: boolean;
}

export const ExerciseList = ({ inner, useCheckList }: ExerciseListProps) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [exfilter, setFilter] = useState<ExerciseFilter>(params ?? {});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setFilter(params);
    });

    return unsubscribe;
  }, [params]);

  const [displayEx, setDisplayEx] = useState<Exercise[]>([]);
  const deboucnedFilterFn = useDebouncedCallback(() => {
    const allExercises = exerciseDb.exercises as Exercise[];
    const filteredExercise = allExercises.filter((ex) => {
      const matchForce = exfilter.force ? ex.force === exfilter.force : true;
      const matchMechanic = exfilter.mechanic ? ex.mechanic === exfilter.mechanic : true;
      const matchEquipment = exfilter.equipment ? ex.equipment === exfilter.equipment : true;
      const matchCategory = exfilter.category ? ex.category === exfilter.category : true;
      const matchPrimaryMuscle = exfilter.primaryMuscle
        ? ex.primaryMuscles === exfilter.primaryMuscle
        : true;
      const matchSecondMuscle = exfilter.secondaryMuscle
        ? exfilter.secondaryMuscle.every((mm) => ex.secondaryMuscles.includes(mm))
        : true;
      const matchSearchTerm = exfilter.searchTerm
        ? ex.name.toLowerCase().includes(exfilter.searchTerm.toLowerCase())
        : true;
      return (
        matchForce &&
        matchMechanic &&
        matchEquipment &&
        matchCategory &&
        matchPrimaryMuscle &&
        matchSecondMuscle &&
        matchSearchTerm
      );
    });
    setDisplayEx(filteredExercise);
  }, 300);

  useEffect(deboucnedFilterFn, [exfilter]);

  return (
    <>
      <ExerciseContext.Provider value={{ filter: exfilter, setFilter, exercises: displayEx }}>
        {!inner && <Stack.Screen options={{ title: t('common.exercises'), headerShown: true }} />}
        <ExerciseFilterControl />
        {useCheckList ? <ExListWithCheckbox /> : <ExList />}
      </ExerciseContext.Provider>
    </>
  );
};

const ExerciseListPage = () => {
  return <ExerciseList inner={false} />;
};
export default ExerciseListPage;

const ExerciseFilterControl = () => {
  const { filter, setFilter } = useContext(ExerciseContext);
  const { t } = useTranslation();

  const changeHandler = useCallback(
    (key: keyof ExerciseFilter) => (val: ExerciseFilter[typeof key]) => {
      setFilter((prevState) =>
        prevState[key] === val
          ? {
              ...prevState,
              [key]: undefined,
            }
          : {
              ...prevState,
              [key]: val,
            }
      );
    },
    []
  );

  return (
    <>
      <YStack fill={false} className="w-full">
        <XStack fill={false} className="w-full" padding="none" gap="sm">
          <Input
            placeholder={t('exercise.search_with_exercise_name')}
            value={filter.searchTerm}
            onChangeText={changeHandler('searchTerm')}
            className="flex-1"
          />
          <Button onPress={() => setFilter({})} variant="ghost">
            <ThemedIcon name="RotateCcw" size={24} />
          </Button>
        </XStack>
        <ScrollView horizontal>
          <XStack padding="none">
            <RadioDropdown
              buttonText={t('exercise.primary_muscle')}
              items={enumToObject(Muscle)}
              currentItem={filter.primaryMuscle}
              callback={changeHandler('primaryMuscle')}
            />
            <CheckboxDropdown
              buttonText={t('exercise.secondary_muscle')}
              items={enumToObject(Muscle)}
              currentItem={filter.secondaryMuscle}
              callback={(a, m) => {
                if (a === 'add') {
                  setFilter((prevState) => ({
                    ...prevState,
                    secondaryMuscle: [...(prevState.secondaryMuscle || []), m],
                  }));
                } else {
                  setFilter((prevState) => ({
                    ...prevState,
                    secondaryMuscle: prevState.secondaryMuscle?.filter((mm) => mm !== m),
                  }));
                }
              }}
            />
          </XStack>
        </ScrollView>
        <ScrollView horizontal>
          <XStack padding="none">
            <RadioDropdown
              buttonText={t('exercise.force')}
              items={enumToObject(Force)}
              currentItem={filter.force}
              callback={changeHandler('force')}
            />
            <RadioDropdown
              buttonText={t('exercise.mechanic')}
              items={enumToObject(Mechanic)}
              currentItem={filter.mechanic}
              callback={changeHandler('mechanic')}
            />
            <RadioDropdown
              buttonText={t('exercise.equipment')}
              items={enumToObject(Equipment)}
              currentItem={filter.equipment}
              callback={changeHandler('equipment')}
            />
            <RadioDropdown
              buttonText={t('exercise.category')}
              items={enumToObject(Category)}
              currentItem={filter.category}
              callback={changeHandler('category')}
            />
          </XStack>
        </ScrollView>
      </YStack>
    </>
  );
};

const ExList = () => {
  const { exercises, filter } = useContext(ExerciseContext);
  const [innerData, infinityScroll] = useInfinityScroll(exercises);
  const listRef = useRef<FlashList<Exercise>>(null);

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: 0 });
  }, [filter]);

  return (
    <>
      <FlashList
        data={innerData}
        ref={listRef}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => <ExerciseItem exercise={item.item} />}
        estimatedItemSize={200}
        onEndReached={infinityScroll}
        onEndReachedThreshold={2}
      />
    </>
  );
};

const ExListWithCheckbox = () => {
  const { exercises, filter } = useContext(ExerciseContext);
  const [innerData, infinityScroll] = useInfinityScroll(exercises);
  const listRef = useRef<FlashList<Exercise>>(null);
  useEffect(() => {
    listRef.current?.scrollToIndex({ index: 0 });
  }, [filter]);
  return (
    <>
      <FlashList
        data={innerData}
        ref={listRef}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => <ExerciseItemWithCheckbox exercise={item.item} />}
        estimatedItemSize={200}
        onEndReached={infinityScroll}
        onEndReachedThreshold={1}
      />
    </>
  );
};
