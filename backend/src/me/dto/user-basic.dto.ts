import { ApiProperty } from '@nestjs/swagger';

/** Minimal user info (e.g. in following/followers list). */
export class UserBasicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  username!: string;
}
