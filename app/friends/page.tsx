import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Users } from 'lucide-react';
import { friends } from '@/data/site-data';

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
      <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-700 dark:hover:text-cyan-200" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="mt-8 flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-white/10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">友链</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">参考项目、同步仓库和后续可以继续扩展的链接墙。</p>
        </div>
        <Users aria-hidden="true" className="text-emerald-600 dark:text-emerald-300" size={42} />
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <a
            className="group block rounded-lg border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-emerald-400 dark:border-white/10 dark:bg-zinc-900"
            href={friend.href}
            key={friend.id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={friend.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-zinc-200 dark:ring-white/10" src={friend.avatar} />
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-semibold">{friend.name}</h2>
                <div className="mt-1 h-1.5 w-20 rounded-full" style={{ backgroundColor: friend.color }} />
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{friend.description}</p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
              访问
              <ArrowUpRight aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={17} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
