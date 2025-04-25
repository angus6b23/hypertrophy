import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Exercise } from 'share/exercises/types/exercise';

import { XStack } from './Stacks';

import { Text } from '~/components/ui/text';

export const ExerciseItem = ({ exercise }: { exercise: Exercise }) => {
  const [img, setImg] = useState<any>();
  useEffect(() => {
    const image = require.context(`../../../share/exercises/exercises/`, true, /.*jpg/);
    const id = `./${exercise.path}/images/0.jpg`;
    const targetImg = image(id);
    setImg(targetImg);
  }, [exercise]);
  return (
    <>
      <Link href={`/exercise/${exercise.id!}`}>
        <XStack padding="none" fill={false} align="center">
          <Image
            source={img}
            style={{ height: 64, width: 64, borderRadius: 8 }}
            contentFit="cover"
          />
          <Text className="text-lg font-bold">{exercise.name}</Text>
        </XStack>
      </Link>
    </>
  );
};
