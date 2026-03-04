/**
 * Type of feed event. Used for filtering and rendering.
 * Extensible for future reaction/comment types without breaking API.
 */
export enum FeedEventType {
  /** Someone started following currentUser — "<actor> followed you" */
  FOLLOWED_YOU = 'FOLLOWED_YOU',
  /** currentUser started following someone — "You followed <target>" */
  YOU_FOLLOWED = 'YOU_FOLLOWED',
  /** Actor added a game to their wishlist */
  ADDED_TO_WISHLIST = 'ADDED_TO_WISHLIST',
  /** Actor added a game to their collection (owned) */
  ADDED_TO_COLLECTION = 'ADDED_TO_COLLECTION',
  /** Actor created a play log */
  PLAYLOG_CREATED = 'PLAYLOG_CREATED',
}
