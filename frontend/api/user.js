import { request } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PROFILE_CACHE_KEY = 'PROFILE_CACHE';

async function authHeaders() {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token found');
  return { 'x-auth-token': token };
}

export function normalizeProfile(user) {
  if (!user) return null;
  return {
    name: user.name ?? 'User',
    email: user.email ?? '',
    phone: user.phone ?? '',
    bio: user.bio ?? '',
    org: user.org ?? '',
    focusDuration: user.focusDuration ?? '25 min',
    settings: {
      notifications: user.settings?.notifications ?? true,
      darkMode: user.settings?.darkMode ?? false,
      reminderAlerts: user.settings?.reminderAlerts ?? true,
    },
  };
}

export async function cacheProfile(profile) {
  if (!profile) return;
  await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export async function getCachedProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const PROFILE_PATH = '/api/users/profile';

async function getProfile() {
  const data = await request(PROFILE_PATH, {
    method: 'GET',
    headers: await authHeaders(),
  });
  return normalizeProfile(data);
}

async function updateProfile(payload) {
  const data = await request(PROFILE_PATH, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return normalizeProfile(data);
}

export const userApi = {
  getProfile,
  updateProfile,
  normalizeProfile,
  cacheProfile,
  getCachedProfile,
};
