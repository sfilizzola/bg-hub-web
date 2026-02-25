import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from './me.service';
import { CreatePlayLogDto } from './dto/create-play-log.dto';
import { GameWrapperDto } from '../games/dto/game-wrapper.dto';
import { GamesListResponseDto } from './dto/games-list-response.dto';
import { PlayLogResponseDto } from './dto/play-log-response.dto';
import { PlayLogListResponseDto } from './dto/play-log-list-response.dto';
import { FollowingListResponseDto } from './dto/following-list-response.dto';
import { SuccessResponseDto } from './dto/success-response.dto';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };
const gameIdParam = (): { name: string; required: boolean; description: string; schema: object; example: string } =>
  ({
    name: 'gameId',
    required: true,
    description: 'Game UUID',
    schema: { type: 'string', format: 'uuid' },
    example: '123e4567-e89b-12d3-a456-426614174000',
  }) as const;
const usernameParam = (): { name: string; required: boolean; description: string; schema: object; example: string } =>
  ({
    name: 'username',
    required: true,
    description: 'Username',
    schema: { type: 'string' },
    example: 'johndoe',
  }) as const;
const playIdParam = (): { name: string; required: boolean; description: string; schema: object; example: string } =>
  ({
    name: 'id',
    required: true,
    description: 'Play log UUID',
    schema: { type: 'string', format: 'uuid' },
    example: '123e4567-e89b-12d3-a456-426614174000',
  }) as const;

interface AuthRequest {
  user: { id: string; email: string; username: string };
}

@ApiTags('Me')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Post('owned/:gameId')
  @ApiOperation({ summary: 'Add game to owned', description: 'Marks a game as owned by the current user.' })
  @ApiParam(gameIdParam())
  @ApiResponse({ status: 201, description: 'Game added to owned', type: GameWrapperDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async addOwned(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    const game = await this.meService.addOwned(req.user.id, gameId);
    return { game };
  }

  @Delete('owned/:gameId')
  @ApiOperation({ summary: 'Remove game from owned', description: 'Removes the game from the current user’s owned list.' })
  @ApiParam(gameIdParam())
  @ApiResponse({ status: 200, description: 'Removed', type: SuccessResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async removeOwned(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    return this.meService.removeOwned(req.user.id, gameId);
  }

  @Get('owned')
  @ApiOperation({ summary: 'List owned games', description: 'Returns the current user’s owned games, newest first.' })
  @ApiResponse({ status: 200, description: 'Owned games', type: GamesListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async listOwned(@Request() req: AuthRequest) {
    const games = await this.meService.listOwned(req.user.id);
    return { games };
  }

  @Post('wishlist/:gameId')
  @ApiOperation({ summary: 'Add game to wishlist', description: 'Marks a game as wishlist for the current user.' })
  @ApiParam(gameIdParam())
  @ApiResponse({ status: 201, description: 'Game added to wishlist', type: GameWrapperDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async addWishlist(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    const game = await this.meService.addWishlist(req.user.id, gameId);
    return { game };
  }

  @Delete('wishlist/:gameId')
  @ApiOperation({ summary: 'Remove game from wishlist', description: 'Removes the game from the current user’s wishlist.' })
  @ApiParam(gameIdParam())
  @ApiResponse({ status: 200, description: 'Removed', type: SuccessResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async removeWishlist(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    return this.meService.removeWishlist(req.user.id, gameId);
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'List wishlist games', description: 'Returns the current user’s wishlist games, newest first.' })
  @ApiResponse({ status: 200, description: 'Wishlist games', type: GamesListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async listWishlist(@Request() req: AuthRequest) {
    const games = await this.meService.listWishlist(req.user.id);
    return { games };
  }

  @Post('plays')
  @ApiOperation({ summary: 'Create play log', description: 'Records a play of a game for the current user.' })
  @ApiBody({
    type: CreatePlayLogDto,
    examples: {
      default: {
        summary: 'Play entry',
        value: {
          gameId: '123e4567-e89b-12d3-a456-426614174000',
          playedAt: '2025-02-25T14:00:00.000Z',
          durationMinutes: 90,
          playersCount: 4,
          notes: 'First play',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Play log created', type: PlayLogResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed', schema: API_ERROR })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async createPlayLog(@Request() req: AuthRequest, @Body() body: CreatePlayLogDto) {
    return this.meService.createPlayLog(req.user.id, body);
  }

  @Get('plays')
  @ApiOperation({ summary: 'List play logs', description: 'Returns the current user’s play logs, latest first (limit 50).' })
  @ApiResponse({ status: 200, description: 'Play logs', type: PlayLogListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async listPlays(@Request() req: AuthRequest) {
    const plays = await this.meService.listPlays(req.user.id);
    return { plays };
  }

  @Delete('plays/:id')
  @ApiOperation({ summary: 'Delete play log', description: 'Deletes a play log by ID. Only the owner can delete.' })
  @ApiParam(playIdParam())
  @ApiResponse({ status: 200, description: 'Deleted', type: SuccessResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'Play log not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async deletePlayLog(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.meService.deletePlayLog(req.user.id, id);
  }

  @Post('follow/:username')
  @ApiOperation({ summary: 'Follow user', description: 'Follows the given username. Cannot follow yourself.' })
  @ApiParam(usernameParam())
  @ApiResponse({ status: 201, description: 'Following', type: SuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself', schema: API_ERROR })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async follow(@Request() req: AuthRequest, @Param('username') username: string) {
    return this.meService.follow(req.user.id, username);
  }

  @Delete('follow/:username')
  @ApiOperation({ summary: 'Unfollow user', description: 'Stops following the given username.' })
  @ApiParam(usernameParam())
  @ApiResponse({ status: 200, description: 'Unfollowed', type: SuccessResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 404, description: 'User not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async unfollow(@Request() req: AuthRequest, @Param('username') username: string) {
    return this.meService.unfollow(req.user.id, username);
  }

  @Get('following')
  @ApiOperation({ summary: 'List following', description: 'Returns users the current user follows.' })
  @ApiResponse({ status: 200, description: 'Following list', type: FollowingListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async listFollowing(@Request() req: AuthRequest) {
    return this.meService.listFollowing(req.user.id);
  }

  @Get('followers')
  @ApiOperation({ summary: 'List followers', description: 'Returns users that follow the current user.' })
  @ApiResponse({ status: 200, description: 'Followers list', type: FollowingListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async listFollowers(@Request() req: AuthRequest) {
    return this.meService.listFollowers(req.user.id);
  }
}

