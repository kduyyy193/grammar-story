import { useMemo } from 'react';
import { DAILY_THEMES } from '../constants';
import type { DailyTheme } from '../types';

export function useDailyTheme(): Omit<DailyTheme, 'theory'> {
  const dailyTheme = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const themeIndex = (dayOfYear - 1) % DAILY_THEMES.length;
    return DAILY_THEMES[themeIndex];
  }, []);

  return dailyTheme;
}
