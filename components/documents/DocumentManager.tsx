'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bold,
  Braces,
  CheckSquare,
  Code2,
  Columns2,
  Download,
  Eye,
  FileText,
  Hash,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListChecks,
  ListOrdered,
  Minus,
  Palette,
  PanelRight,
  Plus,
  Quote,
  Save,
  Search,
  Sigma,
  Table2,
  Trash2,
  Upload,
} from 'lucide-react';
import { type ChangeEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { seedDocuments, type DocumentItem } from '@/data/site-data';
import {
  createDocumentFromContent,
  DOCUMENTS_STORAGE_KEY,
  documentBackgrounds,
  ensureUniqueSlug,
  estimateReadingTime,
  excerptFromMarkdown,
  normalizeDocuments,
  slugify,
} from '@/lib/document-utils';

type EditorMode = 'edit' | 'preview' | 'split';

type InsertResult = {
  cursorEnd: number;
  cursorStart: number;
  next: string;
};

type ToolbarActionId =
  | 'h1'
  | 'h2'
  | 'bold'
  | 'italic'
  | 'inline-code'
  | 'link'
  | 'image'
  | 'quote'
  | 'unordered-list'
  | 'ordered-list'
  | 'task-list'
  | 'divider'
  | 'table'
  | 'code-block'
  | 'formula'
  | 'toc'
  | 'yaml'
  | 'footnote';

type ToolbarAction = {
  id: ToolbarActionId;
  icon: ReactNode;
  label: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { id: 'h1', icon: <Heading1 size={16} />, label: 'H1' },
  { id: 'h2', icon: <Heading2 size={16} />, label: 'H2' },
  { id: 'bold', icon: <Bold size={16} />, label: '加粗' },
  { id: 'italic', icon: <Italic size={16} />, label: '斜体' },
  { id: 'inline-code', icon: <Code2 size={16} />, label: '行内代码' },
  { id: 'link', icon: <LinkIcon size={16} />, label: '链接' },
  { id: 'image', icon: <ImageIcon size={16} />, label: '图像' },
  { id: 'quote', icon: <Quote size={16} />, label: '引用' },
  { id: 'unordered-list', icon: <ListIcon size={16} />, label: '无序列表' },
  { id: 'ordered-list', icon: <ListOrdered size={16} />, label: '有序列表' },
  { id: 'task-list', icon: <ListChecks size={16} />, label: '任务列表' },
  { id: 'divider', icon: <Minus size={16} />, label: '分割线' },
  { id: 'table', icon: <Table2 size={16} />, label: '表格' },
  { id: 'code-block', icon: <Braces size={16} />, label: '代码块' },
  { id: 'formula', icon: <Sigma size={16} />, label: '公式块' },
  { id: 'toc', icon: <Hash size={16} />, label: '目录' },
  { id: 'yaml', icon: <CheckSquare size={16} />, label: 'YAML' },
  { id: 'footnote', icon: <PanelRight size={16} />, label: '脚注' },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInline(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let listType: 'ol' | 'ul' | null = null;

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^\|(.+)\|$/.test(trimmed) && /^\|?[\s:-]+\|[\s|:-]+$/.test(lines[index + 1]?.trim() ?? '')) {
      closeList();
      const headers = trimmed.split('|').filter(Boolean);
      const rows: string[] = [];
      index += 2;
      while (index < lines.length && /^\|(.+)\|$/.test(lines[index].trim())) {
        const cells = lines[index].trim().split('|').filter(Boolean);
        rows.push(`<tr>${cells.map((cell) => `<td>${renderInline(cell.trim())}</td>`).join('')}</tr>`);
        index += 1;
      }
      index -= 1;
      html.push(`<table><thead><tr>${headers.map((header) => `<th>${renderInline(header.trim())}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
      continue;
    }

    if (/^#{1,6}\s/.test(trimmed)) {
      closeList();
      const level = trimmed.match(/^#+/)?.[0].length ?? 1;
      html.push(`<h${level}>${renderInline(trimmed.replace(/^#{1,6}\s/, ''))}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      closeList();
      html.push(`<blockquote>${renderInline(trimmed.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*_]{3,}\s*$/.test(trimmed)) {
      closeList();
      html.push('<hr />');
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
        html.push('<ol>');
      }
      html.push(`<li>${renderInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    if (/^[-*+]\s/.test(trimmed) || /^[-*+]\s\[[ xX]]\s/.test(trimmed)) {
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html.push('<ul>');
      }
      const isTask = /^[-*+]\s\[[ xX]]\s/.test(trimmed);
      const checked = /^[-*+]\s\[[xX]]\s/.test(trimmed);
      const text = trimmed.replace(/^[-*+]\s(\[[ xX]]\s)?/, '');
      html.push(`<li>${isTask ? `<input type="checkbox" disabled ${checked ? 'checked' : ''} /> ` : ''}${renderInline(text)}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${renderInline(trimmed)}</p>`);
  }

  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return html.join('\n');
}

function getTextColor(backgroundColor: string) {
  const normalized = backgroundColor.replace('#', '');
  if (normalized.length !== 6) return '#18181b';

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.54 ? '#18181b' : '#f8fafc';
}

function ToolbarButton({ action, onRun }: { action: ToolbarAction; onRun: (id: ToolbarActionId) => void }) {
  return (
    <button
      className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
      onClick={() => onRun(action.id)}
      title={action.label}
      type="button"
    >
      {action.icon}
      <span className="hidden xl:inline">{action.label}</span>
    </button>
  );
}

function ModeButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold transition ${
        active
          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function DocumentManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('doc') ?? seedDocuments[0].slug;
  const [documents, setDocuments] = useState<DocumentItem[]>(seedDocuments);
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<EditorMode>('split');
  const [status, setStatus] = useState('文档会自动保存在当前浏览器。');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(DOCUMENTS_STORAGE_KEY);
        if (raw) {
          setDocuments(normalizeDocuments(JSON.parse(raw)));
        }
      } catch {
        setDocuments(seedDocuments);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const activeDocument = useMemo(
    () => documents.find((document) => document.slug === activeSlug) ?? documents[0] ?? seedDocuments[0],
    [activeSlug, documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return documents;

    return documents.filter((document) =>
      `${document.title} ${document.excerpt} ${document.tags.join(' ')}`.toLowerCase().includes(normalizedQuery),
    );
  }, [documents, query]);

  const previewHtml = useMemo(() => renderMarkdown(activeDocument.content), [activeDocument.content]);
  const editorTextColor = getTextColor(activeDocument.backgroundColor);

  function persistDocuments(nextDocuments: DocumentItem[]) {
    window.localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(nextDocuments));
  }

  function applyDocuments(updater: (current: DocumentItem[]) => DocumentItem[]) {
    setDocuments((current) => {
      const nextDocuments = updater(current);
      persistDocuments(nextDocuments);
      return nextDocuments;
    });
  }

  function selectDocument(slug: string) {
    setIsDeleteConfirmOpen(false);
    setActiveSlug(slug);
    router.replace(`${pathname}?doc=${encodeURIComponent(slug)}`, { scroll: false });
  }

  function updateActiveDocument(patch: Partial<DocumentItem>) {
    const now = new Date().toISOString().slice(0, 10);
    applyDocuments((current) =>
      current.map((document) => {
        if (document.id !== activeDocument.id) return document;

        const nextContent = typeof patch.content === 'string' ? patch.content : document.content;
        const nextTitle = typeof patch.title === 'string' ? patch.title : document.title;
        const nextSlug =
          typeof patch.title === 'string'
            ? ensureUniqueSlug(slugify(patch.title), current, document.id)
            : patch.slug ?? document.slug;

        return {
          ...document,
          ...patch,
          title: nextTitle,
          slug: nextSlug,
          updatedAt: now,
          excerpt: typeof patch.content === 'string' ? excerptFromMarkdown(nextContent) : (patch.excerpt ?? document.excerpt),
          readingTime: typeof patch.content === 'string' ? estimateReadingTime(nextContent) : (patch.readingTime ?? document.readingTime),
        };
      }),
    );

    if (typeof patch.title === 'string') {
      const nextSlug = ensureUniqueSlug(slugify(patch.title), documents, activeDocument.id);
      setActiveSlug(nextSlug);
      router.replace(`${pathname}?doc=${encodeURIComponent(nextSlug)}`, { scroll: false });
    }
  }

  function replaceSelection(build: (selected: string, start: number, end: number, content: string) => InsertResult) {
    const textarea = textareaRef.current;
    const content = activeDocument.content;
    const start = textarea?.selectionStart ?? content.length;
    const end = textarea?.selectionEnd ?? content.length;
    const selected = content.slice(start, end);
    const result = build(selected, start, end, content);

    updateActiveDocument({ content: result.next });
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(result.cursorStart, result.cursorEnd);
    });
  }

  function wrapInline(before: string, after = before, placeholder = '文字') {
    replaceSelection((selected, start, end, content) => {
      const value = selected || placeholder;
      const insert = `${before}${value}${after}`;
      return {
        cursorEnd: start + before.length + value.length,
        cursorStart: start + before.length,
        next: `${content.slice(0, start)}${insert}${content.slice(end)}`,
      };
    });
  }

  function prefixLines(prefix: string, placeholder = '列表项') {
    replaceSelection((selected, start, end, content) => {
      const value = selected || placeholder;
      const insert = value
        .split('\n')
        .map((line) => `${prefix}${line}`)
        .join('\n');
      return {
        cursorEnd: start + insert.length,
        cursorStart: start,
        next: `${content.slice(0, start)}${insert}${content.slice(end)}`,
      };
    });
  }

  function insertSnippet(snippet: string, selectOffset = snippet.length) {
    replaceSelection((_selected, start, end, content) => ({
      cursorEnd: start + selectOffset,
      cursorStart: start + selectOffset,
      next: `${content.slice(0, start)}${snippet}${content.slice(end)}`,
    }));
  }

  function createNewDocument() {
    const nextDocument = createDocumentFromContent(
      '未命名文档',
      `# 未命名文档

从这里开始写。
`,
      documents,
    );
    applyDocuments((current) => [nextDocument, ...current]);
    selectDocument(nextDocument.slug);
    setStatus('新文档已创建。');
  }

  function deleteActiveDocument() {
    const nextDocuments = documents.filter((document) => document.id !== activeDocument.id);
    const safeDocuments = nextDocuments.length > 0 ? nextDocuments : [createDocumentFromContent('未命名文档', '# 未命名文档\n', [])];
    applyDocuments(() => safeDocuments);
    selectDocument(safeDocuments[0].slug);
    setIsDeleteConfirmOpen(false);
    setStatus('文档已删除。');
  }

  async function uploadDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const uploadedDocuments = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return createDocumentFromContent(file.name.replace(/\.[^/.]+$/, ''), content, documents);
      }),
    );

    applyDocuments((current) => [...uploadedDocuments, ...current]);
    selectDocument(uploadedDocuments[0].slug);
    setStatus(`已上传 ${uploadedDocuments.length} 个文档。`);
    event.target.value = '';
  }

  function downloadActiveDocument() {
    const blob = new Blob([activeDocument.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeDocument.slug}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('文档已导出。');
  }

  function runToolbarAction(actionId: ToolbarActionId) {
    switch (actionId) {
      case 'h1':
        prefixLines('# ', '标题');
        break;
      case 'h2':
        prefixLines('## ', '小标题');
        break;
      case 'bold':
        wrapInline('**', '**', '加粗文字');
        break;
      case 'italic':
        wrapInline('*', '*', '斜体文字');
        break;
      case 'inline-code':
        wrapInline('`', '`', 'code');
        break;
      case 'link':
        wrapInline('[', '](https://example.com)', '链接文字');
        break;
      case 'image':
        insertSnippet('![图片描述](https://example.com/image.png)');
        break;
      case 'quote':
        prefixLines('> ', '引用内容');
        break;
      case 'unordered-list':
        prefixLines('- ', '列表项');
        break;
      case 'ordered-list':
        prefixLines('1. ', '列表项');
        break;
      case 'task-list':
        prefixLines('- [ ] ', '待办事项');
        break;
      case 'divider':
        insertSnippet('\n---\n');
        break;
      case 'table':
        insertSnippet('\n| 名称 | 说明 |\n| --- | --- |\n| 项目 | 内容 |\n');
        break;
      case 'code-block':
        insertSnippet('\n```ts\nconsole.log("hello");\n```\n');
        break;
      case 'formula':
        insertSnippet('\n$$\nE = mc^2\n$$\n');
        break;
      case 'toc':
        insertSnippet('\n[TOC]\n');
        break;
      case 'yaml':
        insertSnippet('---\ntitle: 文档标题\ndate: 2026-06-01\ntags:\n  - 文档\n---\n\n', 0);
        break;
      case 'footnote':
        insertSnippet('这里有一个脚注[^1]\n\n[^1]: 脚注内容\n');
        break;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-5 border-b border-zinc-200 pb-8 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
            <FileText size={18} />
            DOCUMENTS
          </div>
          <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">文档</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            本地文档库，支持新增、编辑、删除、上传 Markdown/TXT，并提供类似 Typora 的常用格式插入工具。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-cyan-100"
            onClick={createNewDocument}
            type="button"
          >
            <Plus size={17} />
            新建
          </button>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
            onClick={() => uploadInputRef.current?.click()}
            type="button"
          >
            <Upload size={17} />
            上传文档
          </button>
          <input accept=".md,.markdown,.txt,text/markdown,text/plain" className="hidden" multiple onChange={uploadDocuments} ref={uploadInputRef} type="file" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
              <input
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文档"
                value={query}
              />
            </label>
          </div>

          <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
            {filteredDocuments.map((document) => (
              <button
                className={`block w-full rounded-lg border p-4 text-left transition ${
                  document.id === activeDocument.id
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-300 dark:bg-cyan-300/10'
                    : 'border-zinc-200 bg-white hover:border-cyan-300 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-cyan-300/70'
                }`}
                key={document.id}
                onClick={() => selectDocument(document.slug)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate text-base font-semibold">{document.title}</h2>
                  <span className="shrink-0 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{document.readingTime}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{document.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {document.tags.slice(0, 3).map((tag) => (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 p-4 dark:border-white/10">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <input
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-xl font-semibold tracking-normal focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) => updateActiveDocument({ title: event.target.value })}
                value={activeDocument.title}
              />
              <input
                className="h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950"
                onChange={(event) =>
                  updateActiveDocument({
                    tags: event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="标签，用逗号分隔"
                value={activeDocument.tags.join(', ')}
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {TOOLBAR_ACTIONS.map((action) => (
                  <ToolbarButton action={action} key={action.id} onRun={runToolbarAction} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-950">
                <ModeButton active={mode === 'edit'} onClick={() => setMode('edit')}>
                  <FileText size={15} />
                  编辑
                </ModeButton>
                <ModeButton active={mode === 'split'} onClick={() => setMode('split')}>
                  <Columns2 size={15} />
                  分屏
                </ModeButton>
                <ModeButton active={mode === 'preview'} onClick={() => setMode('preview')}>
                  <Eye size={15} />
                  预览
                </ModeButton>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Palette className="text-zinc-500" size={18} />
                {documentBackgrounds.map((color) => (
                  <button
                    aria-label={`背景 ${color}`}
                    className={`h-8 w-8 rounded-full border transition ${
                      activeDocument.backgroundColor === color ? 'border-cyan-500 ring-2 ring-cyan-500/25' : 'border-zinc-300 dark:border-white/20'
                    }`}
                    key={color}
                    onClick={() => updateActiveDocument({ backgroundColor: color })}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
                <input
                  aria-label="自定义背景颜色"
                  className="h-8 w-12 cursor-pointer rounded-md border border-zinc-200 bg-transparent dark:border-white/10"
                  onChange={(event) => updateActiveDocument({ backgroundColor: event.target.value })}
                  type="color"
                  value={activeDocument.backgroundColor}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
                  onClick={() => setStatus('已保存到当前浏览器。')}
                  type="button"
                >
                  <Save size={16} />
                  保存
                </button>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/10 dark:hover:border-cyan-300 dark:hover:text-cyan-200"
                  onClick={downloadActiveDocument}
                  type="button"
                >
                  <Download size={16} />
                  导出
                </button>
                <button
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-300/30 dark:text-rose-200 dark:hover:bg-rose-300/10"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  type="button"
                >
                  <Trash2 size={16} />
                  删除
                </button>
              </div>
            </div>

            {isDeleteConfirmOpen && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-300/30 dark:bg-rose-300/10 dark:text-rose-100 sm:flex-row sm:items-center sm:justify-between">
                <div>确认删除「{activeDocument.title}」？此操作只会删除当前浏览器里的本地文档。</div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 font-semibold text-white transition hover:bg-rose-500"
                    onClick={deleteActiveDocument}
                    type="button"
                  >
                    确认删除
                  </button>
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-4 font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-200/30 dark:bg-transparent dark:text-rose-100 dark:hover:bg-rose-200/10"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    type="button"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {status} 当前文档更新于 {activeDocument.updatedAt}。
            </div>
          </div>

          <div className={`grid min-h-[680px] ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {mode !== 'preview' && (
              <div className="min-h-[680px] border-b border-zinc-200 dark:border-white/10 lg:border-b-0 lg:border-r">
                <textarea
                  className="h-full min-h-[680px] w-full resize-none p-6 font-mono text-sm leading-7 outline-none"
                  onChange={(event) => updateActiveDocument({ content: event.target.value })}
                  ref={textareaRef}
                  spellCheck={false}
                  style={{ backgroundColor: activeDocument.backgroundColor, color: editorTextColor }}
                  value={activeDocument.content}
                />
              </div>
            )}

            {mode !== 'edit' && (
              <div
                className="document-preview min-h-[680px] overflow-auto p-6"
                style={{ backgroundColor: activeDocument.backgroundColor, color: editorTextColor }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
