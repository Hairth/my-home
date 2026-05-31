import { seedDocuments, type DocumentItem } from '@/data/site-data';

export const DOCUMENTS_STORAGE_KEY = 'my-home:documents:v1';

export const documentBackgrounds = [
  '#ffffff',
  '#f8fafc',
  '#f5f5f4',
  '#fff7ed',
  '#fefce8',
  '#ecfeff',
  '#eef2ff',
  '#faf5ff',
  '#18181b',
];

export function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || `doc-${Date.now()}`;
}

export function ensureUniqueSlug(baseSlug: string, documents: DocumentItem[], ignoreId?: string) {
  let slug = baseSlug;
  let index = 2;

  while (documents.some((document) => document.slug === slug && document.id !== ignoreId)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

export function estimateReadingTime(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const chineseCount = (content.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const minutes = Math.max(1, Math.ceil((wordCount + chineseCount / 2) / 220));
  return `${minutes} min`;
}

export function excerptFromMarkdown(content: string) {
  const cleanText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.replace(/^\[|\]\([^)]*\)$/g, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText.slice(0, 120) || '新的文档，还没有摘要。';
}

export function createDocumentFromContent(title: string, content: string, existingDocuments: DocumentItem[] = seedDocuments) {
  const now = new Date().toISOString().slice(0, 10);
  const baseSlug = slugify(title);
  const slug = ensureUniqueSlug(baseSlug, existingDocuments);

  return {
    id: createId(),
    slug,
    title: title.trim() || '未命名文档',
    date: now,
    updatedAt: now,
    excerpt: excerptFromMarkdown(content),
    tags: ['文档'],
    readingTime: estimateReadingTime(content),
    backgroundColor: '#ffffff',
    content,
  } satisfies DocumentItem;
}

export function normalizeDocuments(value: unknown) {
  if (!Array.isArray(value)) return seedDocuments;

  return value
    .filter((item): item is Partial<DocumentItem> => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const content = typeof item.content === 'string' ? item.content : '';
      const title = typeof item.title === 'string' && item.title.trim() ? item.title : `文档 ${index + 1}`;
      const now = new Date().toISOString().slice(0, 10);

      return {
        id: typeof item.id === 'string' ? item.id : createId(),
        slug: typeof item.slug === 'string' ? item.slug : slugify(title),
        title,
        date: typeof item.date === 'string' ? item.date : now,
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now,
        excerpt: typeof item.excerpt === 'string' ? item.excerpt : excerptFromMarkdown(content),
        tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : ['文档'],
        readingTime: typeof item.readingTime === 'string' ? item.readingTime : estimateReadingTime(content),
        backgroundColor: typeof item.backgroundColor === 'string' ? item.backgroundColor : '#ffffff',
        content,
      } satisfies DocumentItem;
    });
}
