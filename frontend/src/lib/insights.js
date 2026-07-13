import {
  SCENIC_IMAGE_BY_TYPE,
  SEASON_ORDER,
  TIME_ORDER,
  TYPE_ORDER,
} from '../constants/filters.js';

const percent = (value) => `${Math.round(value * 100)}%`;

function countBy(items, order, picker) {
  return order.map((name) => ({
    name,
    count: items.filter((item) => picker(item) === name).length,
  }));
}

function average(items, picker) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((sum, item) => sum + picker(item), 0) / items.length;
}

function averageByType(items, picker) {
  return TYPE_ORDER.map((type) => {
    const typedItems = items.filter((item) => item.type === type);

    return {
      name: type,
      value: average(typedItems, picker),
      count: typedItems.length,
    };
  }).filter((item) => item.count > 0);
}

function topItem(items) {
  return [...items].sort((left, right) => right.count - left.count)[0] ?? null;
}

function topAverageItem(items) {
  return [...items].sort((left, right) => right.value - left.value)[0] ?? null;
}

function getTimeSummary(timeCounts, total) {
  if (!total) {
    return '暂无样本';
  }

  const day = timeCounts.find((item) => item.name === '白天')?.count ?? 0;
  const night = timeCounts.find((item) => item.name === '黑夜')?.count ?? 0;

  if (day === night) {
    return '昼夜样本均衡';
  }

  const leader = day > night ? '白天' : '黑夜';
  const leaderCount = Math.max(day, night);

  return `${leader}占比 ${percent(leaderCount / total)}`;
}

function summarizeDistribution(counts, total, unit) {
  const activeCounts = counts.filter((item) => item.count > 0);

  if (!activeCounts.length || !total) {
    return {
      value: '暂无数据',
      detail: '等待数据',
      sentence: `${unit}暂无可分析样本`,
      isBalanced: false,
    };
  }

  const maxCount = Math.max(...activeCounts.map((item) => item.count));
  const leaders = activeCounts.filter((item) => item.count === maxCount);

  if (leaders.length === activeCounts.length) {
    return {
      value: '均衡覆盖',
      detail: `${activeCounts.length} 项各 ${maxCount} 张`,
      sentence: `${unit}分布均衡`,
      isBalanced: true,
    };
  }

  if (leaders.length > 1) {
    const leaderNames = leaders.map((item) => item.name).join('、');

    return {
      value: `${leaderNames}并列`,
      detail: `各占 ${percent(maxCount / total)}`,
      sentence: `${unit}上以“${leaderNames}”并列最多`,
      isBalanced: false,
    };
  }

  return {
    value: leaders[0].name,
    detail: `占当前筛选池 ${percent(maxCount / total)}`,
    sentence: `${unit}上以“${leaders[0].name}”最多`,
    isBalanced: false,
  };
}

function buildConclusion({
  total,
  typeSummary,
  seasonSummary,
  timeCounts,
  colorAverage,
  textureAverage,
}) {
  if (!total) {
    return '当前筛选条件下暂无样本，建议放宽景点类型、时段或季节后继续观察。';
  }

  return `当前筛选池共 ${total} 张照片，${typeSummary.sentence}，${getTimeSummary(
    timeCounts,
    total,
  )}，${seasonSummary.sentence}。整体色彩表现为 ${percent(
    colorAverage,
  )}，纹理复杂度为 ${percent(textureAverage)}。`;
}

export function buildDatasetInsights(photos) {
  const total = photos.length;
  const typeCounts = countBy(photos, TYPE_ORDER, (photo) => photo.type);
  const timeCounts = countBy(photos, TIME_ORDER, (photo) => photo.time);
  const seasonCounts = countBy(photos, SEASON_ORDER, (photo) => photo.season);
  const coveredTypes = typeCounts.filter((item) => item.count > 0).length;
  const colorAverage = average(photos, (photo) => photo.features.color_score);
  const textureAverage = average(photos, (photo) => photo.features.texture_complexity);
  const colorByType = averageByType(photos, (photo) => photo.features.color_score);
  const textureByType = averageByType(photos, (photo) => photo.features.texture_complexity);
  const dominantType = topItem(typeCounts) ?? { name: '暂无数据', count: 0 };
  const dominantSeason = topItem(seasonCounts) ?? { name: '暂无数据', count: 0 };
  const typeSummary = summarizeDistribution(typeCounts, total, '景点类型');
  const seasonSummary = summarizeDistribution(seasonCounts, total, '季节');
  const bestColorType = topAverageItem(colorByType) ?? { name: '暂无数据', value: 0 };
  const richestTextureType = topAverageItem(textureByType) ?? { name: '暂无数据', value: 0 };
  const topTypes = [...typeCounts]
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 3);

  const heroType = dominantType.count > 0 ? dominantType.name : TYPE_ORDER[0];
  const heroPhoto = photos.find((photo) => photo.type === heroType) ?? photos[0];
  const daytimeCount = timeCounts.find((item) => item.name === '白天')?.count ?? 0;
  const nightCount = timeCounts.find((item) => item.name === '黑夜')?.count ?? 0;

  return {
    total,
    typeCounts,
    timeCounts,
    seasonCounts,
    coveredTypes,
    colorAverage,
    textureAverage,
    colorByType,
    textureByType,
    dominantType,
    dominantSeason,
    typeSummary,
    seasonSummary,
    bestColorType,
    richestTextureType,
    topTypes,
    daytimeCount,
    nightCount,
    heroImage: heroPhoto?.url ?? SCENIC_IMAGE_BY_TYPE[heroType],
    conclusion: buildConclusion({
      total,
      typeSummary,
      seasonSummary,
      timeCounts,
      colorAverage,
      textureAverage,
    }),
    highlights: [
      {
        label: '景点结构',
        value: typeSummary.value,
        detail: typeSummary.detail,
      },
      {
        label: '色彩最佳',
        value: bestColorType.name,
        detail: bestColorType.value ? `平均 ${percent(bestColorType.value)}` : '等待数据',
      },
      {
        label: '纹理最丰富',
        value: richestTextureType.name,
        detail: richestTextureType.value ? `平均 ${percent(richestTextureType.value)}` : '等待数据',
      },
    ],
  };
}

export { percent };
