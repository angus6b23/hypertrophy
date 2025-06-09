/**
 * Return minute passed for given time
 *
 * @param time - Date
 * @returns number - minute passed
 *
 */
export const minutesPassed = (time: Date, endTime?: Date) => {
  if (!endTime) endTime = new Date();
  return Math.round((endTime.getTime() - time.getTime()) / 1000 / 60);
};
