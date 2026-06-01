'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export type YoutubeMusicTrack = {
  artist: string;
  cover: string;
  description: string;
  duration: string;
  id: string;
  sourceUrl: string;
  title: string;
  videoId: string;
};

type YoutubeMusicResponse = {
  playlistId: string;
  source: string;
  tracks: YoutubeMusicTrack[];
};

type YoutubePlayerState = {
  BUFFERING: number;
  CUED: number;
  ENDED: number;
  PAUSED: number;
  PLAYING: number;
  UNSTARTED: number;
};

type YoutubePlayer = {
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

type YoutubeEvent = {
  data: number;
  target: YoutubePlayer;
};

type YoutubeApi = {
  Player: new (
    elementId: string,
    options: {
      events: {
        onReady: (event: YoutubeEvent) => void;
        onStateChange: (event: YoutubeEvent) => void;
      };
      height: string;
      host?: string;
      playerVars: Record<string, string | number>;
      videoId: string;
      width: string;
    },
  ) => YoutubePlayer;
  PlayerState: YoutubePlayerState;
};

type YoutubeMusicContextValue = {
  activeIndex: number;
  activeTrack: YoutubeMusicTrack;
  currentTime: number;
  duration: number;
  isPlayerReady: boolean;
  isPlaying: boolean;
  playerMessage: string;
  seekTo: (value: number) => void;
  selectByOffset: (offset: number, shouldPlay?: boolean) => void;
  selectTrack: (track: YoutubeMusicTrack, shouldPlay?: boolean) => void;
  source: string;
  togglePlayback: () => void;
  tracks: YoutubeMusicTrack[];
};

declare global {
  interface Window {
    YT?: YoutubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const fallbackTracks: YoutubeMusicTrack[] = [
  {
    artist: 'YouTube Music',
    cover: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    description: 'Fallback playlist item. Add YouTube Data API credentials to load your own playlist.',
    duration: 'LIVE',
    id: 'lofi-radio',
    sourceUrl: 'https://music.youtube.com/watch?v=5qap5aO4i9A',
    title: 'lofi hip hop radio',
    videoId: '5qap5aO4i9A',
  },
];

const YoutubeMusicContext = createContext<YoutubeMusicContextValue | null>(null);

let youtubeApiPromise: Promise<YoutubeApi> | null = null;

function loadYoutubeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube player only runs in the browser.'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YoutubeApi>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube iframe API loaded without Player.'));
      }
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load YouTube iframe API.'));
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const rounded = Math.floor(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const restSeconds = rounded % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
}

export function getDescriptionLines(track: YoutubeMusicTrack) {
  const description = track.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^https?:\/\//i.test(line))
    .filter((line) => !/^#/.test(line))
    .slice(0, 18);

  if (description.length > 0) return description;

  return [
    'YouTube Data API 没有提供歌词字段。',
    '这里会优先显示视频描述；如果视频描述里有歌词，就会在这里出现。',
    `当前曲目：${track.title}`,
  ];
}

export function PersistentYoutubeMusicProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, settings } = useSiteSettings();
  const [tracks, setTracks] = useState<YoutubeMusicTrack[]>(fallbackTracks);
  const [activeId, setActiveId] = useState(fallbackTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [source, setSource] = useState('fallback');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerMessage, setPlayerMessage] = useState('播放器加载中');

  const playerRef = useRef<YoutubePlayer | null>(null);
  const playerStateRef = useRef<YoutubePlayerState | null>(null);
  const isPlayerReadyRef = useRef(false);
  const loadedVideoIdRef = useRef(fallbackTracks[0].videoId);
  const rawPlayerId = useId();
  const playerElementId = `persistent-youtube-player-${rawPlayerId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const activeTrack = useMemo(() => tracks.find((track) => track.id === activeId) ?? tracks[0], [activeId, tracks]);
  const activeIndex = Math.max(0, tracks.findIndex((track) => track.id === activeTrack.id));
  const playlistId = settings.music.youtubePlaylistId.trim();

  const cueTrack = useCallback((track: YoutubeMusicTrack) => {
    const player = playerRef.current;
    if (!player || !isPlayerReadyRef.current) return;
    player.cueVideoById(track.videoId);
    loadedVideoIdRef.current = track.videoId;
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const playTrack = useCallback((track: YoutubeMusicTrack) => {
    const player = playerRef.current;
    if (!player || !isPlayerReadyRef.current) return;
    player.unMute();
    player.setVolume(90);
    player.loadVideoById(track.videoId);
    loadedVideoIdRef.current = track.videoId;
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const selectTrack = useCallback(
    (track: YoutubeMusicTrack, shouldPlay = true) => {
      setActiveId(track.id);
      if (shouldPlay) {
        playTrack(track);
      } else {
        cueTrack(track);
      }
    },
    [cueTrack, playTrack],
  );

  const selectByOffset = useCallback(
    (offset: number, shouldPlay = isPlaying) => {
      if (tracks.length === 0) return;
      const nextIndex = (activeIndex + offset + tracks.length) % tracks.length;
      selectTrack(tracks[nextIndex], shouldPlay);
    },
    [activeIndex, isPlaying, selectTrack, tracks],
  );

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReadyRef.current) {
      setPlayerMessage('播放器还在加载，请稍等一下。');
      return;
    }

    player.unMute();
    player.setVolume(90);

    if (isPlaying) {
      player.pauseVideo();
      setIsPlaying(false);
    } else {
      player.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seekTo = useCallback(
    (value: number) => {
      const player = playerRef.current;
      if (!player || duration <= 0) return;
      player.seekTo(value, true);
      setCurrentTime(value);
    },
    [duration],
  );

  useEffect(() => {
    if (!isLoaded) return undefined;

    let cancelled = false;
    const requestUrl = playlistId ? `/api/youtube-music?playlistId=${encodeURIComponent(playlistId)}` : '/api/youtube-music';

    fetch(requestUrl, { cache: 'no-store' })
      .then((response) => response.json() as Promise<YoutubeMusicResponse>)
      .then((data) => {
        if (cancelled || !Array.isArray(data.tracks) || data.tracks.length === 0) return;
        setTracks(data.tracks);
        setActiveId((currentId) => (data.tracks.some((track) => track.id === currentId) ? currentId : data.tracks[0].id));
        setSource(data.source);
      })
      .catch(() => {
        if (!cancelled) {
          setSource('fallback');
          setPlayerMessage('歌单读取失败，已保留备用播放列表。');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, playlistId]);

  useEffect(() => {
    if (!activeTrack.videoId || playerRef.current) return undefined;

    let disposed = false;

    loadYoutubeApi()
      .then((youtubeApi) => {
        if (disposed || playerRef.current) return;
        playerStateRef.current = youtubeApi.PlayerState;
        playerRef.current = new youtubeApi.Player(playerElementId, {
          height: '100%',
          playerVars: {
            controls: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          videoId: activeTrack.videoId,
          width: '100%',
          events: {
            onReady: (event) => {
              event.target.unMute();
              event.target.setVolume(90);
              isPlayerReadyRef.current = true;
              loadedVideoIdRef.current = activeTrack.videoId;
              setIsPlayerReady(true);
              setDuration(event.target.getDuration() || 0);
              setPlayerMessage('播放器已就绪，点击播放会有声音。');
            },
            onStateChange: (event) => {
              const playerState = playerStateRef.current;
              if (!playerState) return;
              if (event.data === playerState.PLAYING) {
                setIsPlaying(true);
              }
              if ([playerState.PAUSED, playerState.CUED, playerState.ENDED].includes(event.data)) {
                setIsPlaying(false);
              }
            },
          },
        });
      })
      .catch(() => {
        setPlayerMessage('YouTube 播放器加载失败，请刷新页面重试。');
      });

    return () => {
      disposed = true;
    };
  }, [activeTrack.videoId, playerElementId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || loadedVideoIdRef.current === activeTrack.videoId) return;

    if (isPlaying) {
      player.loadVideoById(activeTrack.videoId);
    } else {
      player.cueVideoById(activeTrack.videoId);
    }

    loadedVideoIdRef.current = activeTrack.videoId;
    setCurrentTime(0);
  }, [activeTrack.videoId, isPlayerReady, isPlaying]);

  useEffect(() => {
    if (!isPlayerReady) return undefined;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 800);

    return () => window.clearInterval(timer);
  }, [isPlayerReady]);

  useEffect(
    () => () => {
      isPlayerReadyRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    },
    [],
  );

  const value = useMemo(
    () => ({
      activeIndex,
      activeTrack,
      currentTime,
      duration,
      isPlayerReady,
      isPlaying,
      playerMessage,
      seekTo,
      selectByOffset,
      selectTrack,
      source,
      togglePlayback,
      tracks,
    }),
    [activeIndex, activeTrack, currentTime, duration, isPlayerReady, isPlaying, playerMessage, seekTo, selectByOffset, selectTrack, source, togglePlayback, tracks],
  );

  return (
    <YoutubeMusicContext.Provider value={value}>
      {children}
      <div aria-hidden="true" className="pointer-events-none fixed -left-[9999px] top-0 h-[240px] w-[320px] overflow-hidden opacity-0">
        <div className="h-full w-full" id={playerElementId} />
      </div>
    </YoutubeMusicContext.Provider>
  );
}

export function useYoutubeMusic() {
  const context = useContext(YoutubeMusicContext);
  if (!context) {
    throw new Error('useYoutubeMusic must be used within PersistentYoutubeMusicProvider.');
  }
  return context;
}
