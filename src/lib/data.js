import {
  SCENIC_IMAGE_BY_TYPE,
  SEASON_ORDER,
  TIME_ORDER,
  TYPE_ORDER,
} from '../constants/filters';
import { generateMockPhotos } from './mockData';

const fallbackByIndex = (items, index) => items[index % items.length];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function normalizeFeatureScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0.5;
  }

  return Number(clamp(numericValue, 0, 1).toFixed(2));
}

function normalizePhoto(photo, index) {
  const fallbackType = fallbackByIndex(TYPE_ORDER, index);
  const type = TYPE_ORDER.includes(photo?.type) ? photo.type : fallbackType;
  const time = TIME_ORDER.includes(photo?.time) ? photo.time : fallbackByIndex(TIME_ORDER, index);
  const season = SEASON_ORDER.includes(photo?.season)
    ? photo.season
    : fallbackByIndex(SEASON_ORDER, index);
  const numericId = Number(photo?.id);

  return {
    id: Number.isFinite(numericId) ? numericId : index + 1,
    url:
      typeof photo?.url === 'string' && photo.url.trim()
        ? photo.url
        : SCENIC_IMAGE_BY_TYPE[type],
    type,
    time,
    season,
    features: {
      color_score: normalizeFeatureScore(photo?.features?.color_score),
      texture_complexity: normalizeFeatureScore(photo?.features?.texture_complexity),
    },
  };
}

export async function loadPhotoDataset() {
  try {
    const response = await fetch('/data.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Data request failed with status ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json) || json.length === 0) {
      throw new Error('Data file is empty or malformed');
    }

    return {
      photos: json.map(normalizePhoto),
      source: 'file',
    };
  } catch (error) {
    return {
      photos: generateMockPhotos(),
      source: 'mock',
      error,
    };
  }
}
