import { Injectable } from '@nestjs/common';
import type { ExternalGame, ExternalGameDetails, GameProvider } from './providers/types';
import { BggService } from '../integrations/bgg/bgg.service';

/**
 * GameProvider adapter for BGG. Delegates to BggService (search + fetch details).
 * Used by GameProviderRegistry for isAvailable and searchAll when enabled.
 */
@Injectable()
export class BggGameProvider implements GameProvider {
  readonly id = 'bgg';

  constructor(private readonly bggService: BggService) {}

  isAvailable(): boolean {
    return this.bggService.isAvailable();
  }

  async search(query: string): Promise<ExternalGame[]> {
    const items = await this.bggService.searchGames(query);
    return items.map((item) => ({
      externalId: String(item.bggId),
      apiRef: 'bgg',
      name: item.name,
      year: item.year ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
    }));
  }

  async getDetails(externalId: string): Promise<ExternalGameDetails | undefined> {
    const bggId = Number(externalId);
    if (!Number.isInteger(bggId)) return undefined;
    const details = await this.bggService.fetchGameDetails(bggId);
    return details ?? undefined;
  }
}
