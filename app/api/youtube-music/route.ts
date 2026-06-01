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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playlistId = url.searchParams.get('playlistId') ?? process.env.YOUTUBE_MUSIC_PLAYLIST_ID ?? '';
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (playlistId && apiKey) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=12&playlistId=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`,
        { next: { revalidate: 3600 } },
      );

      if (response.ok) {
        const data = (await response.json()) as {
          items?: Array<{
            contentDetails?: { videoId?: string };
            id?: string;
            snippet?: {
              description?: string;
              title?: string;
              videoOwnerChannelTitle?: string;
              thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
            };
          }>;
        };

        const tracks = (data.items ?? [])
          .map((item): Track | null => {
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
          })
          .filter((track): track is Track => Boolean(track));

        if (tracks.length > 0) {
          const videoIds = tracks.map((track) => track.videoId).join(',');
          const videoResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${encodeURIComponent(videoIds)}&key=${encodeURIComponent(apiKey)}`,
            { next: { revalidate: 3600 } },
          );

          if (videoResponse.ok) {
            const videoData = (await videoResponse.json()) as {
              items?: Array<{
                contentDetails?: { duration?: string };
                id?: string;
                snippet?: { description?: string };
              }>;
            };
            const videoDetails = new Map(
              (videoData.items ?? []).map((item) => [
                item.id,
                {
                  description: item.snippet?.description ?? '',
                  duration: formatIsoDuration(item.contentDetails?.duration),
                },
              ]),
            );

            return NextResponse.json({
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

          return NextResponse.json({ playlistId, source: 'youtube-data-api', tracks });
        }
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
