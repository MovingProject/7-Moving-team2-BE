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
