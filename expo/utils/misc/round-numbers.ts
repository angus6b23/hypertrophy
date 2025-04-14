export function roundNumbersMinMax(numbers: (number | undefined)[], k: number): number[] {
  if (!numbers || numbers.length === 0) {
    return [];
  }

  const roundedNumbers: number[] = numbers
    .filter((num) => num !== undefined)
    .map((num) => {
      const roundedValue = Math.round(num / k) * k;
      return roundedValue;
    });

  const min = Math.min(...roundedNumbers);
  const max = Math.max(...roundedNumbers);

  return [min, max];
}
