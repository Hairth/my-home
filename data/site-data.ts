export type Writing = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
};

export type Moment = {
  id: number;
  date: string;
  content: string;
  mood: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  tags: string[];
};

export type Friend = {
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

export const writings: Writing[] = [
  {
    slug: 'hello-world',
    title: '你好，星火',
    date: '2026-05-28',
    excerpt: '从零开始构建一个属于自己的数字花园。记录思考、分享生活、构建未来。',
    tags: ['思考', '起点'],
    readingTime: '3 min',
  },
  {
    slug: 'on-building',
    title: '关于构建',
    date: '2026-05-20',
    excerpt: '好的工具应该安静、可靠、值得信赖。代码如此，个人网站也如此。',
    tags: ['工程', '哲学'],
    readingTime: '8 min',
  },
  {
    slug: 'japan-vps-notes',
    title: '日本 VPS 网络调优笔记',
    date: '2026-05-15',
    excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践，以及高延迟环境下的稳定体验。',
    tags: ['网络', 'VPS', '实践'],
    readingTime: '12 min',
  },
];

export const initialMoments: Moment[] = [
  {
    id: 1,
    date: '2026-05-30',
    content: '把个人网站的基础框架搭好了。Next.js 16 + Tailwind 4，继续往动态配置方向推进。',
    mood: '✨',
  },
  {
    id: 2,
    date: '2026-05-29',
    content: '参考了 XinghuisamaBlogs 的仪表盘和 jinghuashang 的欢迎页，决定融合成一个可配置的个人空间。',
    mood: '🌿',
  },
  {
    id: 3,
    date: '2026-05-27',
    content: '工具的边界，就是创造力的边界。网站也应该像工作台一样，随时可以调整。',
    mood: '💡',
  },
];

export const projects: Project[] = [
  {
    id: 'my-home',
    name: 'My Home',
    description: '配置驱动的个人主页，包含欢迎页、文章、瞬间、项目、友链、音乐和设置中心。',
    href: 'https://github.com/Hairth/my-home',
    icon: '⌂',
    tags: ['Next.js', 'Tailwind', 'Personal Site'],
  },
  {
    id: 'digital-garden',
    name: 'Digital Garden Notes',
    description: '面向长期写作的内容结构实验，后续可以接入 Markdown/MDX 与搜索索引。',
    href: '/writings',
    icon: '✎',
    tags: ['Writing', 'MDX'],
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

export const friends: Friend[] = [
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
