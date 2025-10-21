import { DriverAggregate } from '../interface/driverProfile.repository.interface';
import { DriverListItem, PublicDriverProfile } from '../interface/driver.service.interface';
import { DriverServiceAreaEntity, DriverServiceTypeEntity } from '../types';
import { DriverProfileEntity } from '../types';

const mapAreas = (areas: DriverServiceAreaEntity[]) => areas.map((a) => a.serviceArea);
const mapTypes = (types: DriverServiceTypeEntity[]) => types.map((t) => t.serviceType);

export function toPublicDriverProfile(e: DriverProfileEntity): PublicDriverProfile {
  const { driverServiceAreas, driverServiceTypes } = e;

  const publicProfile: PublicDriverProfile = {
    id: e.id,
    userId: e.userId,
    image: e.image,
    nickname: e.nickname,
    oneLiner: e.oneLiner,
    careerYears: e.careerYears,
    rating: e.rating,
    reviewCount: e.reviewCount,
    confirmedCount: e.confirmedCount,
    likeCount: e.likeCount,
    description: e.description,
    serviceAreas: mapAreas(driverServiceAreas ?? []),
    serviceTypes: mapTypes(driverServiceTypes ?? []),
  } satisfies PublicDriverProfile;

  return publicProfile;
}

export function toDriverListItem(row: DriverAggregate, isInvitedByMe: boolean): DriverListItem {
  return {
    user: {
      id: row.driver.id,
      name: row.driver.name,
      role: row.driver.role,
      createdAt: row.driver.createdAt,
    },
    profile: {
      userId: row.userId,
      image: row.image,
      nickname: row.nickname,
      oneLiner: row.oneLiner,
      careerYears: row.careerYears,
      rating: row.rating,
      reviewCount: row.reviewCount,
      confirmedCount: row.confirmedCount,
      likeCount: row.likeCount,
      serviceAreas: row.driverServiceAreas.map((a) => a.serviceArea),
      serviceTypes: row.driverServiceTypes.map((t) => t.serviceType),
    },
    isInvitedByMe,
  };
}
