'use client';

import { Disc3, ExternalLink, ListMusic, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type YoutubeMusicTrack = {
  artist: string;
  cover: string;
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

const fallbackTracks: YoutubeMusicTrack[] = [
  {
    artist: 'YouTube Music',
    cover: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
    duration: 'LIVE',
    id: 'lofi-radio',
    sourceUrl: 'https://music.youtube.com/watch?v=5qap5aO4i9A',
    title: 'lofi hip hop radio',
    videoId: '5qap5aO4i9A',
  },
];

export function YoutubeMusicPlayer({ compact = false }: YoutubeMusicPlayerProps) {
  const [tracks, setTracks] = useState<YoutubeMusicTrack[]>(fallbackTracks);
  const [activeId, setActiveId] = useState(fallbackTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [source, setSource] = useState('fallback');

  const activeTrack = useMemo(() => tracks.find((track) => track.id === activeId) ?? tracks[0], [activeId, tracks]);
  const activeIndex = Math.max(0, tracks.findIndex((track) => track.id === activeTrack.id));

  useEffect(() => {
    let cancelled = false;

    fetch('/api/youtube-music', { cache: 'no-store' })
      .then((response) => response.json() as Promise<YoutubeMusicResponse>)
      .then((data) => {
        if (cancelled || !Array.isArray(data.tracks) || data.tracks.length === 0) return;
        setTracks(data.tracks);
        setActiveId(data.tracks[0].id);
        setSource(data.source);
      })
      .catch(() => {
        if (!cancelled) setSource('fallback');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function selectByOffset(offset: number) {
    const nextIndex = (activeIndex + offset + tracks.length) % tracks.length;
    setActiveId(tracks[nextIndex].id);
    setIsPlaying(false);
  }

  return (
    <section className={`glass-panel overflow-hidden ${compact ? 'p-5' : 'p-6 md:p-8'}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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

      <div className={compact ? 'mt-6' : 'mt-8 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]'}>
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/52">
            <span>00:00</span>
            <span>{activeTrack.duration}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/18">
            <div className={`h-full rounded-full bg-indigo-400 ${isPlaying ? 'animate-progress-loop' : 'w-[14%]'}`} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-5">
            <button className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(-1)} type="button">
              <SkipBack fill="currentColor" size={22} />
            </button>
            <button
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_28px_rgba(99,102,241,0.55)] transition hover:scale-105"
              onClick={() => setIsPlaying((playing) => !playing)}
              type="button"
            >
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play className="ml-0.5" fill="currentColor" size={24} />}
            </button>
            <button className="text-white/70 transition hover:text-white" onClick={() => selectByOffset(1)} type="button">
              <SkipForward fill="currentColor" size={22} />
            </button>
            <Volume2 className="text-white/35" size={20} />
          </div>

          {!compact && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/28">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="h-48 w-full"
                src={`https://www.youtube-nocookie.com/embed/${activeTrack.videoId}?rel=0&modestbranding=1`}
                title={activeTrack.title}
              />
            </div>
          )}
        </div>

        {!compact && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/22 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <ListMusic size={17} />
              推荐合集
              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/42">{source}</span>
            </div>
            <div className="max-h-64 space-y-2 overflow-auto pr-1">
              {tracks.map((track) => (
                <button
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    track.id === activeTrack.id ? 'border-indigo-300/50 bg-indigo-400/16' : 'border-white/10 bg-white/6 hover:bg-white/10'
                  }`}
                  key={track.id}
                  onClick={() => {
                    setActiveId(track.id);
                    setIsPlaying(false);
                  }}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={track.title} className="h-10 w-10 rounded-lg object-cover" src={track.cover} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{track.title}</span>
                    <span className="block truncate text-xs text-white/50">{track.artist}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {compact && (
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/44">
          <Disc3 size={14} />
          推荐合集由站内 API 提供
        </div>
      )}
    </section>
  );
}
