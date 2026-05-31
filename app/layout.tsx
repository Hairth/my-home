import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from '@/components/settings/SettingsProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { WelcomeSplash } from '@/components/WelcomeSplash';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Hairth · 星火',
    template: '%s | Hairth · 星火',
  },
  description: 'Hairth 的数字花园。记录思考、分享生活、构建未来。技术笔记、生活随笔与瞬间感悟。',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Hairth · 星火',
    description: '记录思考，分享生活，构建未来',
    images: [{ url: '/og.png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f6f8fb] text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
        <SettingsProvider>
          <WelcomeSplash />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </SettingsProvider>
      </body>
    </html>
  );
}
