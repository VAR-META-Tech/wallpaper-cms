import axios from 'axios';
import type { Wallpaper, Category, Collection, LoginCredentials, ApiResponse } from '../types/interfaces';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Wallpapers API
export const wallpaperApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; category?: string }) =>
    api.get<ApiResponse<Wallpaper[]>>('/wallpapers', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Wallpaper>>(`/wallpapers/${id}`),
  
  search: (query: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Wallpaper[]>>('/wallpapers/search', { 
      params: { q: query, ...params } 
    }),
  
  create: (data: Omit<Wallpaper, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Wallpaper>>('/admin/wallpapers', data),
  
  update: (id: string, data: Partial<Wallpaper>) =>
    api.put<ApiResponse<Wallpaper>>(`/admin/wallpapers/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/wallpapers/${id}`),
  
  toggleActive: (id: string) =>
    api.patch<ApiResponse<Wallpaper>>(`/admin/wallpapers/${id}/toggle-active`),
  
  updateDownloadCount: (id: string) =>
    api.post<ApiResponse<void>>(`/wallpapers/${id}/download`),
};

// Categories API
export const categoryApi = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
  
  getById: (id: string) =>
    api.get<ApiResponse<Category>>(`/categories/${id}`),
  
  create: (data: Omit<Category, 'id' | 'createdAt' | 'count'>) =>
    api.post<ApiResponse<Category>>('/admin/categories', data),
  
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/categories/${id}`),
  
  toggleActive: (id: string) =>
    api.patch<ApiResponse<Category>>(`/admin/categories/${id}/toggle-active`),
};

// Collections API
export const collectionApi = {
  getAll: () =>
    api.get<ApiResponse<Collection[]>>('/collections'),
  
  getById: (id: string) =>
    api.get<ApiResponse<Collection>>(`/collections/${id}`),
  
  create: (data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<ApiResponse<Collection>>('/admin/collections', data),
  
  update: (id: string, data: Partial<Collection>) =>
    api.put<ApiResponse<Collection>>(`/admin/collections/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/admin/collections/${id}`),
  
  toggleActive: (id: string) =>
    api.patch<ApiResponse<Collection>>(`/admin/collections/${id}/toggle-active`),
  
  addWallpaper: (collectionId: string, wallpaperId: string) =>
    api.post<ApiResponse<void>>(`/admin/collections/${collectionId}/wallpapers/${wallpaperId}`),
  
  removeWallpaper: (collectionId: string, wallpaperId: string) =>
    api.delete<ApiResponse<void>>(`/admin/collections/${collectionId}/wallpapers/${wallpaperId}`),
};

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', credentials),
  
  logout: () =>
    api.post<ApiResponse<void>>('/auth/logout'),
  
  verifyToken: () =>
    api.get<ApiResponse<any>>('/auth/verify'),
};

// Stats API
export const statsApi = {
  getDashboard: () =>
    api.get<ApiResponse<{
      totalWallpapers: number;
      totalCategories: number;
      totalCollections: number;
      totalDownloads: number;
      recentWallpapers: Wallpaper[];
      topCategories: Category[];
    }>>('/admin/stats/dashboard'),
};

// Upload API
export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<ApiResponse<{
      url: string;
      filename: string;
      size: number;
      mimeType: string;
    }>>('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;