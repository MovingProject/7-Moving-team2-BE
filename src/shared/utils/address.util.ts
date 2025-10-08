import { Area } from '@prisma/client';

const areaMap: Record<string, Area> = {
  서울: Area.SEOUL,
  서울특별시: Area.SEOUL,
  경기: Area.GYEONGGI,
  경기도: Area.GYEONGGI,
  인천: Area.INCHEON,
  인천광역시: Area.INCHEON,
  강원: Area.GANGWON,
  강원특별자치도: Area.GANGWON,
  충북: Area.CHUNGBUK,
  충청북도: Area.CHUNGBUK,
  충남: Area.CHUNGNAM,
  충청남도: Area.CHUNGNAM,
  세종: Area.SEJONG,
  세종특별자치시: Area.SEJONG,
  대전: Area.DAEJEON,
  대전광역시: Area.DAEJEON,
  전북: Area.JEONBUK,
  전북특별자치도: Area.JEONBUK,
  전남: Area.JEONNAM,
  전라남도: Area.JEONNAM,
  광주: Area.GWANGJU,
  광주광역시: Area.GWANGJU,
  경북: Area.GYEONGBUK,
  경상북도: Area.GYEONGBUK,
  경남: Area.GYEONGNAM,
  경상남도: Area.GYEONGNAM,
  대구: Area.DAEGU,
  대구광역시: Area.DAEGU,
  울산: Area.ULSAN,
  울산광역시: Area.ULSAN,
  부산: Area.BUSAN,
  부산광역시: Area.BUSAN,
  제주: Area.JEJU,
  제주특별자치도: Area.JEJU,
};

/**
 * 전체 주소 문자열을 받아서 해당하는 Area enum 값으로 변환합니다.
 * @param fullAddress - 전체 주소 문자열 (e.g., '서울 강남구...')
 * @returns 해당하는 Area enum 값, 찾지 못하면 null
 */
export function getAreaFromAddress(fullAddress: string): Area | null {
  for (const regionName in areaMap) {
    if (fullAddress.startsWith(regionName)) {
      return areaMap[regionName];
    }
  }
  return null;
}
