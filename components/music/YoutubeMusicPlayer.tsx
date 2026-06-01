'use client';

import { Disc3, ExternalLink, FileText, ListMusic, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatTime, getDescriptionLines, useYoutubeMusic } from '@/components/music/YoutubeMusicProvider';
import type { YoutubeMusicTrack } from '@/components/music/YoutubeMusicProvider';

export type { YoutubeMusicTrack } from '@/components/music/YoutubeMusicProvider';

type YoutubeMusicPlayerProps = {
  compact?: boolean;
};

type PanelTab = 'lyrics' | 'playlist';

export function YoutubeMusicPlayer({ compact = false }: YoutubeMusicPlayerProps) {
  const {
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
  } = useYoutubeMusic();
  const [activeTab, setActiveTab] = useState<PanelTab>('lyrics');

  const descriptionLines = useMemo(() => getDescriptionLines(activeTrack), [activeTrack]);
  const progressMax = duration > 0 ? duration : 100;
  const progressValue = duration > 0 ? Math.min(currentTime, duration) : 0;

  function handleSelectTrack(track: YoutubeMusicTrack, shouldPlay = true) {
    selectTrack(track, shouldPlay);
    if (!compact) {
      setActiveTab('lyrics');
    }
  }

  function handleSelectByOffset(offset: number) {
    selectByOffset(offset, isPlaying || !compact);
  }

  const coverPanel = (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/12 bg-slate-950/38 p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-28 blur-md scale-110" src={activeTrack.cover} />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/62 via-indigo-950/38 to-slate-950/72" />
      <div className="relative flex min-h-[230px] flex-col items-center justify-center text-center">
        <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full border border-white/25 bg-white/10 p-1 shadow-[0_0_45px_rgba(99,102,241,0.35)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={activeTrack.title} className={`h-full w-full rounded-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} src={activeTrack.cover} />
          <span className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-slate-950/85 ring-2 ring-white/60" />
        </div>
        <div className="rounded-full border border-white/12 bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-100">
          Audio Mode
        </div>
        <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-white/62">已隐藏视频画面，只保留音乐播放控制。</p>
      </div>
    </div>
  );

  if (compact) {
    return (
      <section className="glass-panel overflow-hidden p-4 md:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15 shadow-[0_0_28px_rgba(99,102,241,0.28)] md:h-16 md:w-16">
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

        <div className="mt-4">
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

          <div className="mt-4 flex items-center justify-center gap-4">
            <button aria-label="上一首" className="text-white/70 transition hover:text-white" onClick={() => handleSelectByOffset(-1)} type="button">
              <SkipBack fill="currentColor" size={22} />
            </button>
            <button
              aria-label={isPlaying ? '暂停' : '播放'}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_28px_rgba(99,102,241,0.55)] transition hover:scale-105 md:h-14 md:w-14"
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play className="ml-0.5" fill="currentColor" size={24} />}
            </button>
            <button aria-label="下一首" className="text-white/70 transition hover:text-white" onClick={() => handleSelectByOffset(1)} type="button">
              <SkipForward fill="currentColor" size={22} />
            </button>
            <Volume2 className="text-white/35" size={20} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/44">
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
            <button aria-label="上一首" className="text-white/70 transition hover:text-white" onClick={() => handleSelectByOffset(-1)} type="button">
              <SkipBack fill="currentColor" size={24} />
            </button>
            <button
              aria-label={isPlaying ? '暂停' : '播放'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_34px_rgba(99,102,241,0.58)] transition hover:scale-105"
              disabled={!isPlayerReady}
              onClick={togglePlayback}
              type="button"
            >
              {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play className="ml-0.5" fill="currentColor" size={28} />}
            </button>
            <button aria-label="下一首" className="text-white/70 transition hover:text-white" onClick={() => handleSelectByOffset(1)} type="button">
              <SkipForward fill="currentColor" size={24} />
            </button>
            <Volume2 className="text-white/35" size={22} />
          </div>

          {coverPanel}

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
                    onClick={() => handleSelectTrack(track, true)}
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
