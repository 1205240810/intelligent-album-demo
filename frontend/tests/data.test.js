import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractPhotoArray,
  normalizePhoto,
  withStableUniqueIds,
} from '../src/lib/data.js';


test('extractPhotoArray accepts supported response shapes including an empty album', () => {
  assert.deepEqual(extractPhotoArray([]), []);
  assert.deepEqual(extractPhotoArray({ photos: [] }), []);
  assert.deepEqual(extractPhotoArray({ data: { photos: [{ id: 1 }] } }), [{ id: 1 }]);
  assert.equal(extractPhotoArray({ unexpected: true }), null);
});


test('normalizePhoto clamps scores and replaces invalid enum values', () => {
  const photo = normalizePhoto(
    {
      id: 'not-a-number',
      url: '',
      type: '未知类型',
      time: '凌晨',
      season: '雨季',
      features: {
        color_score: 3,
        texture_complexity: -2,
      },
    },
    0,
  );

  assert.equal(photo.id, 1);
  assert.equal(photo.type, '山景');
  assert.equal(photo.time, '白天');
  assert.equal(photo.season, '春');
  assert.equal(photo.features.color_score, 1);
  assert.equal(photo.features.texture_complexity, 0);
  assert.match(photo.url, /images\/real/);
});


test('withStableUniqueIds keeps every record addressable', () => {
  const photos = withStableUniqueIds([
    { id: 7 },
    { id: 7 },
    { id: '7-2' },
  ]);

  assert.equal(new Set(photos.map((photo) => String(photo.id))).size, 3);
});
