'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Compass,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { navigationBookmarks, type NavigationBookmark } from '@/data/site-data';

const NAVIGATION_STORAGE_KEY = 'my-home:website-navigation:v1';

type BookmarkForm = Omit<NavigationBookmark, 'id'>;

const emptyForm: BookmarkForm = {
  avatar: '',
  color: '#10b981',
  description: '',
  href: '',
  name: '',
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function createId() {
  return `bookmark-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getHostLabel(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

function getFaviconUrl(value: string) {
  const href = normalizeUrl(value);
  if (!href) return '';
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(href)}`;
}

function swapItems(items: NavigationBookmark[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return items;

  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export function WebsiteNavigationManager() {
  const [bookmarks, setBookmarks] = useState<NavigationBookmark[]>(navigationBookmarks);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookmarkForm>(emptyForm);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(NAVIGATION_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed.filter((item): item is NavigationBookmark => Boolean(item?.id && item?.name && item?.href)));
        }
      } catch {
        setBookmarks(navigationBookmarks);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const filteredBookmarks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return bookmarks;

    return bookmarks.filter((bookmark) =>
      `${bookmark.name} ${bookmark.description} ${bookmark.href}`.toLowerCase().includes(normalizedQuery),
    );
  }, [bookmarks, query]);

  function persist(nextBookmarks: NavigationBookmark[]) {
    setBookmarks(nextBookmarks);
    window.localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(nextBookmarks));
  }

  function updateForm<Key extends keyof BookmarkForm>(key: Key, value: BookmarkForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function submitBookmark() {
    const name = form.name.trim();
    const href = normalizeUrl(form.href);
    if (!name || !href) return;

    const nextBookmark: NavigationBookmark = {
      avatar: form.avatar.trim() || getFaviconUrl(href),
      color: form.color || '#10b981',
      description: form.description.trim() || getHostLabel(href),
      href,
      id: editingId ?? createId(),
      name,
    };

    if (editingId) {
      persist(bookmarks.map((bookmark) => (bookmark.id === editingId ? nextBookmark : bookmark)));
    } else {
      persist([nextBookmark, ...bookmarks]);
    }

    resetForm();
  }

  function editBookmark(bookmark: NavigationBookmark) {
    setEditingId(bookmark.id);
    setForm({
      avatar: bookmark.avatar,
      color: bookmark.color,
      description: bookmark.description,
      href: bookmark.href,
      name: bookmark.name,
    });
  }

  function deleteBookmark(id: string) {
    const target = bookmarks.find((bookmark) => bookmark.id === id);
    if (!target) return;
    if (!window.confirm(`删除「${target.name}」？此操作只会删除当前浏览器里的本地导航。`)) return;

    persist(bookmarks.filter((bookmark) => bookmark.id !== id));
    if (editingId === id) resetForm();
  }

  function moveBookmark(id: string, direction: -1 | 1) {
    persist(swapItems(bookmarks, id, direction));
  }

  function restoreDefaults() {
    if (!window.confirm('恢复默认网站导航？当前浏览器里的自定义排序和条目会被覆盖。')) return;
    persist(navigationBookmarks);
    resetForm();
  }

  function fetchIconFromLink() {
    const nextAvatar = getFaviconUrl(form.href);
    if (!nextAvatar) return;
    updateForm('avatar', nextAvatar);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <Link className="adaptive-muted adaptive-hover inline-flex items-center gap-2 text-sm" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="adaptive-border mt-8 flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-white/10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="adaptive-text text-5xl font-semibold tracking-normal md:text-6xl">网站导航</h1>
          <p className="adaptive-muted mt-4 max-w-2xl text-lg leading-8">
            像书签一样整理常用网站，支持新增、搜索、编辑、删除和移动排序。
          </p>
        </div>
        <Compass aria-hidden="true" className="adaptive-icon" size={42} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 text-zinc-950 shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{editingId ? '编辑导航' : '新增导航'}</h2>
            {editingId && (
              <button className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10" onClick={resetForm} type="button">
                取消
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">名称</span>
              <input
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder="例如 GitHub"
                value={form.name}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">链接</span>
              <input
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                onChange={(event) => updateForm('href', event.target.value)}
                placeholder="https://example.com"
                value={form.href}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">描述</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="这个网站用来做什么"
                value={form.description}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">图标 URL</span>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                  onChange={(event) => updateForm('avatar', event.target.value)}
                  placeholder="留空或自动获取 favicon"
                  value={form.avatar}
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                  disabled={!form.href.trim()}
                  onClick={fetchIconFromLink}
                  type="button"
                >
                  <Wand2 size={15} />
                  自动获取
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">强调色</span>
              <input
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) => updateForm('color', event.target.value)}
                type="color"
                value={form.color}
              />
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!form.name.trim() || !form.href.trim()}
              onClick={submitBookmark}
              type="button"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? '保存修改' : '新增导航'}
            </button>
            <button
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-3 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
              onClick={restoreDefaults}
              title="恢复默认"
              type="button"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </section>

        <section>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-950 outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索名称、描述或网址..."
              value={query}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredBookmarks.map((bookmark) => (
              <article
                className="group rounded-lg border border-zinc-200 bg-white p-4 text-zinc-950 transition hover:-translate-y-0.5 hover:border-emerald-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
                key={bookmark.id}
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={bookmark.name} className="h-12 w-12 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-white/10" src={bookmark.avatar} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">{bookmark.name}</h2>
                    <div className="mt-1 h-1 w-16 rounded-full" style={{ backgroundColor: bookmark.color }} />
                    <div className="mt-1 truncate text-xs text-zinc-400">{getHostLabel(bookmark.href)}</div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{bookmark.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <a
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    href={bookmark.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    访问
                    <ArrowUpRight aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={15} />
                  </a>
                  <button className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10" onClick={() => editBookmark(bookmark)} title="编辑" type="button">
                    <Pencil size={15} />
                  </button>
                  <button className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10" onClick={() => moveBookmark(bookmark.id, -1)} title="上移" type="button">
                    <ArrowUp size={15} />
                  </button>
                  <button className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10" onClick={() => moveBookmark(bookmark.id, 1)} title="下移" type="button">
                    <ArrowDown size={15} />
                  </button>
                  <button className="ml-auto rounded-lg border border-rose-200 p-1.5 text-rose-500 transition hover:bg-rose-50 dark:border-rose-300/20 dark:hover:bg-rose-300/10" onClick={() => deleteBookmark(bookmark.id)} title="删除" type="button">
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredBookmarks.length === 0 && (
            <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              没有找到匹配的网站导航。
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
