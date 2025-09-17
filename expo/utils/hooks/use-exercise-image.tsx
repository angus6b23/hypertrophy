import { useCallback, useEffect, useRef, useState } from 'react';

interface ExerciseImageOption {
  animate?: boolean;
  animateDuration?: number;
}

const defaultExerciseImageOption: ExerciseImageOption = {
  animate: true,
  animateDuration: 1000,
};
export const useExerciseImage = (path: string, options = defaultExerciseImageOption) => {
  options = { ...defaultExerciseImageOption, ...options };
  const [img, setImg] = useState<any>();
  const [pointer, setPointer] = useState(0);

  const img1 = useRef<any>();
  const img2 = useRef<any>();
  useEffect(() => {
    const image = require.context(`../../../share/exercises/exercises/`, true, /.*jpg/);
    const id1 = `./${path}/images/0.jpg`;
    const id2 = `./${path}/images/1.jpg`;
    img1.current = image(id1);
    img2.current = image(id2);
    setImg(img1.current);
  }, [path]);

  const intervalCallback = useCallback(() => {
    if (pointer === 0) {
      setPointer(1);
      setImg(img2.current);
    } else {
      setPointer(0);
      setImg(img1.current);
    }
  }, [pointer]);

  useEffect(() => {
    let interval: any;
    if (options.animate) {
      interval = setInterval(intervalCallback, options.animateDuration);
    }
    return () => clearInterval(interval);
  }, [options.animate, options.animateDuration, intervalCallback]);

  return img;
};
