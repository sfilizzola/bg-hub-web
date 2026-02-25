import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from '../me/me.service';
import { UsersService } from './users.service';
import { PublicProfileDto } from './dto/public-profile.dto';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

interface AuthRequest {
  user: { id: string; email: string; username: string };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly meService: MeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post(':id/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Follow user by ID', description: 'Current user follows the user with the given ID. Returns 204 on success.' })
  @ApiParam({ name: 'id', required: true, description: 'User UUID', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Following' })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself', schema: API_ERROR })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async followById(@Request() req: AuthRequest, @Param('id') id: string) {
    await this.meService.followById(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Delete(':id/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow user by ID', description: 'Current user stops following the user with the given ID. Returns 204 on success.' })
  @ApiParam({ name: 'id', required: true, description: 'User UUID', schema: { type: 'string', format: 'uuid' } })
  @ApiResponse({ status: 204, description: 'Unfollowed' })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async unfollowById(@Request() req: AuthRequest, @Param('id') id: string) {
    await this.meService.unfollowById(req.user.id, id);
  }

  @Get(':username/owned')
  @ApiOperation({ summary: 'Get user collection', description: 'Returns the public user’s owned games (collection).' })
  @ApiParam({ name: 'username', required: true, description: 'Username', schema: { type: 'string' }, example: 'johndoe' })
  @ApiResponse({ status: 200, description: 'Owned games', schema: { type: 'object', properties: { games: { type: 'array', items: { $ref: '#/components/schemas/GameDto' } } } } })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async getPublicOwned(@Param('username') username: string) {
    const profile = await this.usersService.getPublicProfile(username);
    const games = await this.meService.listOwned(profile.id);
    return { games };
  }

  @Get(':username/wishlist')
  @ApiOperation({ summary: 'Get user wanted list', description: 'Returns the public user’s wishlist (wanted) games.' })
  @ApiParam({ name: 'username', required: true, description: 'Username', schema: { type: 'string' }, example: 'johndoe' })
  @ApiResponse({ status: 200, description: 'Wishlist games', schema: { type: 'object', properties: { games: { type: 'array', items: { $ref: '#/components/schemas/GameDto' } } } } })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async getPublicWishlist(@Param('username') username: string) {
    const profile = await this.usersService.getPublicProfile(username);
    const games = await this.meService.listWishlist(profile.id);
    return { games };
  }

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
