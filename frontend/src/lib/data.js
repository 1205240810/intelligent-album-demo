import {
  SCENIC_IMAGE_BY_TYPE,
  SEASON_ORDER,
  TIME_ORDER,
  TYPE_ORDER,
  resolvePublicAssetUrl,
} from '../constants/filters';
import { generateSamplePhotos } from './sampleData';

const fallbackByIndex = (items, index) => items[index % items.length];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const API_ENDPOINT = import.meta.env.VITE_PHOTO_DATA_API_URL?.trim();
const LOCAL_DATA_URL = `${import.meta.env.BASE_URL}data.json`;

function normalizeFeatureScore(value) {
  if (value === null || value === undefined || value === '') {
    return 0.5;
  }

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
  const rawUrl =
    typeof photo?.url === 'string' && photo.url.trim()
      ? photo.url.trim()
      : SCENIC_IMAGE_BY_TYPE[type];

  return {
    id: Number.isFinite(numericId) ? numericId : index + 1,
    url: resolvePublicAssetUrl(rawUrl),
    type,
    time,
    season,
    features: {
      color_score: normalizeFeatureScore(photo?.features?.color_score),
      texture_complexity: normalizeFeatureScore(photo?.features?.texture_complexity),
    },
  };
}

function withStableUniqueIds(photos) {
  const usedIds = new Set();

  return photos.map((photo, index) => {
    const idKey = String(photo.id);

    if (!usedIds.has(idKey)) {
      usedIds.add(idKey);
      return photo;
    }

    const nextId = `${idKey}-${index + 1}`;
    usedIds.add(nextId);

    return {
      ...photo,
      id: nextId,
    };
  });
}

function extractPhotoArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.photos)) {
    return payload.photos;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.photos)) {
    return payload.data.photos;
  }

  return null;
}

function readEmbeddedDataset() {
  if (typeof document === 'undefined') {
    return null;
  }

  const embeddedData = document.getElementById('photo-data');

  if (!embeddedData?.textContent?.trim()) {
    return null;
  }

  try {
    const payload = JSON.parse(embeddedData.textContent);
    const photos = extractPhotoArray(payload);

    if (!Array.isArray(photos)) {
      return null;
    }

    return {
      photos: withStableUniqueIds(photos.map(normalizePhoto)),
      meta: payload?.meta ?? null,
      endpoint: 'embedded:data.json',
    };
  } catch {
    return null;
  }
}

async function requestDataset(url) {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Data request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const photos = extractPhotoArray(payload);

  if (!Array.isArray(photos)) {
    throw new Error('Data payload is malformed');
  }

  return {
    photos: withStableUniqueIds(photos.map(normalizePhoto)),
    meta: payload?.meta ?? null,
  };
}

export async function loadPhotoDataset() {
  if (API_ENDPOINT) {
    try {
      const result = await requestDataset(API_ENDPOINT);

      return {
        ...result,
        endpoint: API_ENDPOINT,
        source: 'api',
      };
    } catch (apiError) {
      try {
        const result = await requestDataset(LOCAL_DATA_URL);

        return {
          ...result,
          endpoint: LOCAL_DATA_URL,
          source: 'file',
          warning: apiError,
        };
      } catch (fileError) {
        const embeddedResult = readEmbeddedDataset();

        if (embeddedResult) {
          return {
            ...embeddedResult,
            source: 'file',
            warning: apiError,
            error: fileError,
          };
        }

        return {
          photos: generateSamplePhotos(),
          endpoint: API_ENDPOINT,
          source: 'sample',
          error: fileError,
          warning: apiError,
        };
      }
    }
  }

  try {
    const result = await requestDataset(LOCAL_DATA_URL);

    return {
      ...result,
      endpoint: LOCAL_DATA_URL,
      source: 'file',
    };
  } catch (error) {
    const embeddedResult = readEmbeddedDataset();

    if (embeddedResult) {
      return {
        ...embeddedResult,
        source: 'file',
        warning: error,
      };
    }

    return {
      photos: generateSamplePhotos(),
      source: 'sample',
      error,
    };
  }
}
