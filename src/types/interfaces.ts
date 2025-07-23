// Wallpaper related types
export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
  category: string;
  tags: string[];
  downloads: number;
  type: WallpaperType;
  videoUrl?: string;
  videoDuration?: number;
  videoQuality?: string;
  lockScreenUrl?: string;
  parallaxSettings?: ParallaxSettings;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  active: boolean;
}

export const WallpaperType = {
  WALLPAPER: 'WALLPAPER',
  LIVE: 'LIVE',
  PARALLAX: 'PARALLAX',
  DOUBLE: 'DOUBLE'
} as const;

export type WallpaperType = typeof WallpaperType[keyof typeof WallpaperType];

export interface ParallaxSettings {
  intensity: number;
  tiltEffect: boolean;
  motionEffect: boolean;
}

// Category types
export interface Category {
  id: string;
  name: string;
  thumbnailUrl: string;
  count: number;
  createdAt: string;
  active: boolean;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  wallpapers?: string[] | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}