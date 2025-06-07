/**
 * Return minute passed for given time
 *
 * @param time - Date
 * @returns number - minute passed
 *
 */
export const minutesPassed = (time: Date) => {
  const now = Date.now();
  return Math.round((now - time.getTime()) / 1000 / 60);
};
