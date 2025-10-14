const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const getCachedData = <T,>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

export const setCachedData = <T,>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};
