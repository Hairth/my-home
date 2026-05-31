import { redirect } from 'next/navigation';

export default async function WritingSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/documents?doc=${encodeURIComponent(slug)}`);
}
