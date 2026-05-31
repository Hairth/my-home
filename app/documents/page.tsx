import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DocumentManager } from '@/components/documents/DocumentManager';

export const metadata: Metadata = {
  title: '文档',
};

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">正在打开文档...</div>}>
      <DocumentManager />
    </Suspense>
  );
}
