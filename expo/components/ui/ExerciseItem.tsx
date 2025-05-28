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

export const ExerciseItem = ({
  exercise,
  drag,
  href,
}: {
  exercise: Exercise;
  drag?: RenderItemParams<PlanExercise>['drag'];
  href?: Href;
}) => {
  const [img, setImg] = useState<any>();
  const router = useRouter();
  useEffect(() => {
    const image = require.context(`../../../share/exercises/exercises/`, true, /.*jpg/);
    const id = `./${exercise.path}/images/0.jpg`;
    const targetImg = image(id);
    setImg(targetImg);
  }, [exercise]);

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push(href || `/exercise/${exercise.id!}`)}
        onLongPress={drag}>
        <XStack padding="none" fill={false} align="center">
          <Image
            source={img}
            style={{ height: 64, width: 64, borderRadius: 8 }}
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
  const [img, setImg] = useState<any>();

  useEffect(() => {
    const image = require.context(`../../../share/exercises/exercises/`, true, /.*jpg/);
    const id = `./${exercise.path}/images/0.jpg`;
    const targetImg = image(id);
    setImg(targetImg);
  }, [exercise]);
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
