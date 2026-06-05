export const TYPE_OPTIONS = [
  '全部',
  '山景',
  '海景',
  '河湖景观',
  '森林绿植',
  '古镇小镇',
  '现代化大都市',
  '乡村田园',
  '雪山冰川',
  '瀑布溪流',
  '历史古迹',
];

export const TIME_OPTIONS = ['全部', '白天', '黑夜'];

export const SEASON_OPTIONS = ['全部', '春', '夏', '秋', '冬'];

export const TYPE_ORDER = TYPE_OPTIONS.slice(1);
export const TIME_ORDER = TIME_OPTIONS.slice(1);
export const SEASON_ORDER = SEASON_OPTIONS.slice(1);

const PUBLIC_BASE_URL = import.meta.env.BASE_URL || './';

export function resolvePublicAssetUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    return path;
  }

  const trimmedPath = path.trim();

  if (/^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(trimmedPath)) {
    return trimmedPath;
  }

  if (!trimmedPath.startsWith('/')) {
    return trimmedPath;
  }

  if (!trimmedPath.startsWith('/images/')) {
    return trimmedPath;
  }

  const normalizedBase = PUBLIC_BASE_URL.endsWith('/') ? PUBLIC_BASE_URL : `${PUBLIC_BASE_URL}/`;

  return `${normalizedBase}${trimmedPath.replace(/^\/+/, '')}`;
}

export const SCENIC_IMAGE_BY_TYPE = {
  山景: resolvePublicAssetUrl('/images/real/photo-005-img-20250131-173646.jpg'),
  海景: resolvePublicAssetUrl('/images/real/photo-002-img-20250131-174016.jpg'),
  河湖景观: resolvePublicAssetUrl('/images/real/photo-005-img-20250131-173646.jpg'),
  森林绿植: resolvePublicAssetUrl('/images/real/photo-030-img-20250429-121747.jpg'),
  古镇小镇: resolvePublicAssetUrl('/images/real/photo-007-img-20250131-175312.jpg'),
  现代化大都市: resolvePublicAssetUrl('/images/real/photo-004-img-20250117-170348.jpg'),
  乡村田园: resolvePublicAssetUrl('/images/real/photo-034-img-20250429-163118.jpg'),
  雪山冰川: resolvePublicAssetUrl('/images/real/photo-054-img-20260430-131941-1.jpg'),
  瀑布溪流: resolvePublicAssetUrl('/images/real/photo-002-img-20250131-174016.jpg'),
  历史古迹: resolvePublicAssetUrl('/images/real/photo-001-img-20250116-173812.jpg'),
};

export const TYPE_COLORS = {
  山景: '#2563eb',
  海景: '#0891b2',
  河湖景观: '#0ea5e9',
  森林绿植: '#16a34a',
  古镇小镇: '#d97706',
  现代化大都市: '#7c3aed',
  乡村田园: '#65a30d',
  雪山冰川: '#38bdf8',
  瀑布溪流: '#14b8a6',
  历史古迹: '#be123c',
};

export const TIME_COLORS = {
  白天: '#f59e0b',
  黑夜: '#334155',
};

export const SEASON_COLORS = {
  春: '#22c55e',
  夏: '#f97316',
  秋: '#d97706',
  冬: '#38bdf8',
};
