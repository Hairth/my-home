import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const notoSerif = Noto_Serif_SC({
  variable: '--font-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
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
    <html lang=\"zh-CN\" className={\\ \ \ h-full antialiased\ } suppressHydrationWarning>
      <body className=\"min-h-full flex flex-col bg-[#fafaf9] text-stone-900 dark:bg-[#0a0a0a] dark:text-stone-100\">
        <SiteHeader />
        <main className=\"flex-1\">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
