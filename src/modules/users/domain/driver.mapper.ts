import { DriverAggregate } from '../interface/driverProfile.repository.interface';
import { DriverListItem } from '../interface/driver.service.interface';

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
