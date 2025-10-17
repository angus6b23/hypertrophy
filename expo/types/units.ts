import { enumToObject } from '~/utils/typescript/enumToObject';

export enum WeightUnit {
  'kg' = 'kg',
  'g' = 'g',
  'lbs' = 'lbs',
  'ounce' = 'oz',
}
export const weightUnits = enumToObject<WeightUnit>(WeightUnit);
export enum LengthUnit {
  'cm' = 'cm',
  'm' = 'm',
  'km' = 'km',
  'mile' = 'mi',
  'yard' = 'yd',
  'inch' = 'in',
  'feet' = 'ft',
}
export const lengthUnits = enumToObject<LengthUnit>(LengthUnit);

export enum EnergyUnit {
  'joule' = 'J',
  'kcal' = 'kcal',
}
export const energyUnits = enumToObject<EnergyUnit>(EnergyUnit);
