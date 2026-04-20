import {
  SCENIC_IMAGE_BY_TYPE,
  SEASON_ORDER,
  TIME_ORDER,
  TYPE_ORDER,
} from '../constants/filters';

const baseFeatureByType = {
  山景: { color: 0.84, texture: 0.58 },
  海景: { color: 0.91, texture: 0.31 },
  河湖景观: { color: 0.79, texture: 0.42 },
  森林绿植: { color: 0.88, texture: 0.64 },
  古镇小镇: { color: 0.73, texture: 0.54 },
  现代化大都市: { color: 0.76, texture: 0.67 },
  乡村田园: { color: 0.82, texture: 0.37 },
  雪山冰川: { color: 0.68, texture: 0.49 },
  瀑布溪流: { color: 0.86, texture: 0.62 },
  历史古迹: { color: 0.71, texture: 0.57 },
};

const seasonModifiers = {
  春: { color: 0.03, texture: -0.02 },
  夏: { color: 0.06, texture: -0.01 },
  秋: { color: -0.03, texture: 0.05 },
  冬: { color: -0.07, texture: 0.04 },
};

const timeModifiers = {
  白天: { color: 0.01, texture: -0.01 },
  黑夜: { color: -0.05, texture: 0.07 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function generateMockPhotos() {
  let id = 1;
  const photos = [];

  TYPE_ORDER.forEach((type, typeIndex) => {
    SEASON_ORDER.forEach((season) => {
      TIME_ORDER.forEach((time) => {
        const base = baseFeatureByType[type];
        const variantSeed = ((typeIndex + 1) * (season.charCodeAt(0) + time.charCodeAt(0))) % 9;
        const wobble = (variantSeed - 4) * 0.005;

        photos.push({
          id: id++,
          url: SCENIC_IMAGE_BY_TYPE[type],
          type,
          time,
          season,
          features: {
            color_score: Number(
              clamp(
                base.color + seasonModifiers[season].color + timeModifiers[time].color + wobble,
                0.32,
                0.98,
              ).toFixed(2),
            ),
            texture_complexity: Number(
              clamp(
                base.texture +
                  seasonModifiers[season].texture +
                  timeModifiers[time].texture -
                  wobble,
                0.2,
                0.95,
              ).toFixed(2),
            ),
          },
        });
      });
    });
  });

  return photos;
}
