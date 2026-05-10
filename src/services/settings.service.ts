import api from './api';
import type { SocialLink, SiteSetting } from '../types';

interface PublicSettings {
  settings: Record<string, string>;
  socialLinks: SocialLink[];
}

export const settingsService = {
  getPublic: () =>
    api.get<PublicSettings>('/settings/public').then(r => r.data),

  getSocialLinks: () =>
    api.get<SocialLink[]>('/settings/social-links').then(r => r.data),

  // Admin
  getAll: () =>
    api.get<SiteSetting[]>('/settings').then(r => r.data),

  update: (entries: { key: string; value: string }[]) =>
    api.put('/settings', entries).then(r => r.data),

  updateSocialLinks: (links: { platform: string; url: string; iconName?: string }[]) =>
    api.put('/settings/social-links', links).then(r => r.data),
};
