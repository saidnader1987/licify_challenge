export const customFormatDate = (date: Date | null | undefined): string => {
  if (!date) {
    return '';
  }
  return date.toISOString().split('T')[0];
};
