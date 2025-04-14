import { ChartTimeframe } from '../hooks/chart-timeframe';

export const filterByDate = <T extends Record<string, unknown>>({
  data,
  duration,
  dateKey,
}: {
  data: T[];
  duration: ChartTimeframe;
  dateKey: keyof T;
}) => {
  const startsFrom = new Date();
  switch (duration) {
    case '14D':
      startsFrom.setDate(startsFrom.getDate() - 14);
      break;
    case '30D':
      startsFrom.setDate(startsFrom.getDate() - 30);
      break;
    case '3M':
      startsFrom.setDate(startsFrom.getDate() - 90);
      break;
    case '6M':
      startsFrom.setDate(startsFrom.getDate() - 180);
      break;
    case '1Y':
      startsFrom.setDate(startsFrom.getDate() - 365);
      break;
    case 'ALL':
      startsFrom.setDate(startsFrom.getDate() - 999999);
      break;
  }
  return data
    .filter((item) => new Date(item[dateKey] as string).getTime() > startsFrom.getTime())
    .sort((a, b) => {
      const aDate = new Date(a[dateKey] as string).getTime();
      const bDate = new Date(b[dateKey] as string).getTime();
      return aDate - bDate;
    });
};
