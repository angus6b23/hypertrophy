/**
 * Returns a debounced function
 *
 * @param fn - Any function
 * @param delay - Time in milliseconds
 * @returns fn with debounced
 *
 */
export const debounce = (fn: (...args: any[]) => any, delay = 500) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
