// src/data/videos.ts
export interface WiseToonVideo {
  videoId: string;
  title: string;
  duration: string;
  /** ISO timestamp of publication, used for "newest first" ordering. */
  publishedAt: string;
  isShort: boolean;
  lyricsOrStory: string[];
}

/** A tab on the Home screen, mirroring the channel: All, Videos, Shorts, then each playlist. */
export interface CatalogSection {
  id: string;
  title: string;
  kind: 'all' | 'videos' | 'shorts' | 'playlist';
  videoIds: string[];
}

export interface Catalog {
  /** Every video, newest first. */
  videos: WiseToonVideo[];
  sections: CatalogSection[];
  channelLogoUrl?: string;
}

export const ALL_SECTION_ID = 'all';
export const DEFAULT_CHANNEL_LOGO_URL =
  'https://yt3.ggpht.com/SzC1IekkD9w5fCTrjRNh3WW0XYLDutdN4E16XzvQkaomBTP06BcuUdgtExCiJlLCm0cYiPFe=s240-c-k-c0x00ffffff-no-rj';

/**
 * Offline / first-launch fallback. The live catalog is loaded from the YouTube Data API
 * (see youtube.ts) and cached on-device. Restrict the API key in Google Cloud Console.
 */
const BUNDLED_VIDEOS: WiseToonVideo[] = [
  {
    videoId: 'veRPqMxNnDo',
    title: "Ollie Owl & the Moon's Lost Button",
    duration: '02:50',
    publishedAt: '2026-10-01T00:00:00Z',
    isShort: false,
    lyricsOrStory: [
      '🎵 Verse 1:\nWhen the blue dusk folded up the day\nAnd tucked the golden sun away,\nOllie Owl heard plink! below—\nA silver button in the snow.',
      '✨ Chorus:\nOllie, Ollie, little owl,\nFluff your feathers, lift your brow.\nThrough the hush and through the blue,\nThere’s a moonlit mystery for you.\nHoo-hoo, hello! Hoo-hoo, hey!\nOllie will find the way.',
      '🦊 Verse 2:\nHe asked the fox beside the stream,\n“Did you drop a button in your dream?”\nThe fox shook out his russet coat:\n“No button here—just one lost note!”',
      '🌙 Bridge & Outro:\nOne little wish for the wind to rest.\nOne little feather, soft as a nest.\n“Goodnight, bright button. Goodnight, sky.”\nThe Moon winked once—and Ollie sighed.\nHoo-hoo… Goodnight.',
    ],
  },
  {
    videoId: 'bSb7ciWnyT0',
    title: 'The Little Owl Who Was Afraid of the Dark',
    duration: '02:02',
    publishedAt: '2026-09-30T00:00:00Z',
    isShort: false,
    lyricsOrStory: [
      '🦉 Scene 1:\nHush, little listeners. High up in the branches of the grand oak tree, a little owl named Ollie blinks his big, round golden eyes as the sky turns deep, velvety blue.',
      '🦋 Scene 2:\n“Hoo-hoo, little one,” hums Luna, the wise old moth. “The dark is not empty, Ollie. It is just the world resting. Look up at the velvet ceiling of our home.”',
      '⭐ Scene 3:\nOne by one, tiny silver stars begin to blink and sparkle in the deep night sky, like little glowing nightlights placed there just for him.',
      '💤 Goodnight:\nOllie tucks his head comfortably beneath his wing. The night is safe, the night is kind. Sweet dreams, and sleep tight.',
    ],
  },
];

export const BUNDLED_CATALOG: Catalog = {
  videos: BUNDLED_VIDEOS,
  sections: [
    { id: ALL_SECTION_ID, title: 'All Toons', kind: 'all', videoIds: BUNDLED_VIDEOS.map((v) => v.videoId) },
    { id: 'bundled-rhymes', title: 'Rhymes', kind: 'playlist', videoIds: [BUNDLED_VIDEOS[0].videoId] },
    { id: 'bundled-stories', title: 'Bedtime Stories', kind: 'playlist', videoIds: [BUNDLED_VIDEOS[1].videoId] },
  ],
};

/** "3 days ago" style label for the card subtitle. */
export function timeAgo(iso: string, now = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.floor((now - t) / 1000));
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, name] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
