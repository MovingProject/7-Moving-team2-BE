import { ApiProperty } from '@nestjs/swagger';
import { ROLES, AREAS, MOVE_TYPES, type Role, type Area, type MoveType } from '@/shared/constant/values';

const PROFILE_TYPES = ['CONSUMER', 'DRIVER'] as const;
type ProfileType = (typeof PROFILE_TYPES)[number];

export class MeProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ enum: ROLES })
  role: Role;

  @ApiProperty({ enum: PROFILE_TYPES })
  profileType: ProfileType;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  image?: string | null;

  @ApiProperty({ required: false, enum: AREAS, isArray: true })
  region?: Area[];

  @ApiProperty({ required: false, enum: MOVE_TYPES, isArray: true })
  service?: MoveType[];

  @ApiProperty({ required: false })
  experience?: number;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  likeCount?: number;

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  reviewCount?: number;

  @ApiProperty({ required: false })
  confirmedCount?: number;
}
