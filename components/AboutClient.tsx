'use client';

import Link from 'next/link';
import { ArrowLeft, Code2, Mail, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export function AboutClient() {
  const { settings } = useSiteSettings();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <Link className="adaptive-muted adaptive-hover inline-flex items-center gap-2 text-sm" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <section className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={settings.profile.authorName}
            className="aspect-square w-full rounded-lg object-cover"
            src={settings.profile.avatarUrl}
          />
          <div className="mt-6 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
            <a className="flex items-center gap-3 transition hover:text-cyan-700 dark:hover:text-cyan-200" href={settings.profile.githubUrl}>
              <Code2 aria-hidden="true" size={17} />
              GitHub
            </a>
            <a className="flex items-center gap-3 transition hover:text-cyan-700 dark:hover:text-cyan-200" href={`mailto:${settings.profile.email}`}>
              <Mail aria-hidden="true" size={17} />
              {settings.profile.email}
            </a>
            <div className="flex items-center gap-3">
              <MapPin aria-hidden="true" size={17} />
              {settings.profile.location}
            </div>
          </div>
        </div>

        <div>
          <h1 className="adaptive-text text-5xl font-semibold leading-none tracking-normal md:text-7xl">{settings.profile.authorName}</h1>
          <p className="adaptive-muted mt-4 text-2xl leading-9">{settings.profile.tagline}</p>

          <div className="adaptive-muted mt-10 space-y-6 text-base leading-8">
            <p>{settings.profile.bio}</p>
            <p>
              这里会同时承担个人主页、博客索引、项目展板、网站导航和设置中心。它参考了 XinghuisamaBlogs 的动态页面组织方式，也保留了
              jinghuashang 欢迎页的随机图与一言氛围。
            </p>
            <p>后续可以继续把文档内容接入 MDX、把设置同步到后端，或者把图片 API 扩展成多源轮换。</p>
          </div>

          <div className="adaptive-border adaptive-subtle mt-12 border-t border-zinc-200 pt-8 text-xs dark:border-white/10">最后更新：2026-06-01</div>
        </div>
      </section>
    </div>
  );
}
