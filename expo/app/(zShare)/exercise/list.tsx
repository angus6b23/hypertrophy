import { Stack } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import exerciseDb from 'share/exercises/exercises.json';
import {
  Category,
  Equipment,
  Exercise,
  Mechanic,
  Muscle,
  Force,
} from 'share/exercises/types/exercise';
import { FlashList } from '@shopify/flash-list';
import { useDebouncedCallback } from 'use-debounce';

import { CheckboxDropdown } from '~/components/ui/CheckboxDropdown';
import { ExerciseItem } from '~/components/ui/ExerciseItem';
import { RadioDropdown } from '~/components/ui/RadioDropdown';
import { XStack, YStack } from '~/components/ui/Stacks';
import { ThemedIcon } from '~/components/ui/ThemedIcon';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { enumToObject } from '~/utils/typescript/enumToObject';
import { View } from 'react-native';

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

const ExerciseListPage = ({ filter }: { filter?: ExerciseFilter }) => {
  const { t } = useTranslation();
  const [exfilter, setFilter] = useState<ExerciseFilter>(filter ?? {});
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
        <Stack.Screen options={{ title: t('common.exercises'), headerShown: true }} />
        <ExerciseFilterControl />
        {/* <ScrollView */}
        {/*   contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }} */}
        {/*   className="w-full"> */}
        <ExerciseList />
        {/* </ScrollView> */}
      </ExerciseContext.Provider>
    </>
  );
};
export default ExerciseListPage;

const ExerciseFilterControl = () => {
  const { filter, setFilter } = useContext(ExerciseContext);
  const { t } = useTranslation();

  return (
    <YStack fill={false} className="w-full">
      <XStack fill={false} className="w-full" padding="none" gap="sm">
        <Input
          placeholder={t('exercise.search_with_exercise_name')}
          value={filter.searchTerm}
          onChangeText={(text) => setFilter((prevState) => ({ ...prevState, searchTerm: text }))}
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
            callback={(m) => setFilter((prevState) => ({ ...prevState, primaryMuscle: m }))}
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
            callback={(f) => setFilter((prevState) => ({ ...prevState, force: f }))}
          />
          <RadioDropdown
            buttonText={t('exercise.mechanic')}
            items={enumToObject(Mechanic)}
            currentItem={filter.mechanic}
            callback={(m) => setFilter((prevState) => ({ ...prevState, mechanic: m }))}
          />
          <RadioDropdown
            buttonText={t('exercise.equipment')}
            items={enumToObject(Equipment)}
            currentItem={filter.equipment}
            callback={(e) => setFilter((prevState) => ({ ...prevState, equipment: e }))}
          />
          <RadioDropdown
            buttonText={t('exercise.category')}
            items={enumToObject(Category)}
            currentItem={filter.category}
            callback={(c) => setFilter((prevState) => ({ ...prevState, category: c }))}
          />
        </XStack>
      </ScrollView>
    </YStack>
  );
};

const ExerciseList = () => {
  const { exercises } = useContext(ExerciseContext);
  const listRef = useRef<FlashList<Exercise>>(null);
  const [innerData, setInnerData] = useState(exercises.slice(0, 20));

  useEffect(() => {
    setInnerData(exercises.slice(0, 20));
    listRef.current?.scrollToIndex({
      index: 0,
      animated: true,
    });
  }, [exercises]);
  const infinityScroll = useDebouncedCallback(() => {
    setInnerData((prev) => [...prev, ...exercises.slice(prev.length, prev.length + 20)]);
  }, 200);
  return (
    <>
      <FlashList
        ref={listRef}
        data={innerData}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={(item) => <ExerciseItem exercise={item.item} />}
        estimatedItemSize={200}
        onEndReached={infinityScroll}
        onEndReachedThreshold={1}
      />
      {/* {exercises.map((ex) => ( */}
      {/*   <ExerciseItem exercise={ex} key={ex.name} /> */}
      {/* ))} */}
    </>
  );
};
