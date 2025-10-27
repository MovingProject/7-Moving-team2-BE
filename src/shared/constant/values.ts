export const ROLES = ['DRIVER', 'CONSUMER'] as const;
export type Role = (typeof ROLES)[number];

export const MOVE_TYPES = ['SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE'] as const;
export type MoveType = (typeof MOVE_TYPES)[number];

export const AREAS = [
  'SEOUL',
  'GYEONGGI',
  'INCHEON',
  'GANGWON',
  'CHUNGBUK',
  'CHUNGNAM',
  'SEJONG',
  'DAEJEON',
  'JEONBUK',
  'JEONNAM',
  'GWANGJU',
  'GYEONGBUK',
  'GYEONGNAM',
  'DAEGU',
  'ULSAN',
  'BUSAN',
  'JEJU',
] as const;

export type Area = (typeof AREAS)[number];

export const REQUEST_STATUSES = ['PENDING', 'CONCLUDED', 'COMPLETE', 'EXPIRED', 'CANCELED', 'WITHDRAWN'] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const DRIVER_SORT_TYPES = ['REVIEW_DESC', 'RATING_DESC', 'CAREER_DESC', 'CONFIRMED_DESC'] as const;

export type DriverSortType = (typeof DRIVER_SORT_TYPES)[number];

export const MESSAGE_TYPES = ['MESSAGE', 'QUOTATION'] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export const QUOTATION_STATUSES = ['SUBMITTED', 'REVISED', 'WITHDRAWN', 'SELECTED', 'EXPIRED'] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
