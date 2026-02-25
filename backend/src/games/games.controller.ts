import { Controller, Get, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { GameDto } from './dto/game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('search')
  async search(@Query('q') q = '') {
    const result = await this.gamesService.search(q);
    return {
      games: result.games.map((g) => new GameDto(g)),
      externalAvailable: result.externalAvailable,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const game = await this.gamesService.findOne(id);
    return new GameDto(game);
  }
}

