import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { GameDto } from './dto/game.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameSearchResponseDto } from './dto/game-search-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrustedUserHidesEndpointGuard } from '../auth/trusted-user-hides-endpoint.guard';

const API_ERROR = { $ref: '#/components/schemas/ApiErrorDto' };

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search games',
    description: 'Searches local DB and BGG; merges results. Does not import BGG games. Each item has source LOCAL or BGG.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query (game name)',
    schema: { type: 'string' },
    example: 'Catan',
  })
  @ApiResponse({ status: 200, description: 'Search results (local + BGG merged)', type: GameSearchResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async search(@Query('q') q = '') {
    return this.gamesService.search(q);
  }

  @Get('by-bgg-id/:bggId')
  @ApiOperation({
    summary: 'Get game by BGG ID',
    description: 'Returns game from local DB if already imported; otherwise fetches from BGG, saves, and returns.',
  })
  @ApiParam({
    name: 'bggId',
    required: true,
    description: 'BoardGameGeek ID',
    schema: { type: 'integer' },
    example: 13,
  })
  @ApiResponse({ status: 200, description: 'Game', type: GameDto })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async getByBggId(@Param('bggId') bggId: string) {
    const id = Number(bggId);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException({ message: 'Invalid bggId' });
    }
    const game = await this.gamesService.getByBggId(id);
    return new GameDto(game);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get game by ID',
    description: 'Returns a single game by UUID. Returns 404 if not found.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Game UUID',
    schema: { type: 'string', format: 'uuid' },
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Game', type: GameDto })
  @ApiResponse({ status: 404, description: 'Game not found', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async getOne(@Param('id') id: string) {
    const game = await this.gamesService.findOne(id);
    return new GameDto(game);
  }

  @UseGuards(JwtAuthGuard, TrustedUserHidesEndpointGuard)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiOperation({
    summary: 'Create game (trusted users)',
    description: 'Creates a new game in the catalog. Requires JWT and trusted-user role.',
  })
  @ApiBody({
    type: CreateGameDto,
    examples: {
      default: {
        summary: 'New game',
        value: {
          name: 'Catan',
          year: 1995,
          minPlayers: 3,
          maxPlayers: 4,
          playTime: 90,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Game created', type: GameDto })
  @ApiResponse({ status: 400, description: 'Validation failed', schema: API_ERROR })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: API_ERROR })
  @ApiResponse({ status: 403, description: 'Forbidden (not a trusted user)', schema: API_ERROR })
  @ApiResponse({ status: 500, description: 'Internal server error', schema: API_ERROR })
  async create(@Body() body: CreateGameDto) {
    const game = await this.gamesService.createGame(body);
    return new GameDto(game);
  }
}

