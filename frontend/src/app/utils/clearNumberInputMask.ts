export const cleanNumberInputMask = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  const cleanedValue = value.replace(/[^0-9.-]+/g, '');
  if (cleanedValue === '' || cleanedValue === '.') {
    return 0;
  }
  return parseFloat(cleanedValue);
};
