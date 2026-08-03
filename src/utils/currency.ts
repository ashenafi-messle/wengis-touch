// Currency formatting utility for Ethiopian Birr (ETB)
export const formatETB = (amount: number): string => {
  return `ETB ${amount.toLocaleString()}`;
};

// Alternative format with Birr symbol (ብር)
export const formatBirr = (amount: number): string => {
  return `${amount.toLocaleString()} ብር`;
};

// Default formatter using ETB
export const formatCurrency = formatETB;