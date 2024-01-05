export const customFormatCurrency = (
  value: number,
  locale: string,
  symbol: string,
  decimalPlaces: number = 2
): string => {
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: symbol,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return currency.format(value);
};
