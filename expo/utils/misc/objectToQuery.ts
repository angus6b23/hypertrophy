export const objectToQuery = (obj: any) => {
  let query = '?';
  Object.entries(obj).forEach(([key, value], index) => {
    if (index === 0) {
      query += encodeURI(`${key}=${value}`);
    } else {
      query += encodeURI(`&${key}=${value}`);
    }
  });
  return query;
};
