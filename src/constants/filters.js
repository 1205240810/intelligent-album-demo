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

export const SCENIC_IMAGE_BY_TYPE = {
  山景: '/images/mountain.svg',
  海景: '/images/seascape.svg',
  河湖景观: '/images/lake.svg',
  森林绿植: '/images/forest.svg',
  古镇小镇: '/images/town.svg',
  现代化大都市: '/images/city.svg',
  乡村田园: '/images/village.svg',
  雪山冰川: '/images/glacier.svg',
  瀑布溪流: '/images/waterfall.svg',
  历史古迹: '/images/heritage.svg',
};

export const TYPE_COLORS = {
  山景: '#5eead4',
  海景: '#38bdf8',
  河湖景观: '#60a5fa',
  森林绿植: '#4ade80',
  古镇小镇: '#f59e0b',
  现代化大都市: '#fb7185',
  乡村田园: '#facc15',
  雪山冰川: '#c4b5fd',
  瀑布溪流: '#22d3ee',
  历史古迹: '#f97316',
};

export const TIME_COLORS = {
  白天: '#fbbf24',
  黑夜: '#38bdf8',
};

export const SEASON_COLORS = {
  春: '#4ade80',
  夏: '#fb7185',
  秋: '#f59e0b',
  冬: '#60a5fa',
};
