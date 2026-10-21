// src/services/youtubeApiService.ts
// Dedicated Google / YouTube Data API v3 Service Layer for WiseToons for Kids.
import { ALL_SECTION_ID, Catalog, CatalogSection, WiseToonVideo } from '../data/videos';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Uses EXPO_PUBLIC_YOUTUBE_API_KEY if set, falling back to the configured project API key
// so live fetching works immediately without requiring a Metro bundler restart.
const DEFAULT_API_KEY = 'AIzaSyD_7jEbEyW__ZCgFAExqzl9gggJFJEU3Iw';
const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || DEFAULT_API_KEY;

const DEFAULT_CHANNEL_HANDLE =
  process.env.EXPO_PUBLIC_YOUTUBE_CHANNEL_HANDLE || 'WiseToons_for_Kids';
const FALLBACK_CHANNEL_ID = 'UCjg4bYwHHGwrHpGYXxSZGRA';

const MAX_PLAYLISTS = 50;
const MAX_ITEMS_PER_LIST = 200;

export interface YouTubeChannelInfo {
  channelId: string;
  title: string;
  logoUrl: string;
  uploadsPlaylistId: string;
  longFormPlaylistId: string;
  shortsPlaylistId: string;
}

export interface YouTubePlaylistSummary {
  id: string;
  title: string;
  itemCount: number;
}

interface YouTubeApiChannelListResponse {
  items?: {
    id: string;
    snippet?: {
      title: string;
      thumbnails?: {
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }[];
}

interface YouTubeApiPlaylistListResponse {
  items?: {
    id: string;
    snippet: { title: string };
    contentDetails?: { itemCount?: number };
  }[];
}

interface YouTubeApiPlaylistItemsResponse {
  nextPageToken?: string;
  items?: {
    contentDetails: { videoId: string; videoPublishedAt?: string };
  }[];
}

interface YouTubeApiVideosResponse {
  items?: {
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails?: {
        maxres?: { url: string };
        standard?: { url: string };
        high?: { url: string };
        medium?: { url: string };
      };
    };
    contentDetails: { duration: string };
    status: { embeddable: boolean; privacyStatus: string };
  }[];
}

/** Parses ISO-8601 duration (e.g. PT2M50S) into MM:SS or H:MM:SS. */
export function parseIsoDuration(iso: string): string {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return '';
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** Converts a YouTube video description into clean Sing-Along / Story cards. */
export function parseDescriptionToCards(description: string): string[] {
  if (!description) return [];
  return description
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .filter(
          (line) =>
            line.trim().length > 0 &&
            !/https?:\/\//i.test(line) &&
            !/^\s*[#@]/.test(line)
        )
        .join('\n')
        .trim()
    )
    .filter((block) => block.length > 0)
    .slice(0, 8);
}

class YouTubeApiService {
  private readonly apiKey: string;
  private readonly channelHandle: string;

  constructor(apiKey = API_KEY, channelHandle = DEFAULT_CHANNEL_HANDLE) {
    this.apiKey = apiKey;
    this.channelHandle = channelHandle.replace(/^@/, '');
  }

  public hasValidKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /** Low-level GET helper against YouTube Data API v3. */
  private async request<T>(
    endpoint: string,
    params: Record<string, string>,
    signal?: AbortSignal
  ): Promise<T> {
    if (!this.hasValidKey()) {
      throw new Error('YouTube Data API key is not configured.');
    }
    const query = new URLSearchParams({
      ...params,
      key: this.apiKey,
    }).toString();

    const response = await fetch(`${YOUTUBE_API_BASE_URL}/${endpoint}?${query}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(
        `YouTube Data API [${endpoint}] HTTP ${response.status}: ${errBody.slice(0, 200)}`
      );
    }

    return (await response.json()) as T;
  }

  /** Resolves the channel ID, logo URL, and auto-generated tab playlist IDs (Uploads, Videos, Shorts). */
  public async getChannelDetails(signal?: AbortSignal): Promise<YouTubeChannelInfo> {
    let channelItem: NonNullable<YouTubeApiChannelListResponse['items']>[number] | undefined;

    try {
      const byHandle = await this.request<YouTubeApiChannelListResponse>(
        'channels',
        {
          part: 'id,snippet,contentDetails',
          forHandle: this.channelHandle,
        },
        signal
      );
      channelItem = byHandle.items?.[0];
    } catch {
      // Fallback to direct channel ID lookup if forHandle fails
    }

    if (!channelItem) {
      const byId = await this.request<YouTubeApiChannelListResponse>(
        'channels',
        {
          part: 'id,snippet,contentDetails',
          id: FALLBACK_CHANNEL_ID,
        },
        signal
      );
      channelItem = byId.items?.[0];
    }

    if (!channelItem) {
      throw new Error(`YouTube channel @${this.channelHandle} not found.`);
    }

    const channelId = channelItem.id;
    const suffix = channelId.startsWith('UC') ? channelId.slice(2) : channelId;
    const thumbs = channelItem.snippet?.thumbnails;
    const logoUrl =
      thumbs?.medium?.url ||
      thumbs?.high?.url ||
      thumbs?.default?.url ||
      '';

    return {
      channelId,
      title: channelItem.snippet?.title ?? 'WiseToons for Kids',
      logoUrl,
      uploadsPlaylistId:
        channelItem.contentDetails?.relatedPlaylists?.uploads || `UU${suffix}`,
      // YouTube's built-in playlist IDs for the channel's "Videos" (long-form) and "Shorts" tabs:
      longFormPlaylistId: `UULF${suffix}`,
      shortsPlaylistId: `UUSH${suffix}`,
    };
  }

  /** Fetches public playlists created on the channel. */
  public async getChannelPlaylists(
    channelId: string,
    signal?: AbortSignal
  ): Promise<YouTubePlaylistSummary[]> {
    try {
      const res = await this.request<YouTubeApiPlaylistListResponse>(
        'playlists',
        {
          part: 'snippet,contentDetails',
          channelId,
          maxResults: String(MAX_PLAYLISTS),
        },
        signal
      );
      return (res.items ?? []).map((item) => ({
        id: item.id,
        title: item.snippet.title,
        itemCount: item.contentDetails?.itemCount ?? 0,
      }));
    } catch {
      return [];
    }
  }

  /** Fetches all video IDs in a playlist (handles pagination). */
  public async getPlaylistVideoIds(
    playlistId: string,
    signal?: AbortSignal
  ): Promise<string[]> {
    const videoIds: string[] = [];
    let pageToken: string | undefined;

    do {
      const res = await this.request<YouTubeApiPlaylistItemsResponse>(
        'playlistItems',
        {
          part: 'contentDetails',
          playlistId,
          maxResults: '50',
          ...(pageToken ? { pageToken } : {}),
        },
        signal
      );
      for (const item of res.items ?? []) {
        if (item.contentDetails?.videoId) {
          videoIds.push(item.contentDetails.videoId);
        }
      }
      pageToken = res.nextPageToken;
    } while (pageToken && videoIds.length < MAX_ITEMS_PER_LIST);

    return videoIds;
  }

  /** Safe wrapper around getPlaylistVideoIds that returns [] if a tab/playlist is empty. */
  private async getPlaylistVideoIdsSafe(
    playlistId: string,
    signal?: AbortSignal
  ): Promise<string[]> {
    try {
      return await this.getPlaylistVideoIds(playlistId, signal);
    } catch {
      return [];
    }
  }

  /** Fetches full metadata (title, duration, publish date, embeddable status) for a list of video IDs. */
  public async getVideosByIds(
    videoIds: string[],
    shortIdsSet: Set<string>,
    signal?: AbortSignal
  ): Promise<Map<string, WiseToonVideo>> {
    const videoMap = new Map<string, WiseToonVideo>();
    const uniqueIds = Array.from(new Set(videoIds));

    for (let i = 0; i < uniqueIds.length; i += 50) {
      const batch = uniqueIds.slice(i, i + 50);
      const res = await this.request<YouTubeApiVideosResponse>(
        'videos',
        {
          part: 'snippet,contentDetails,status',
          id: batch.join(','),
        },
        signal
      );

      for (const item of res.items ?? []) {
        if (!item.status?.embeddable || item.status?.privacyStatus !== 'public') {
          continue;
        }
        const cards = parseDescriptionToCards(item.snippet.description);
        videoMap.set(item.id, {
          videoId: item.id,
          title: item.snippet.title,
          duration: parseIsoDuration(item.contentDetails.duration),
          publishedAt: item.snippet.publishedAt,
          isShort: shortIdsSet.has(item.id),
          lyricsOrStory:
            cards.length > 0
              ? cards
              : [item.snippet.title],
        });
      }
    }

    return videoMap;
  }

  /**
   * Fetches the complete channel catalog from YouTube Data API v3:
   * - All Toons (all channel uploads ordered newest first)
   * - Videos (long-form videos ordered newest first)
   * - Shorts (YouTube Shorts ordered newest first)
   * - Every channel playlist in its native order
   */
  public async fetchChannelCatalog(signal?: AbortSignal): Promise<Catalog> {
    const channel = await this.getChannelDetails(signal);

    const [uploadIds, longFormIds, shortIds, playlists] = await Promise.all([
      this.getPlaylistVideoIds(channel.uploadsPlaylistId, signal),
      this.getPlaylistVideoIdsSafe(channel.longFormPlaylistId, signal),
      this.getPlaylistVideoIdsSafe(channel.shortsPlaylistId, signal),
      this.getChannelPlaylists(channel.channelId, signal),
    ]);

    const playlistWithItems = await Promise.all(
      playlists.map(async (pl) => ({
        ...pl,
        videoIds: await this.getPlaylistVideoIdsSafe(pl.id, signal),
      }))
    );

    const allCandidateIds = [
      ...uploadIds,
      ...longFormIds,
      ...shortIds,
      ...playlistWithItems.flatMap((p) => p.videoIds),
    ];

    if (allCandidateIds.length === 0) {
      throw new Error('No public videos found on the channel.');
    }

    const shortSet = new Set(shortIds);
    const byId = await this.getVideosByIds(allCandidateIds, shortSet, signal);

    // Sort all videos newest first by publishedAt
    const allVideosNewestFirst = Array.from(byId.values()).sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    );

    const filterPlayable = (ids: string[]) => ids.filter((id) => byId.has(id));
    const sortNewestFirst = (ids: string[]) =>
      filterPlayable(ids).sort(
        (a, b) =>
          Date.parse(byId.get(b)!.publishedAt) -
          Date.parse(byId.get(a)!.publishedAt)
      );

    // Ensure all uploads (both long-form videos and shorts) are represented under the right playlist
    const rhymesPlaylist = playlistWithItems.find((pl) =>
      /rhym|song|sing|music|nursery/i.test(pl.title)
    );
    const storiesPlaylist = playlistWithItems.find((pl) =>
      /story|stories|tale|moral|bedtime|sleep/i.test(pl.title)
    );

    // Collect all video IDs currently assigned to any playlist
    const assignedIds = new Set(playlistWithItems.flatMap((p) => p.videoIds));

    // Any video or short from channel uploads not explicitly placed in a playlist is automatically routed
    for (const video of allVideosNewestFirst) {
      if (!assignedIds.has(video.videoId)) {
        const text = `${video.title} ${(video.lyricsOrStory || []).join(' ')}`.toLowerCase();
        const isRhyme = /rhym|song|sing|music|nursery|lullaby|shark|dance|tune|jingle/.test(text);
        if (isRhyme) {
          const target = rhymesPlaylist ?? playlistWithItems[0];
          target?.videoIds.push(video.videoId);
        } else {
          const target = storiesPlaylist ?? playlistWithItems[1] ?? playlistWithItems[0];
          target?.videoIds.push(video.videoId);
        }
        assignedIds.add(video.videoId);
      }
    }

    const sections: CatalogSection[] = [];

    // NOTE: Standalone "All Toons", "Videos", and "Shorts" categories are removed.
    // Content is categorized into Rhymes, Bedtime Stories, and Kids Games.

    for (const pl of playlistWithItems) {
      const validIds = filterPlayable(pl.videoIds);
      // Deduplicate and order newest first so recent uploads appear at the top
      const sortedIds = Array.from(new Set(validIds)).sort((a, b) => {
        const timeA = Date.parse(byId.get(a)?.publishedAt || '') || 0;
        const timeB = Date.parse(byId.get(b)?.publishedAt || '') || 0;
        return timeB - timeA;
      });

      if (sortedIds.length > 0) {
        sections.push({
          id: pl.id,
          title: pl.title,
          kind: 'playlist',
          videoIds: sortedIds,
        });
      }
    }

    // Add "Kids Games"
    sections.push({
      id: 'games',
      title: 'Kids Games',
      kind: 'games',
      videoIds: [],
    });

    // Add "Education" / "Learn"
    sections.push({
      id: 'education',
      title: 'Learn & Explore',
      kind: 'education',
      videoIds: [],
    });

    return {
      videos: allVideosNewestFirst,
      sections,
      channelLogoUrl: channel.logoUrl,
    };
  }
}

export const youtubeApiService = new YouTubeApiService();
export const hasApiKey = () => youtubeApiService.hasValidKey();
export const fetchChannelCatalog = (signal?: AbortSignal) =>
  youtubeApiService.fetchChannelCatalog(signal);

