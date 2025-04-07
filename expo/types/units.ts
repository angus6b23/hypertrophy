import { enumToObject } from '~/utils/typescript/enumToObject';

export enum WeightUnit {
  'kg' = 'kg',
  'lbs' = 'lbs',
}
export const weightUnits = enumToObject(WeightUnit);
export enum LengthUnit {
  'cm' = 'cm',
  'inch' = 'inch',
  'feet' = 'feet',
}
export const lengthUnits = enumToObject(LengthUnit);
