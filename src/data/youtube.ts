// src/data/youtube.ts
// Re-exports the YouTube Data API v3 service layer for backward compatibility.
export {
  youtubeApiService,
  hasApiKey,
  fetchChannelCatalog,
  parseIsoDuration,
  parseDescriptionToCards,
} from '../services/youtubeApiService';
export { BUNDLED_CATALOG } from './videos';
