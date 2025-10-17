export const enumToObject = <T>(en: any) => {
  return Object.entries(en).map(([label, value]) => ({ label, value: String(value) as T }));
};
