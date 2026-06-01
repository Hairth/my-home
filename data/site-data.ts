export type DocumentItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  updatedAt: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  backgroundColor: string;
  content: string;
};

export type Writing = DocumentItem;

export type Project = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  tags: string[];
};

export type NavigationBookmark = {
  id: string;
  name: string;
  description: string;
  href: string;
  avatar: string;
  color: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  note: string;
};

export const seedDocuments: DocumentItem[] = [
  {
    id: 'doc-hello-world',
    slug: 'hello-world',
    title: '你好，星火',
    date: '2026-05-28',
    updatedAt: '2026-06-01',
    excerpt: '从零开始构建一个属于自己的数字花园。记录思考、分享生活、构建未来。',
    tags: ['思考', '起点'],
    readingTime: '3 min',
    backgroundColor: '#ffffff',
    content: `# 你好，星火

从零开始构建一个属于自己的数字花园。

这个网站会记录思考，保存生活里的小发现，也会成为长期迭代的个人工作台。

## 为什么要在这里记录

因为文字和代码一样，都值得被认真对待。每一次整理，都会让未来某个时刻的自己少一点混乱，多一点确定。

> 欢迎你来。这里会继续生长。
`,
  },
  {
    id: 'doc-on-building',
    slug: 'on-building',
    title: '关于构建',
    date: '2026-05-20',
    updatedAt: '2026-06-01',
    excerpt: '好的工具应该安静、可靠、值得信赖。代码如此，个人网站也如此。',
    tags: ['工程', '哲学'],
    readingTime: '8 min',
    backgroundColor: '#f8fafc',
    content: `# 关于构建

好的工具应该安静、可靠、值得信赖。代码如此，个人网站也如此。

## 工作台感

- 能快速记录
- 能稳定保存
- 能按自己的节奏生长

---

这就是这个站点接下来要继续完善的方向。
`,
  },
  {
    id: 'doc-japan-vps-notes',
    slug: 'japan-vps-notes',
    title: '日本 VPS 网络调优笔记',
    date: '2026-05-15',
    updatedAt: '2026-06-01',
    excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践，以及高延迟环境下的稳定体验。',
    tags: ['网络', 'VPS', '实践'],
    readingTime: '12 min',
    backgroundColor: '#f0fdfa',
    content: `# 日本 VPS 网络调优笔记

这是一份用于整理网络环境、代理链路和延迟观察的文档模板。

## 检查列表

- [ ] 记录线路
- [ ] 记录延迟
- [ ] 对比不同时间段

\`\`\`bash
ping example.com
\`\`\`
`,
  },
];

export const writings = seedDocuments;

export const projects: Project[] = [
  {
    id: 'my-home',
    name: 'My Home',
    description: '配置驱动的个人主页，包含欢迎页、文档、项目、网站导航、音乐和设置中心。',
    href: 'https://github.com/Hairth/my-home',
    icon: '⌂',
    tags: ['Next.js', 'Tailwind', 'Personal Site'],
  },
  {
    id: 'digital-garden',
    name: 'Digital Garden Docs',
    description: '面向长期写作的文档结构实验，支持 Markdown 编辑、上传和本地管理。',
    href: '/documents',
    icon: '✎',
    tags: ['Writing', 'Markdown'],
  },
  {
    id: 'visual-settings',
    name: 'Visual Settings',
    description: '把欢迎词、一言接口、图片轮换 API 与模块开关集中到设置页管理。',
    href: '/settings',
    icon: '⚙',
    tags: ['Settings', 'LocalStorage'],
  },
];

export const navigationBookmarks: NavigationBookmark[] = [
  {
    id: 'xinghui',
    name: 'XingHuiSama',
    description: '动态博客、仪表盘式主页与丰富子页面的参考来源。',
    href: 'https://github.com/heiehiehi/XinghuisamaBlogs',
    avatar: 'https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg',
    color: '#6366f1',
  },
  {
    id: 'jinghuashang',
    name: '镜华桑',
    description: '欢迎页氛围、随机图源和一言体验的参考来源。',
    href: 'https://github.com/jinghuashang/jinghuashang.github.io',
    avatar: 'https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg',
    color: '#f43f5e',
  },
  {
    id: 'hairth-github',
    name: 'Hairth GitHub',
    description: '本站开发与同步的位置，后续功能会持续提交到这里。',
    href: 'https://github.com/Hairth/my-home',
    avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    color: '#10b981',
  },
];

export const tracks: Track[] = [
  {
    id: '1809646618',
    title: '夜间漫游',
    artist: 'Cloud Playlist',
    note: '适合写代码和整理思路的安静段落。',
  },
  {
    id: '3361076230',
    title: '晨间启动',
    artist: 'Cloud Playlist',
    note: '打开工作台时播放，像给今天按下启动键。',
  },
  {
    id: '1859390262',
    title: '微光收束',
    artist: 'Cloud Playlist',
    note: '收尾、复盘和写日志时使用。',
  },
];
