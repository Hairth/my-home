'use client';

import type { ReactNode } from 'react';
import {
  Download,
  Eye,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  ToggleLeft,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { RotatingHeroBackground } from '@/components/RotatingHeroBackground';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { mergeSiteSettings, normalizeImageLines, SETTINGS_STORAGE_KEY, type SiteSettings } from '@/lib/site-settings';

function Panel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">{icon}</div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'url' | 'email';
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</span>
      <input
        className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-lg border border-zinc-200 px-4 py-3 dark:border-white/10">
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</span>
      <input
        checked={checked}
        className="h-5 w-5 accent-cyan-600"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

export function SettingsClient() {
  const { settings, setSettings, resetSettings } = useSiteSettings();
  const [status, setStatus] = useState('设置会自动保存到当前浏览器。');
  const [importText, setImportText] = useState('');

  const exportedJson = useMemo(() => JSON.stringify(settings, null, 2), [settings]);

  function updateProfile<Key extends keyof SiteSettings['profile']>(key: Key, value: SiteSettings['profile'][Key]) {
    setSettings((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value },
    }));
  }

  function updateWelcome<Key extends keyof SiteSettings['welcome']>(key: Key, value: SiteSettings['welcome'][Key]) {
    setSettings((current) => ({
      ...current,
      welcome: { ...current.welcome, [key]: value },
    }));
  }

  function updateBackground<Key extends keyof SiteSettings['background']>(key: Key, value: SiteSettings['background'][Key]) {
    setSettings((current) => ({
      ...current,
      background: { ...current.background, [key]: value },
    }));
  }

  function updateModule<Key extends keyof SiteSettings['modules']>(key: Key, value: boolean) {
    setSettings((current) => ({
      ...current,
      modules: { ...current.modules, [key]: value },
    }));
  }

  async function copySettings() {
    await navigator.clipboard.writeText(exportedJson);
    setStatus('设置 JSON 已复制。');
  }

  function downloadSettings() {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'my-home-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('设置文件已导出。');
  }

  function importSettings() {
    try {
      const nextSettings = mergeSiteSettings(JSON.parse(importText));
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
      setSettings(nextSettings);
      setImportText('');
      setStatus('设置 JSON 已导入。');
    } catch {
      setStatus('导入失败，请检查 JSON 格式。');
    }
  }

  function resetWelcome() {
    window.sessionStorage.removeItem('my-home:welcome-seen');
    setStatus('欢迎页状态已重置，刷新首页后会再次显示。');
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <div className="mb-10 flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">设置</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            欢迎词、图片轮换 API、主页模块和个人资料都会实时写入本地配置。
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
          {status}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <div className="space-y-6">
          <Panel icon={<User size={20} />} title="基础资料">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="站点标题" onChange={(value) => updateProfile('siteTitle', value)} value={settings.profile.siteTitle} />
              <Field label="导航标题" onChange={(value) => updateProfile('navTitle', value)} value={settings.profile.navTitle} />
              <Field label="作者名称" onChange={(value) => updateProfile('authorName', value)} value={settings.profile.authorName} />
              <Field label="位置" onChange={(value) => updateProfile('location', value)} value={settings.profile.location} />
              <Field label="邮箱" onChange={(value) => updateProfile('email', value)} type="email" value={settings.profile.email} />
              <Field label="GitHub" onChange={(value) => updateProfile('githubUrl', value)} type="url" value={settings.profile.githubUrl} />
            </div>
            <Field label="头像 URL" onChange={(value) => updateProfile('avatarUrl', value)} type="url" value={settings.profile.avatarUrl} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">简介</span>
              <textarea
                className="min-h-28 w-full rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-7 placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) => updateProfile('bio', event.target.value)}
                value={settings.profile.bio}
              />
            </label>
            <Field label="主页标语" onChange={(value) => updateProfile('tagline', value)} value={settings.profile.tagline} />
          </Panel>

          <Panel icon={<Sparkles size={20} />} title="欢迎页">
            <Toggle checked={settings.welcome.enabled} label="启用欢迎页" onChange={(checked) => updateWelcome('enabled', checked)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="欢迎标题" onChange={(value) => updateWelcome('title', value)} value={settings.welcome.title} />
              <Field label="按钮文字" onChange={(value) => updateWelcome('enterLabel', value)} value={settings.welcome.enterLabel} />
            </div>
            <Field label="欢迎副标题" onChange={(value) => updateWelcome('subtitle', value)} value={settings.welcome.subtitle} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="一言 API" onChange={(value) => updateWelcome('quoteApiUrl', value)} type="url" value={settings.welcome.quoteApiUrl} />
              <Field
                label="自动关闭秒数"
                onChange={(value) => updateWelcome('autoCloseSeconds', Math.max(0, Number(value) || 0))}
                type="number"
                value={settings.welcome.autoCloseSeconds}
              />
            </div>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
              onClick={resetWelcome}
              type="button"
            >
              <Eye aria-hidden="true" size={17} />
              重置欢迎页显示
            </button>
          </Panel>

          <Panel icon={<ImageIcon size={20} />} title="图片轮换">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                className={`h-11 rounded-lg border text-sm font-semibold transition ${
                  settings.background.mode === 'preset'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200'
                    : 'border-zinc-200 dark:border-white/10'
                }`}
                onClick={() => updateBackground('mode', 'preset')}
                type="button"
              >
                预设图库
              </button>
              <button
                className={`h-11 rounded-lg border text-sm font-semibold transition ${
                  settings.background.mode === 'api'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200'
                    : 'border-zinc-200 dark:border-white/10'
                }`}
                onClick={() => updateBackground('mode', 'api')}
                type="button"
              >
                图片 API
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <Field label="图片 API 地址" onChange={(value) => updateBackground('imageApiUrl', value)} type="url" value={settings.background.imageApiUrl} />
              <Field
                label="轮换间隔"
                onChange={(value) => updateBackground('intervalSeconds', Math.max(3, Number(value) || 10))}
                type="number"
                value={settings.background.intervalSeconds}
              />
            </div>
            <label className="block rounded-lg border border-zinc-200 p-4 dark:border-white/10">
              <span className="mb-3 flex items-center justify-between gap-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                <span>遮罩透明度</span>
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{settings.background.overlayOpacity}%</span>
              </span>
              <input
                className="w-full accent-cyan-600"
                max={100}
                min={0}
                onChange={(event) => updateBackground('overlayOpacity', Number(event.target.value))}
                step={5}
                type="range"
                value={settings.background.overlayOpacity}
              />
              <span className="mt-2 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                数值越低，欢迎页和主页背景图越清晰；数值越高，文字对比越强。
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">预设图片 URL</span>
              <textarea
                className="min-h-36 w-full rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs leading-6 placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) => updateBackground('images', normalizeImageLines(event.target.value))}
                value={settings.background.images.join('\n')}
              />
            </label>
          </Panel>

          <Panel icon={<ToggleLeft size={20} />} title="首页模块">
            <div className="grid gap-3 md:grid-cols-2">
              <Toggle checked={settings.modules.dashboard} label="功能面板" onChange={(checked) => updateModule('dashboard', checked)} />
              <Toggle checked={settings.modules.moments} label="瞬间" onChange={(checked) => updateModule('moments', checked)} />
              <Toggle checked={settings.modules.projects} label="项目" onChange={(checked) => updateModule('projects', checked)} />
              <Toggle checked={settings.modules.friends} label="友链" onChange={(checked) => updateModule('friends', checked)} />
              <Toggle checked={settings.modules.music} label="音乐" onChange={(checked) => updateModule('music', checked)} />
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Settings2 size={20} />
              </div>
              <h2 className="text-xl font-semibold">实时预览</h2>
            </div>
            <div className="relative min-h-80 overflow-hidden rounded-lg bg-zinc-950 text-white">
              <RotatingHeroBackground intensity="light" />
              <div className="relative z-10 flex min-h-80 flex-col justify-end p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/25 bg-white/12 backdrop-blur">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-4xl font-semibold leading-none">{settings.welcome.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/74">{settings.welcome.subtitle}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-cyan-100"
                onClick={copySettings}
                type="button"
              >
                <Save aria-hidden="true" size={17} />
                复制 JSON
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
                onClick={downloadSettings}
                type="button"
              >
                <Download aria-hidden="true" size={17} />
                导出设置
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-rose-400 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-300 dark:hover:text-rose-200"
                onClick={() => {
                  resetSettings();
                  setStatus('设置已恢复默认值。');
                }}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={17} />
                恢复默认
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <Upload aria-hidden="true" size={20} />
              <h2 className="text-xl font-semibold">导入</h2>
            </div>
            <textarea
              className="min-h-40 w-full rounded-lg border border-zinc-200 bg-white p-4 font-mono text-xs leading-6 placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
              onChange={(event) => setImportText(event.target.value)}
              placeholder="粘贴设置 JSON"
              value={importText}
            />
            <div className="mt-3 flex gap-3">
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!importText.trim()}
                onClick={importSettings}
                type="button"
              >
                <Upload aria-hidden="true" size={16} />
                导入
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-zinc-400 dark:border-white/10"
                onClick={() => setImportText('')}
                type="button"
              >
                <Trash2 aria-hidden="true" size={16} />
                清空
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
