export const avg = (values: number[] | undefined): number => {
  if (!values) return NaN;
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};
