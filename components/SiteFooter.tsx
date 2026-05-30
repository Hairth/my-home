export function SiteFooter() {
  return (
    <footer className=\"border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0a0a0a]\">
      <div className=\"mx-auto max-w-6xl px-6 py-10 text-sm text-stone-500 dark:text-stone-400 flex flex-col md:flex-row md:items-center md:justify-between gap-4\">
        <div>
          © {new Date().getFullYear()} Hairth · 星火. 保留所有权利。
        </div>
        <div className=\"flex gap-6\">
          <a href=\"#\" className=\"hover:text-stone-700 dark:hover:text-stone-200 transition\">RSS</a>
          <a href=\"https://github.com/Hairth/my-home\" target=\"_blank\" className=\"hover:text-stone-700 dark:hover:text-stone-200 transition\">Source</a>
          <a href=\"mailto:hi@hairth.com\" className=\"hover:text-stone-700 dark:hover:text-stone-200 transition\">联系</a>
        </div>
        <div className=\"text-xs\">用心构建的数字花园</div>
      </div>
    </footer>
  );
}
