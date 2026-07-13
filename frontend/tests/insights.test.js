import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDatasetInsights } from '../src/lib/insights.js';


const photo = (id, type, time, season, color, texture) => ({
  id,
  url: `/images/${id}.jpg`,
  type,
  time,
  season,
  features: {
    color_score: color,
    texture_complexity: texture,
  },
});


test('buildDatasetInsights summarizes the current filtered pool', () => {
  const result = buildDatasetInsights([
    photo(1, '海景', '白天', '春', 0.8, 0.2),
    photo(2, '海景', '黑夜', '春', 0.6, 0.4),
    photo(3, '历史古迹', '白天', '冬', 0.3, 0.7),
  ]);

  assert.equal(result.total, 3);
  assert.equal(result.dominantType.name, '海景');
  assert.equal(result.daytimeCount, 2);
  assert.equal(result.nightCount, 1);
  assert.equal(result.coveredTypes, 2);
  assert.match(result.conclusion, /共 3 张照片/);
});


test('buildDatasetInsights returns a useful empty state', () => {
  const result = buildDatasetInsights([]);

  assert.equal(result.total, 0);
  assert.match(result.conclusion, /暂无样本/);
  assert.equal(result.colorAverage, 0);
  assert.equal(result.textureAverage, 0);
});
