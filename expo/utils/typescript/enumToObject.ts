export const enumToObject = (en: any) => {
  return Object.entries(en).map(([label, value]) => ({ label, value: String(value) }));
};
