'use client';

import {
  Disc3,
  ExternalLink,
  FileText,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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

type YoutubeMusicPlayerProps = {
  compact?: boolean;
};

type PanelTab = 'lyrics' | 'playlist';

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

function formatTime(seconds: number) {
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

function getDescriptionLines(track: YoutubeMusicTrack) {
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

export function YoutubeMusicPlayer({ compact = false }: YoutubeMusicPlayerProps) {
  const { isLoaded, settings } = useSiteSettings();
  const [tracks, setTracks] = useState<YoutubeMusicTrack[]>(fallbackTracks);
  const [activeId, setActiveId] = useState(fallbackTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [source, setSource] = useState('fallback');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<PanelTab>('lyrics');
  const [playerMessage, setPlayerMessage] = useState('播放器加载中');

  const playerRef = useRef<YoutubePlayer | null>(null);
  const playerStateRef = useRef<YoutubePlayerState | null>(null);
  const isPlayerReadyRef = useRef(false);
  const loadedVideoIdRef = useRef(fallbackTracks[0].videoId);
  const rawPlayerId = useId();
  const playerElementId = `youtube-player-${rawPlayerId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const activeTrack = useMemo(() => tracks.find((track) => track.id === activeId) ?? tracks[0], [activeId, tracks]);
  const activeIndex = Math.max(0, tracks.findIndex((track) => track.id === activeTrack.id));
  const playlistId = settings.music.youtubePlaylistId.trim();
  const descriptionLines = useMemo(() => getDescriptionLines(activeTrack), [activeTrack]);
  const progressMax = duration > 0 ? duration : 100;
  const progressValue = duration > 0 ? Math.min(currentTime, duration) : 0;

  function cueTrack(track: YoutubeMusicTrack) {
    const player = playerRef.current;
    if (!player || !isPlayerReadyRef.current) return;
    player.cueVideoById(track.videoId);
    loadedVideoIdRef.current = track.videoId;
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function playTrack(track: YoutubeMusicTrack) {
    const player = playerRef.current;
    if (!player || !isPlayerReadyRef.current) return;
    player.unMute();
    player.setVolume(90);
    player.loadVideoById(track.videoId);
    loadedVideoIdRef.current = track.videoId;
    setCurrentTime(0);
    setIsPlaying(true);
  }

  function selectTrack(track: YoutubeMusicTrack, shouldPlay = true) {
    setActiveId(track.id);
    setActiveTab(compact ? activeTab : 'lyrics');
    if (shouldPlay) {
      playTrack(track);
    } else {
      cueTrack(track);
    }
  }

  function selectByOffset(offset: number) {
    const nextIndex = (activeIndex + offset + tracks.length) % tracks.length;
    selectTrack(tracks[nextIndex], isPlaying || !compact);
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || !isPlayerReady) {
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
  }

  function seekTo(value: number) {
    const player = playerRef.current;
    if (!player || duration <= 0) return;
    player.seekTo(value, true);
    setCurrentTime(value);
  }

  useEffect(() => {
    if (!isLoaded) return undefined;

    let cancelled = false;
    const requestUrl = playlistId ? `/api/youtube-music?playlistId=${encodeURIComponent(playlistId)}` : '/api/youtube-music';

    fetch(requestUrl, { cache: 'no-store' })
      .then((response) => response.json() as Promise<YoutubeMusicResponse>)
      .then((data) => {
        if (cancelled || !Array.isArray(data.tracks) || data.tracks.length === 0) return;
        setTracks(data.tracks);
        setActiveId(data.tracks[0].id);
        setSource(data.source);
        cueTrack(data.tracks[0]);
      })
      .catch(() => {
        if (!cancelled) setSource('fallback');
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

  const playerFrame = (
    <div className={`overflow-hidden rounded-2xl border border-white/12 bg-slate-950/38 ${compact ? 'mt-5 aspect-video' : 'mt-6 aspect-video min-h-[260px]'}`}>
      <div className="h-full w-full" id={playerElementId} />
    </div>
  );

  if (compact) {
    return (
      <section className="glass-panel overflow-hidden p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15 shadow-[0_0_28px_rgba(99,102,241,0.28)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={activeTrack.title} className={`h-full w-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} src={activeTrack.cover} />
              <span className="absolute inset-0 m-auto h-5 w-5 rounded-full bg-slate-950/85 ring-2 ring-white/60" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 inline-flex rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">
                YouTube Music
              </div>
              <h2 className="truncate text-xl font-black text-white">{activeTrack.title}</h2>
              <p className="truncate text-sm font-semibold text-white/62">{activeTrack.artist}</p>
            </div>
          </div>
          <a
            aria-label="打开 YouTube Music"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 transition hover:bg-white/18 hover:text-white sm:flex"
            href={activeTrack.sourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink size={17} />
          </a>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/52">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : activeTrack.duration}</span>
          </div>
          <input
            aria-label="播放进度"
            className="w-full accent-indigo-400"
            max={progressMax}
            min={0}
            onChange={(event) => seekTo(Number(event.target.value))}
            step={1}
            type="range"
            value={progressValue}
          />

          <div className="mt-5 flex items-center justify-center gap-5">
            <button aria-label="上一首" className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(-1)} type="button">
              <SkipBack fill="currentColor" size={22} />
            </button>
            <button
              aria-label={isPlaying ? '暂停' : '播放'}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_28px_rgba(99,102,241,0.55)] transition hover:scale-105"
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play className="ml-0.5" fill="currentColor" size={24} />}
            </button>
            <button aria-label="下一首" className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(1)} type="button">
              <SkipForward fill="currentColor" size={22} />
            </button>
            <Volume2 className="text-white/35" size={20} />
          </div>
        </div>

        {playerFrame}

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/44">
          <Disc3 size={14} />
          {playerMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden p-0">
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,0.92fr)_minmax(380px,1.08fr)]">
        <div className="min-w-0 border-b border-white/10 p-6 md:p-8 xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15 shadow-[0_0_34px_rgba(99,102,241,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={activeTrack.title} className={`h-full w-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} src={activeTrack.cover} />
                <span className="absolute inset-0 m-auto h-6 w-6 rounded-full bg-slate-950/85 ring-2 ring-white/60" />
              </div>
              <div className="min-w-0">
                <div className="mb-1 inline-flex rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">
                  YouTube Music
                </div>
                <h2 className="truncate text-2xl font-black text-white">{activeTrack.title}</h2>
                <p className="truncate text-sm font-semibold text-white/62">{activeTrack.artist}</p>
              </div>
            </div>
            <a
              aria-label="打开 YouTube Music"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 transition hover:bg-white/18 hover:text-white"
              href={activeTrack.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink size={17} />
            </a>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/52">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : activeTrack.duration}</span>
            </div>
            <input
              aria-label="播放进度"
              className="w-full accent-indigo-400"
              max={progressMax}
              min={0}
              onChange={(event) => seekTo(Number(event.target.value))}
              step={1}
              type="range"
              value={progressValue}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            <button aria-label="上一首" className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(-1)} type="button">
              <SkipBack fill="currentColor" size={24} />
            </button>
            <button
              aria-label={isPlaying ? '暂停' : '播放'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_34px_rgba(99,102,241,0.58)] transition hover:scale-105"
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play className="ml-0.5" fill="currentColor" size={28} />}
            </button>
            <button aria-label="下一首" className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(1)} type="button">
              <SkipForward fill="currentColor" size={24} />
            </button>
            <Volume2 className="text-white/35" size={22} />
          </div>

          {playerFrame}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/44">
            <span>{playerMessage}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 uppercase tracking-wider">{source}</span>
          </div>
        </div>

        <aside className="min-w-0">
          <div className="flex justify-center border-b border-white/10 bg-white/6 p-5">
            <div className="inline-flex rounded-full border border-white/16 bg-slate-950/28 p-1">
              <button
                className={`inline-flex items-center gap-2 rounded-full px-9 py-2 text-xs font-black transition ${activeTab === 'lyrics' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/45 hover:text-white'}`}
                onClick={() => setActiveTab('lyrics')}
                type="button"
              >
                <FileText size={15} />
                歌词
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-full px-9 py-2 text-xs font-black transition ${activeTab === 'playlist' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/45 hover:text-white'}`}
                onClick={() => setActiveTab('playlist')}
                type="button"
              >
                <ListMusic size={15} />
                歌单
              </button>
            </div>
          </div>

          {activeTab === 'lyrics' ? (
            <div className="relative min-h-[620px] overflow-hidden p-6 md:p-8">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-900/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/45 to-transparent" />
              <div className="relative mx-auto flex max-h-[560px] max-w-2xl flex-col gap-4 overflow-auto pr-2 text-center">
                <div className="mb-4 flex justify-center">
                  <Disc3 className="animate-spin-slow text-indigo-300/35" size={46} />
                </div>
                <h3 className="text-2xl font-black text-indigo-100">{activeTrack.title}</h3>
                <p className="text-sm font-semibold text-white/48">{activeTrack.artist}</p>
                <div className="mt-4 space-y-3">
                  {descriptionLines.map((line, index) => (
                    <p
                      className={`rounded-2xl border border-white/8 bg-white/8 px-5 py-3 text-sm font-semibold leading-7 ${index === 0 ? 'text-white' : 'text-white/58'}`}
                      key={`${line}-${index}`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[620px] p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                <ListMusic size={17} />
                推荐合集
                <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/42">{source}</span>
              </div>
              <div className="max-h-[548px] space-y-3 overflow-auto pr-1">
                {tracks.map((track, index) => (
                  <button
                    className={`grid w-full grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border p-3 text-left transition ${
                      track.id === activeTrack.id ? 'border-indigo-300/60 bg-indigo-400/18' : 'border-white/10 bg-white/6 hover:bg-white/10'
                    }`}
                    key={track.id}
                    onClick={() => selectTrack(track, true)}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={track.title} className="h-12 w-12 rounded-xl object-cover" src={track.cover} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">{track.title}</span>
                      <span className="mt-1 block truncate text-xs font-semibold text-white/50">{track.artist}</span>
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-white/48">
                      {track.duration !== '--:--' ? track.duration : String(index + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
