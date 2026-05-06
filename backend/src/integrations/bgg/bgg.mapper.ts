import { Injectable } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import type { ExternalGame } from '../../games/providers/types';

/** Minimal BGG search result (no DB import). */
export interface BggSearchItem {
  bggId: number;
  name: string;
  year: number | null;
  imageUrl: string | null;
}

/** Parsed BGG XML "item" (thing) - flexible shape from parser. */
interface BggItemShape {
  id?: string | number;
  name?: { value?: string; type?: string } | Array<{ value?: string; type?: string }>;
  yearpublished?: { value?: string } | string;
  image?: string;
  thumbnail?: string;
  minplayers?: { value?: string } | string;
  maxplayers?: { value?: string } | string;
  playingtime?: { value?: string } | string;
  description?: string;
  link?: { type?: string; value?: string } | Array<{ type?: string; value?: string }>;
  statistics?: {
    ratings?: {
      averageweight?: { value?: string };
    };
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

/**
 * Maps BGG XML responses to our ExternalGame model and to minimal search items.
 * BGG fields mapped: name, yearpublished, image/thumbnail, minplayers, maxplayers,
 * playingtime, description, link[type=boardgamecategory], link[type=boardgamemechanic],
 * statistics.rating.averageweight.
 */
@Injectable()
export class BggMapper {
  /**
   * Parse XML string to JSON (generic). Use parseThingResponse / parseSearchResponse for typed results.
   */
  parseXml(xml: string): Record<string, unknown> {
    return parser.parse(xml) as Record<string, unknown>;
  }

  /**
   * Parse /thing response. Expects root with items.item or items.item[].
   */
  parseThingResponse(xml: string): BggItemShape[] {
    const json = this.parseXml(xml);
    const items = json.items as { item?: BggItemShape | BggItemShape[] } | undefined;
    if (!items?.item) return [];
    return Array.isArray(items.item) ? items.item : [items.item];
  }

  /**
   * Parse /search response. Expects root with items.item (id, name, yearpublished).
   * BGG returns <items><item id="..." type="boardgame">...</item></items>.
   */
  parseSearchResponse(xml: string): Array<{ id: string; name?: string; yearpublished?: string }> {
    const json = this.parseXml(xml);
    const items = json.items as { item?: { id: string; name?: string; yearpublished?: string } | Array<{ id: string; name?: string; yearpublished?: string }> } | undefined;
    if (!items?.item) return [];
    return Array.isArray(items.item) ? items.item : [items.item];
  }

  /**
   * Map a BGG thing item to our ExternalGame (full details for import).
   */
  itemToExternalGame(item: BggItemShape): ExternalGame {
    const name = this.getPrimaryName(item.name);
    const externalId = String(item.id ?? '');
    const year = this.getNumber(item.yearpublished);
    const minPlayers = this.getNumber(item.minplayers);
    const maxPlayers = this.getNumber(item.maxplayers);
    const playTime = this.getNumber(item.playingtime);
    const weight = item.statistics?.ratings?.averageweight?.value;
    const complexityWeight = weight != null ? Number(weight) : null;
    const categories = this.collectLinks(item.link, 'boardgamecategory');
    const mechanics = this.collectLinks(item.link, 'boardgamemechanic');
    const imageUrl = typeof item.image === 'string' ? item.image : (typeof item.thumbnail === 'string' ? item.thumbnail : null);
    const description = typeof item.description === 'string' ? item.description : null;

    return {
      externalId,
      apiRef: 'bgg',
      name,
      imageUrl: imageUrl ?? null,
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

  /**
   * Map a BGG thing item to minimal search result (no DB).
   */
  itemToSearchItem(item: BggItemShape): BggSearchItem {
    const name = this.getPrimaryName(item.name);
    const bggId = Number(item.id) || 0;
    const year = this.getNumber(item.yearpublished);
    const imageUrl = typeof item.thumbnail === 'string' ? item.thumbnail : (typeof item.image === 'string' ? item.image : null);
    return {
      bggId,
      name,
      year,
      imageUrl,
    };
  }

  private getPrimaryName(name: BggItemShape['name']): string {
    if (!name) return '';
    const arr = Array.isArray(name) ? name : [name];
    const primary = arr.find((n) => (n as { type?: string }).type === 'primary');
    const first = arr[0] as { value?: string } | undefined;
    return (primary ?? first)?.value ?? '';
  }

  private getNumber(val: unknown): number | null {
    if (val == null) return null;
    if (typeof val === 'object' && 'value' in val && typeof (val as { value: string }).value === 'string') {
      const n = Number((val as { value: string }).value);
      return Number.isNaN(n) ? null : n;
    }
    if (typeof val === 'string') {
      const n = Number(val);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }

  private collectLinks(link: BggItemShape['link'], type: string): string[] | null {
    if (!link) return null;
    const all = Array.isArray(link) ? link : [link];
    const filtered = all.filter((l) => l.type === type);
    if (filtered.length === 0) return null;
    return filtered.map((l) => l.value).filter(Boolean) as string[];
  }
}
