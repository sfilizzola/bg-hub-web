import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from './me.service';
import { CreatePlayLogDto } from './dto/create-play-log.dto';

interface AuthRequest {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Post('owned/:gameId')
  async addOwned(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    const game = await this.meService.addOwned(req.user.id, gameId);
    return { game };
  }

  @Delete('owned/:gameId')
  async removeOwned(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    return this.meService.removeOwned(req.user.id, gameId);
  }

  @Get('owned')
  async listOwned(@Request() req: AuthRequest) {
    const games = await this.meService.listOwned(req.user.id);
    return { games };
  }

  @Post('wishlist/:gameId')
  async addWishlist(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    const game = await this.meService.addWishlist(req.user.id, gameId);
    return { game };
  }

  @Delete('wishlist/:gameId')
  async removeWishlist(@Request() req: AuthRequest, @Param('gameId') gameId: string) {
    return this.meService.removeWishlist(req.user.id, gameId);
  }

  @Get('wishlist')
  async listWishlist(@Request() req: AuthRequest) {
    const games = await this.meService.listWishlist(req.user.id);
    return { games };
  }

  @Post('plays')
  async createPlayLog(@Request() req: AuthRequest, @Body() body: CreatePlayLogDto) {
    return this.meService.createPlayLog(req.user.id, body);
  }

  @Get('plays')
  async listPlays(@Request() req: AuthRequest) {
    const plays = await this.meService.listPlays(req.user.id);
    return { plays };
  }

  @Delete('plays/:id')
  async deletePlayLog(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.meService.deletePlayLog(req.user.id, id);
  }
}

