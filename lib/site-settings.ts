export type ImageSourceMode = 'preset' | 'api';

export type SiteSettings = {
  profile: {
    siteTitle: string;
    navTitle: string;
    authorName: string;
    tagline: string;
    bio: string;
    avatarUrl: string;
    location: string;
    email: string;
    githubUrl: string;
  };
  welcome: {
    enabled: boolean;
    title: string;
    subtitle: string;
    enterLabel: string;
    quoteApiUrl: string;
    autoCloseSeconds: number;
  };
  background: {
    mode: ImageSourceMode;
    imageApiUrl: string;
    intervalSeconds: number;
    blurStrength: number;
    overlayOpacity: number;
    images: string[];
  };
  modules: {
    moments: boolean;
    projects: boolean;
    friends: boolean;
    music: boolean;
    dashboard: boolean;
  };
  music: {
    youtubePlaylistId: string;
  };
};

export const SETTINGS_STORAGE_KEY = 'my-home:site-settings:v1';

export const defaultSiteSettings: SiteSettings = {
  profile: {
    siteTitle: 'Hairth · 星火',
    navTitle: 'Hairth',
    authorName: 'Hairth',
    tagline: '记录思考，分享生活，构建未来',
    bio: '一个用来收纳文档、瞬间、项目、友链和音乐的个人数字花园。',
    avatarUrl: 'https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg',
    location: 'Online',
    email: 'hi@hairth.com',
    githubUrl: 'https://github.com/Hairth',
  },
  welcome: {
    enabled: true,
    title: '你好，小笨蛋。',
    subtitle: '欢迎来到 Hairth 的数字花园',
    enterLabel: '进入网站',
    quoteApiUrl: 'https://v1.hitokoto.cn/?encode=json',
    autoCloseSeconds: 0,
  },
  background: {
    mode: 'api',
    imageApiUrl: 'https://imgapi.jinghuashang.cn/random?sort=pc',
    intervalSeconds: 10,
    blurStrength: 18,
    overlayOpacity: 72,
    images: [
      'https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg',
      'https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg',
      'https://bu.dusays.com/2026/03/24/69c26fe4d9486.jpg',
    ],
  },
  modules: {
    moments: true,
    projects: true,
    friends: true,
    music: true,
    dashboard: true,
  },
  music: {
    youtubePlaylistId: '',
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeObject<T extends Record<string, unknown>>(base: T, incoming: unknown): T {
  if (!isPlainObject(incoming)) return base;

  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(incoming)) {
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = mergeObject(baseValue, value);
    } else if (Array.isArray(baseValue) && Array.isArray(value)) {
      result[key] = value.filter((item): item is string => typeof item === 'string');
    } else if (typeof value === typeof baseValue) {
      result[key] = value;
    }
  }

  return result as T;
}

export function mergeSiteSettings(incoming: unknown): SiteSettings {
  return mergeObject(defaultSiteSettings as unknown as Record<string, unknown>, incoming) as SiteSettings;
}

export function normalizeImageLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function withCacheBust(url: string, seed: number): string {
  if (!url.trim()) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_=${seed}`;
}
