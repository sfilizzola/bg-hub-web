import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { GameProvider, GameProviderResult } from './game.provider';

const BGG_BASE_URL = process.env.BGG_BASE_URL || 'https://boardgamegeek.com/xmlapi2';

@Injectable()
export class BggGameProvider implements GameProvider {
  private readonly logger = new Logger(BggGameProvider.name);
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });

  async searchByName(query: string): Promise<GameProviderResult[]> {
    const searchUrl = `${BGG_BASE_URL}/search?type=boardgame&query=${encodeURIComponent(query)}`;

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

    const firstIds = items.slice(0, 10).map((item: any) => String(item.id));
    if (firstIds.length === 0) {
      return [];
    }

    const thingsUrl = `${BGG_BASE_URL}/thing?stats=1&id=${firstIds.join(',')}`;
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

    return gameItems.map((item: any) => this.mapItemToResult(item));
  }

  private mapItemToResult(item: any): GameProviderResult {
    const nameNode = Array.isArray(item.name)
      ? item.name.find((n: any) => n.type === 'primary') || item.name[0]
      : item.name;
    const name = nameNode?.value ?? '';

    const year = item.yearpublished?.value ? Number(item.yearpublished.value) : null;
    const minPlayers = item.minplayers?.value ? Number(item.minplayers.value) : null;
    const maxPlayers = item.maxplayers?.value ? Number(item.maxplayers.value) : null;
    const playTime = item.playingtime?.value ? Number(item.playingtime.value) : null;
    const complexityWeight = item.statistics?.ratings?.averageweight?.value
      ? Number(item.statistics.ratings.averageweight.value)
      : null;

    const categories = this.collectValues(item.link, 'boardgamecategory');
    const mechanics = this.collectValues(item.link, 'boardgamemechanic');

    const imageUrl = item.image ?? null;
    const description = item.description ?? null;

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

  private collectValues(links: any, type: string): string[] | null {
    if (!links) {
      return null;
    }
    const all = Array.isArray(links) ? links : [links];
    const filtered = all.filter((l: any) => l.type === type);
    if (filtered.length === 0) {
      return null;
    }
    return filtered.map((l: any) => l.value).filter(Boolean);
  }
}

