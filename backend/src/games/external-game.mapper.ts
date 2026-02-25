import { Game } from './game.entity';
import type { ExternalGame } from './providers/types';

/**
 * Maps provider-neutral ExternalGame to Game entity fields (for create/update).
 * Does not set id, createdAt, updatedAt (handled by DB/entity).
 */
export class ExternalGameMapper {
  toEntityFields(external: ExternalGame): Partial<Game> {
    return {
      name: external.name,
      externalId: external.externalId,
      apiRef: external.apiRef,
      imageUrl: external.imageUrl ?? null,
      year: external.year ?? null,
      minPlayers: external.minPlayers ?? null,
      maxPlayers: external.maxPlayers ?? null,
      playTime: external.playTime ?? null,
      complexityWeight: external.complexityWeight ?? null,
      categories: external.categories ?? null,
      mechanics: external.mechanics ?? null,
      description: external.description ?? null,
    };
  }
}
