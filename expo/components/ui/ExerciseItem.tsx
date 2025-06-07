import { Image } from 'expo-image';
import { Href, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Exercise } from 'share/exercises/types/exercise';

import { XStack } from './Stacks';

import { Text } from '~/components/ui/text';
import { TouchableOpacity, View } from 'react-native';
import { Checkbox } from './checkbox';
import { AddExerciseContext } from '~/app/(zShare)/exercise/add';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import { PlanExercise } from 'share/interfaces/Workout';
import { useExerciseImage } from '~/utils/hooks/use-exercise-image';

export const ExerciseItem = ({
  exercise,
  drag,
  href,
  className,
  size = 64,
}: {
  exercise: Exercise;
  drag?: RenderItemParams<PlanExercise>['drag'];
  href?: Href;
  className?: string;
  size?: number;
}) => {
  const img = useExerciseImage(exercise.path, { animate: false });
  const router = useRouter();

  return (
    <>
      <TouchableOpacity
        className={className}
        onPress={() => router.push(href || `/exercise/${exercise.id!}`)}
        onLongPress={drag}>
        <XStack padding="none" fill={false} align="center" className={className}>
          <Image
            source={img}
            style={{ height: size, width: size, borderRadius: 8 }}
            contentFit="cover"
          />
          <Text className="text-lg font-bold">{exercise.name}</Text>
        </XStack>
      </TouchableOpacity>
    </>
  );
};

export const ExerciseItemWithCheckbox = ({ exercise }: { exercise: Exercise }) => {
  const { exSet, setExSet } = useContext(AddExerciseContext);
  const img = useExerciseImage(exercise.path, { animate: false });

  const handleToggle = () => {
    setExSet((prevState) => {
      if (prevState.includes(exercise.id!)) {
        return prevState.filter((id) => id !== exercise.id!);
      } else {
        return [...prevState, exercise.id!];
      }
    });
  };
  return (
    <>
      <TouchableOpacity onPress={handleToggle}>
        <XStack padding="none" fill={true} justify="between" align="center" className="w-full">
          <XStack padding="none" fill={false} align="center">
            <Image
              source={img}
              style={{ height: 64, width: 64, borderRadius: 8 }}
              contentFit="cover"
            />
            <Text className="max-w-80 text-lg font-bold" numberOfLines={2}>
              {exercise.name}
            </Text>
          </XStack>
          <View>
            <Checkbox checked={exSet.includes(exercise.id!)} onCheckedChange={handleToggle} />
          </View>
        </XStack>
      </TouchableOpacity>
    </>
  );
};
