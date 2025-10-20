import { DriverSortType } from '@/shared/constant/values';

export type SortField = 'reviewCount' | 'rating' | 'careerYears' | 'confirmedCount';

export const SORT_FIELD_MAP: Record<DriverSortType, SortField> = {
  REVIEW_DESC: 'reviewCount',
  RATING_DESC: 'rating',
  CAREER_DESC: 'careerYears',
  CONFIRMED_DESC: 'confirmedCount',
};
