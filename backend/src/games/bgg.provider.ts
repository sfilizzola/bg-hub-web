import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';
import type { ExternalGame, GameProvider } from './providers/types';

@Injectable()
export class BggGameProvider implements GameProvider {
  readonly id = 'bgg';
  private readonly logger = new Logger(BggGameProvider.name);
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });

  constructor(private readonly config: ConfigService) {}

  private getBaseUrl(): string {
    return this.config.get<string>('BGG_BASE_URL', '') || 'https://boardgamegeek.com/xmlapi2';
  }

  /**
   * Available if base URL is set (BGG public API does not require a token).
   * Optional BGG_BEARER_TOKEN can be set for future use.
   */
  isAvailable(): boolean {
    const base = this.getBaseUrl();
    return typeof base === 'string' && base.length > 0;
  }

  async search(query: string): Promise<ExternalGame[]> {
    const baseUrl = this.getBaseUrl();
    const searchUrl = `${baseUrl}/search?type=boardgame&query=${encodeURIComponent(query)}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      this.logger.warn(`BGG search failed with status ${searchResponse.status}`);
      return [];
    }

    const searchXml = await searchResponse.text();
    const searchJson = this.parser.parse(searchXml);
    const items = Array.isArray(searchJson.items?.item)
      ? searchJson.items.item
      : searchJson.items?.item
      ? [searchJson.items.item]
      : [];

    const firstIds = items.slice(0, 10).map((item: { id: string }) => String(item.id));
    if (firstIds.length === 0) return [];

    const thingsUrl = `${baseUrl}/thing?stats=1&id=${firstIds.join(',')}`;
    const thingsResponse = await fetch(thingsUrl);
    if (!thingsResponse.ok) {
      this.logger.warn(`BGG thing failed with status ${thingsResponse.status}`);
      return [];
    }

    const thingsXml = await thingsResponse.text();
    const thingsJson = this.parser.parse(thingsXml);
    const gameItems = Array.isArray(thingsJson.items?.item)
      ? thingsJson.items.item
      : thingsJson.items?.item
      ? [thingsJson.items.item]
      : [];

    return gameItems.map((item: Record<string, unknown>) => this.mapItemToExternal(item));
  }

  private mapItemToExternal(item: Record<string, unknown>): ExternalGame {
    const nameNode = Array.isArray(item.name)
      ? (item.name as { type?: string; value?: string }[]).find((n) => n.type === 'primary') ?? (item.name as { value?: string }[])[0]
      : (item.name as { value?: string } | undefined);
    const name = nameNode?.value ?? '';

    const year = item.yearpublished && typeof (item.yearpublished as { value?: string }).value === 'string'
      ? Number((item.yearpublished as { value: string }).value)
      : null;
    const minPlayers = item.minplayers && typeof (item.minplayers as { value?: string }).value === 'string'
      ? Number((item.minplayers as { value: string }).value)
      : null;
    const maxPlayers = item.maxplayers && typeof (item.maxplayers as { value?: string }).value === 'string'
      ? Number((item.maxplayers as { value: string }).value)
      : null;
    const playTime = item.playingtime && typeof (item.playingtime as { value?: string }).value === 'string'
      ? Number((item.playingtime as { value: string }).value)
      : null;
    const weight = item.statistics && (item.statistics as { ratings?: { averageweight?: { value?: string } } }).ratings?.averageweight?.value;
    const complexityWeight = weight != null ? Number(weight) : null;

    const categories = this.collectValues(item.link as unknown, 'boardgamecategory');
    const mechanics = this.collectValues(item.link as unknown, 'boardgamemechanic');
    const imageUrl = (item.image as string) ?? null;
    const description = (item.description as string) ?? null;

    return {
      externalId: String(item.id),
      apiRef: 'bgg',
      name,
      imageUrl,
      year,
      minPlayers,
      maxPlayers,
      playTime,
      complexityWeight,
      categories,
      mechanics,
      description,
    };
  }

  private collectValues(links: unknown, type: string): string[] | null {
    if (!links) return null;
    const all = Array.isArray(links) ? links : [links];
    const filtered = all.filter((l: { type?: string }) => (l as { type?: string }).type === type);
    if (filtered.length === 0) return null;
    return filtered.map((l: { value?: string }) => (l as { value?: string }).value).filter(Boolean) as string[];
  }
}
