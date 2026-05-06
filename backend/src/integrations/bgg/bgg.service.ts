import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BggClient } from './bgg.client';
import { BggMapper, type BggSearchItem } from './bgg.mapper';
import type { ExternalGame } from '../../games/providers/types';

/**
 * BGG integration service: search (no DB) and fetch full details (no DB write).
 * Rate limiting and auth are handled in BggClient.
 */
@Injectable()
export class BggService {
  private readonly logger = new Logger(BggService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly client: BggClient,
    private readonly mapper: BggMapper,
  ) {}

  isAvailable(): boolean {
    const base = this.config.get<string>('BGG_BASE_URL', '') || 'https://boardgamegeek.com/xmlapi2';
    return typeof base === 'string' && base.length > 0;
  }

  /** Max BGG search IDs to consider (search returns many; we cap to avoid huge responses). */
  private static readonly BGG_SEARCH_IDS_CAP = 100;
  /** Max IDs to request per /thing call (BGG accepts multiple ids; keep URL and response size reasonable). */
  private static readonly BGG_THING_BATCH_SIZE = 30;

  /**
   * Search BGG by query. Does NOT import into DB. Returns minimal items for merging with local results.
   * Uses pagination: only fetches /thing details for the requested slice (limit/offset) to save bandwidth and time.
   */
  async searchGames(
    query: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ items: BggSearchItem[]; total: number }> {
    const trimmed = query.trim();
    if (!trimmed) return { items: [], total: 0 };

    try {
      const searchPath = `/search?type=boardgame&query=${encodeURIComponent(trimmed)}`;
      const searchXml = await this.client.get(searchPath);
      const searchItems = this.mapper.parseSearchResponse(searchXml);
      const allIds = searchItems
        .map((i) => i.id)
        .filter(Boolean)
        .slice(0, BggService.BGG_SEARCH_IDS_CAP);
      const total = allIds.length;
      if (total === 0) return { items: [], total: 0 };

      const offset = Math.max(0, options?.offset ?? 0);
      const limit = Math.min(50, Math.max(0, options?.limit ?? 20));
      if (limit === 0) return { items: [], total };
      const idsSlice = allIds.slice(offset, offset + limit);
      if (idsSlice.length === 0) return { items: [], total };

      const items: BggSearchItem[] = [];
      for (let i = 0; i < idsSlice.length; i += BggService.BGG_THING_BATCH_SIZE) {
        const batch = idsSlice.slice(i, i + BggService.BGG_THING_BATCH_SIZE);
        const thingsPath = `/thing?stats=1&id=${batch.join(',')}`;
        const thingsXml = await this.client.get(thingsPath);
        const thingItems = this.mapper.parseThingResponse(thingsXml);
        items.push(...thingItems.map((item) => this.mapper.itemToSearchItem(item)));
      }
      return { items, total };
    } catch (err) {
      this.logger.warn(`BGG search failed: ${err instanceof Error ? err.message : String(err)}`);
      return { items: [], total: 0 };
    }
  }

  /**
   * Fetch full game details by BGG ID. Does NOT write to DB; returns ExternalGame for caller to persist.
   */
  async fetchGameDetails(bggId: number): Promise<ExternalGame | null> {
    try {
      const xml = await this.client.get(`/thing?stats=1&id=${bggId}`);
      const items = this.mapper.parseThingResponse(xml);
      const item = items.find((i) => String(i.id) === String(bggId)) ?? items[0];
      if (!item) return null;
      return this.mapper.itemToExternalGame(item);
    } catch (err) {
      this.logger.warn(`BGG fetch details failed for id ${bggId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }
}
