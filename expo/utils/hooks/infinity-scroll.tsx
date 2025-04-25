import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useInfinityScroll = <T,>(data: T[], batch = 20): [T[], () => void] => {
  const [innerData, setInnerData] = useState(data.slice(0, batch));
  const appendData = useCallback(
    useDebouncedCallback(() => {
      setInnerData((prev) => [...prev, ...data.slice(prev.length, prev.length + batch)]);
    }, 300),
    [data, setInnerData]
  );

  useEffect(() => {
    setInnerData(data.slice(0, batch));
  }, [data]);
  return [innerData, appendData];
};
