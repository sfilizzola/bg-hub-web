import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeService } from './me.service';

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
}

