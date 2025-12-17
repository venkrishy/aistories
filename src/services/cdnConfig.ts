export interface CDNConfig {
  baseUrl: string;
  imageBaseUrl: string;
}

export function createCDNConfig(): CDNConfig {
  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return {
    baseUrl: isDevelopment ? '/stories' : 'https://cdn.aistories.online',
    imageBaseUrl: isDevelopment ? '/stories' : 'https://cdn.aistories.online',
  };
}
