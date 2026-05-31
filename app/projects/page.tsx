'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, FolderKanban } from 'lucide-react';
import { useMemo, useState } from 'react';
import { projects } from '@/data/site-data';

export default function ProjectsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(projects.flatMap((project) => project.tags))), []);
  const visibleProjects = activeTag ? projects.filter((project) => project.tags.includes(activeTag)) : projects;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
      <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-700 dark:hover:text-cyan-200" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="mt-8 flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-white/10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">项目</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">像仪表盘一样整理正在构建的工具、站点和实验。</p>
        </div>
        <FolderKanban aria-hidden="true" className="text-violet-600 dark:text-violet-300" size={42} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
            !activeTag
              ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
              : 'border-zinc-200 hover:border-violet-400 dark:border-white/10 dark:hover:border-violet-300'
          }`}
          onClick={() => setActiveTag(null)}
          type="button"
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              activeTag === tag
                ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                : 'border-zinc-200 hover:border-violet-400 dark:border-white/10 dark:hover:border-violet-300'
            }`}
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <Link
            className="group flex min-h-72 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-violet-400 dark:border-white/10 dark:bg-zinc-900"
            href={project.href}
            key={project.id}
          >
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-600 text-xl font-semibold text-white">
                {project.icon}
              </div>
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{project.description}</p>
            </div>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700 dark:bg-violet-300/10 dark:text-violet-200" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <ArrowUpRight aria-hidden="true" className="shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
