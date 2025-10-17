import { EnergyUnit, LengthUnit, WeightUnit } from '~/types/units';

export const round = (num: number) => {
  return Math.round(num * 100) / 100;
};

class Weight {
  static toG = (val: number, unit: WeightUnit) => {
    switch (unit) {
      case WeightUnit.lbs:
        return round(val * 453.5923);
      case WeightUnit.ounce:
        return round(val * 28.3495);
      case WeightUnit.kg:
        return round(val * 1000);
      default:
        return round(val);
    }
  };

  static fromG = (val: number, unit: WeightUnit) => {
    switch (unit) {
      case WeightUnit.lbs:
        return round(val / 453.5923);
      case WeightUnit.ounce:
        return round(val / 28.3495);
      case WeightUnit.kg:
        return round(val / 1000);
      default:
        return round(val);
    }
  };
  static convert = (val: number, from: WeightUnit, to: WeightUnit) => {
    return Weight.fromG(Weight.toG(val, from), to);
  };
}

class Length {
  static toCm = (val: number, unit: LengthUnit) => {
    switch (unit) {
      case LengthUnit.feet:
        return round(val * 30.48);
      case LengthUnit.inch:
        return round(val * 2.54);
      case LengthUnit.m:
        return round(val * 100);
      case LengthUnit.km:
        return round(val * 100 * 1000);
      case LengthUnit.yard:
        return round(val * 91.44);
      case LengthUnit.mile:
        return round(val * 160934.4);
      default:
        return round(val);
    }
  };

  static fromCm = (val: number, unit: LengthUnit) => {
    switch (unit) {
      case LengthUnit.inch:
        return round(val / 30.48);
      case LengthUnit.feet:
        return round(val / 2.54);
      case LengthUnit.m:
        return round(val / 100);
      case LengthUnit.km:
        return round(val / 100 / 1000);
      case LengthUnit.yard:
        return round(val / 91.44);
      case LengthUnit.mile:
        return round(val / 160934.4);
      default:
        return round(val);
    }
  };
  static convert = (val: number, from: LengthUnit, to: LengthUnit) => {
    return Length.fromCm(Length.toCm(val, from), to);
  };
}
class Energy {
  static toJ = (val: number, unit: EnergyUnit) => {
    switch (unit) {
      case EnergyUnit.kcal:
        return round(val * 4186.8);
      default:
        return val;
    }
  };
  static fromJ = (val: number, unit: EnergyUnit) => {
    switch (unit) {
      case EnergyUnit.kcal:
        return round(val / 4186.8);
      default:
        return val;
    }
  };
  static convert = (val: number, from: EnergyUnit, to: EnergyUnit) => {
    return Energy.fromJ(Energy.toJ(val, from), to);
  };
}
export class UnitConversion {
  static weight = Weight;
  static length = Length;
  static energy = Energy;
}

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
