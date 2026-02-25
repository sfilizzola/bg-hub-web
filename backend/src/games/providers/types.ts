/**
 * Provider-neutral shape returned by external game providers.
 */
export interface ExternalGame {
  externalId: string;
  apiRef: string;
  name: string;
  imageUrl?: string | null;
  year?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playTime?: number | null;
  complexityWeight?: number | null;
  categories?: string[] | null;
  mechanics?: string[] | null;
  description?: string | null;
}

/**
 * Optional richer details from getDetails (e.g. full description).
 * Can extend ExternalGame when needed.
 */
export interface ExternalGameDetails extends ExternalGame {}

export interface GameProvider {
  id: string;
  search(query: string): Promise<ExternalGame[]>;
  getDetails?(externalId: string): Promise<ExternalGameDetails>;
  /** Whether this provider can be used (env/config present, not rate-limited, etc.) */
  isAvailable(): boolean | Promise<boolean>;
}
