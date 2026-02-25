import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExternalGame, GameProvider } from './providers/types';
import { BggGameProvider } from './bgg.provider';

export type SearchAllResult = {
  games: ExternalGame[];
  available: boolean;
};

@Injectable()
export class GameProviderRegistry {
  constructor(
    private readonly config: ConfigService,
    private readonly bgg: BggGameProvider,
  ) {}

  private getEnabledIds(): string[] {
    const raw = this.config.get<string>('GAME_PROVIDERS_ENABLED', '') || '';
    return raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  private getEnabledProviders(): GameProvider[] {
    const ids = this.getEnabledIds();
    const providers: GameProvider[] = [];
    if (ids.includes('bgg')) providers.push(this.bgg);
    return providers;
  }

  /**
   * True if at least one enabled provider reports itself available.
   */
  async isAnyExternalAvailable(): Promise<boolean> {
    const providers = this.getEnabledProviders();
    if (providers.length === 0) return false;
    for (const p of providers) {
      const ok = await Promise.resolve(p.isAvailable());
      if (ok) return true;
    }
    return false;
  }

  /**
   * Tries each enabled provider in order; returns first non-empty result.
   * Never throws: on failure or all empty returns { games: [], available: false }.
   */
  async searchAll(query: string): Promise<SearchAllResult> {
    const trimmed = query.trim();
    if (!trimmed) return { games: [], available: false };

    const providers = this.getEnabledProviders();
    if (providers.length === 0) return { games: [], available: false }

    for (const provider of providers) {
      try {
        const available = await Promise.resolve(provider.isAvailable());
        if (!available) continue;
        const games = await provider.search(trimmed);
        if (games.length > 0) {
          return { games, available: true };
        }
      } catch {
        // skip this provider, try next
        continue;
      }
    }
    return { games: [], available: false };
  }
}
