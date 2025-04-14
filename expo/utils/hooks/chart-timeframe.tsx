import { useState } from 'react';

export const chartTimeframe = ['14D', '30D', '3M', '6M', '1Y', 'ALL'] as const;
export type ChartTimeframe = (typeof chartTimeframe)[number];
export const useChartTimeFrame = (): [
  ChartTimeframe,
  React.Dispatch<React.SetStateAction<ChartTimeframe>>,
] => {
  const [timeFrame, setTimeFrame] = useState<ChartTimeframe>('14D');
  return [timeFrame, setTimeFrame];
};
