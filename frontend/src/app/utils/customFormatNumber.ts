export function customFormatNumber(
  value: number,
  locale: string,
  decimalPlaces: number = 2
): string {
  const numberFormat = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return numberFormat.format(value);
}
