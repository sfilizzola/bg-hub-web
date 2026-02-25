import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PublicProfileDto } from './dto/public-profile.dto';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  @ApiOperation({
    summary: 'Get public profile',
    description: 'Returns public profile for the given username (id, username, followersCount, followingCount).',
  })
  @ApiParam({
    name: 'username',
    required: true,
    description: 'Username',
    schema: { type: 'string' },
    example: 'johndoe',
  })
  @ApiResponse({ status: 200, description: 'Public profile', type: PublicProfileDto })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  getPublicProfile(@Param('username') username: string) {
    return this.usersService.getPublicProfile(username);
  }
}
