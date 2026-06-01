import { NextResponse } from 'next/server';

type Track = {
  artist: string;
  cover: string;
  description: string;
  duration: string;
  id: string;
  sourceUrl: string;
  title: string;
  videoId: string;
};

const fallbackTracks: Track[] = [
  {
    artist: 'Lofi Girl',
    cover: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    description: 'Fallback playlist item. Add YouTube Data API credentials to load your own playlist.',
    duration: 'LIVE',
    id: '5qap5aO4i9A',
    sourceUrl: 'https://music.youtube.com/watch?v=5qap5aO4i9A',
    title: 'lofi hip hop radio',
    videoId: '5qap5aO4i9A',
  },
  {
    artist: 'YouTube Music',
    cover: 'https://i.ytimg.com/vi/lTRiuFIWV54/hqdefault.jpg',
    description: 'Fallback playlist item. Add YouTube Data API credentials to load your own playlist.',
    duration: 'LIVE',
    id: 'lTRiuFIWV54',
    sourceUrl: 'https://music.youtube.com/watch?v=lTRiuFIWV54',
    title: 'beats to relax / study to',
    videoId: 'lTRiuFIWV54',
  },
  {
    artist: 'YouTube Music',
    cover: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
    description: 'Fallback playlist item. Add YouTube Data API credentials to load your own playlist.',
    duration: '3:54',
    id: 'DWcJFNfaw9c',
    sourceUrl: 'https://music.youtube.com/watch?v=DWcJFNfaw9c',
    title: 'night drive selection',
    videoId: 'DWcJFNfaw9c',
  },
];

const PLAYLIST_PAGE_SIZE = 50;
const VIDEO_DETAIL_BATCH_SIZE = 50;
const DEFAULT_MAX_TRACKS = 200;

function getMaxTracks() {
  const rawValue = Number(process.env.YOUTUBE_MUSIC_MAX_TRACKS);
  return Number.isFinite(rawValue) && rawValue > 0 ? Math.floor(rawValue) : DEFAULT_MAX_TRACKS;
}

function formatIsoDuration(value?: string) {
  if (!value) return '--:--';
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return '--:--';

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function toTrack(
  item: {
    contentDetails?: { videoId?: string };
    id?: string;
    snippet?: {
      description?: string;
      title?: string;
      videoOwnerChannelTitle?: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
  },
  playlistId: string,
): Track | null {
  const videoId = item.contentDetails?.videoId;
  const title = item.snippet?.title;
  if (!videoId || !title) return null;

  return {
    artist: item.snippet?.videoOwnerChannelTitle ?? 'YouTube Music',
    cover: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    description: item.snippet?.description ?? '',
    duration: '--:--',
    id: item.id ?? videoId,
    sourceUrl: `https://music.youtube.com/watch?v=${videoId}&list=${playlistId}`,
    title,
    videoId,
  };
}

async function fetchPlaylistTracks(playlistId: string, apiKey: string) {
  const tracks: Track[] = [];
  const maxTracks = getMaxTracks();
  let pageToken = '';

  while (tracks.length < maxTracks) {
    const params = new URLSearchParams({
      key: apiKey,
      maxResults: String(Math.min(PLAYLIST_PAGE_SIZE, maxTracks - tracks.length)),
      part: 'snippet,contentDetails',
      playlistId,
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`, { next: { revalidate: 3600 } });

    if (!response.ok) {
      break;
    }

    const data = (await response.json()) as {
      items?: Parameters<typeof toTrack>[0][];
      nextPageToken?: string;
    };

    for (const item of data.items ?? []) {
      const track = toTrack(item, playlistId);
      if (track) {
        tracks.push(track);
      }
    }

    if (!data.nextPageToken) {
      break;
    }

    pageToken = data.nextPageToken;
  }

  return tracks;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchVideoDetails(tracks: Track[], apiKey: string) {
  const videoDetails = new Map<string, { description: string; duration: string }>();

  for (const videoIdBatch of chunk(
    tracks.map((track) => track.videoId),
    VIDEO_DETAIL_BATCH_SIZE,
  )) {
    const params = new URLSearchParams({
      id: videoIdBatch.join(','),
      key: apiKey,
      part: 'contentDetails,snippet',
    });

    const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, { next: { revalidate: 3600 } });

    if (!videoResponse.ok) {
      continue;
    }

    const videoData = (await videoResponse.json()) as {
      items?: Array<{
        contentDetails?: { duration?: string };
        id?: string;
        snippet?: { description?: string };
      }>;
    };

    for (const item of videoData.items ?? []) {
      if (!item.id) continue;

      videoDetails.set(item.id, {
        description: item.snippet?.description ?? '',
        duration: formatIsoDuration(item.contentDetails?.duration),
      });
    }
  }

  return videoDetails;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get('playlistId') ?? process.env.YOUTUBE_MUSIC_PLAYLIST_ID ?? '';
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (playlistId && apiKey) {
    try {
      const tracks = await fetchPlaylistTracks(playlistId, apiKey);

      if (tracks.length > 0) {
        const videoDetails = await fetchVideoDetails(tracks, apiKey);

        return NextResponse.json({
          maxTracks: getMaxTracks(),
          playlistId,
          source: 'youtube-data-api',
          tracks: tracks.map((track) => {
            const details = videoDetails.get(track.videoId);
            return {
              ...track,
              description: details?.description || track.description,
              duration: details?.duration ?? track.duration,
            };
          }),
        });
      }
    } catch {
      // Fall back to the curated client-safe list below.
    }
  }

  return NextResponse.json({
    playlistId: playlistId || 'fallback-recommendations',
    source: playlistId && !apiKey ? 'fallback-missing-youtube-api-key' : 'fallback',
    tracks: fallbackTracks,
  });
}
