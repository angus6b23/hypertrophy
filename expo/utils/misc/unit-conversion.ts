import { LengthUnit, WeightUnit } from '~/types/units';

export const round = (num: number) => {
  return Math.round(num * 100) / 100;
};

export const toKg = (val: number, unit: WeightUnit) => {
  switch (unit) {
    case WeightUnit.lbs:
      return round(val / 2.2);
    default:
      return round(val);
  }
};

export const fromKg = (val: number, unit: WeightUnit) => {
  switch (unit) {
    case WeightUnit.lbs:
      return round(val * 2.2);
    default:
      return round(val);
  }
};

export const toCm = (val: number, unit: LengthUnit) => {
  switch (unit) {
    case LengthUnit.feet:
      return round(val * 30.48);
    case LengthUnit.inch:
      return round(val * 2.54);
    default:
      return round(val);
  }
};

export const fromCm = (val: number, unit: LengthUnit) => {
  switch (unit) {
    case LengthUnit.inch:
      return round(val / 30.48);
    case LengthUnit.feet:
      return round(val / 2.54);
    default:
      return round(val);
  }
};
