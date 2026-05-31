import type { Metadata } from 'next';
import { AboutClient } from '@/components/AboutClient';

export const metadata: Metadata = {
  title: '关于我',
};

export default function AboutPage() {
  return <AboutClient />;
}
