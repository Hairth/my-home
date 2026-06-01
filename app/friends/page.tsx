import type { Metadata } from 'next';
import { WebsiteNavigationManager } from '@/components/navigation/WebsiteNavigationManager';

export const metadata: Metadata = {
  title: '网站导航',
};

export default function FriendsPage() {
  return <WebsiteNavigationManager />;
}
