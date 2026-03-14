import { useMemo, useState } from 'react';

const START_YEAR = 2016;

function computeDefaults() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  return { currentYear, currentMonth, maxYear, defaultMonth };
}

const defaults = computeDefaults();

/**
 * Provides selectable year / month arrays for period selectors.
 *
 * Returns raw value arrays (`years`, `months`) so each page can format
 * option labels with its own i18n keys.
 */
export function usePeriodOptions() {
  const { currentYear, currentMonth, maxYear, defaultMonth } = defaults;

  const [selectedYear, setSelectedYear] = useState(maxYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(defaultMonth);

  const years = useMemo(
    () => Array.from({ length: maxYear - START_YEAR + 1 }, (_, i) => START_YEAR + i),
    [maxYear]
  );

  const maxMonth = selectedYear === currentYear ? currentMonth - 1 : 12;
  const months = useMemo(
    () => Array.from({ length: maxMonth }, (_, i) => i + 1),
    [maxMonth]
  );

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    years,
    months,
    currentYear,
    currentMonth,
    maxYear,
    defaultMonth
  } as const;
}
