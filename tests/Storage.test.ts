import { describe, it, expect } from 'vitest';
import {
  HighScoreStorage,
  STORAGE_KEY,
  type StorageLike
} from '../src/utils/Storage';

function makeFakeStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    }
  };
}

describe('HighScoreStorage', () => {
  it('returns an empty list when nothing is stored', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    expect(storage.getHighScores()).toEqual([]);
  });

  it('stores the first score as rank 1 and a new high', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    const result = storage.submitScore(1500, 3);
    expect(result.stored).toBe(true);
    expect(result.isNewHigh).toBe(true);
    expect(result.rank).toBe(1);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].score).toBe(1500);
    expect(result.entries[0].level).toBe(3);
  });

  it('does not flag a zero first score as a new high', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    const result = storage.submitScore(0, 1);
    expect(result.isNewHigh).toBe(false);
    expect(result.stored).toBe(true);
  });

  it('sorts entries by score descending', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    storage.submitScore(100, 1);
    storage.submitScore(500, 2);
    storage.submitScore(300, 2);
    const scores = storage.getHighScores().map((e) => e.score);
    expect(scores).toEqual([500, 300, 100]);
  });

  it('flags a new high only when beating the previous best', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    expect(storage.submitScore(500, 1).isNewHigh).toBe(true);
    expect(storage.submitScore(600, 1).isNewHigh).toBe(true);
    expect(storage.submitScore(200, 1).isNewHigh).toBe(false);
  });

  it('caps the list at 5 entries and rejects lower scores', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    for (const [score, level] of [
      [100, 1],
      [200, 1],
      [300, 2],
      [400, 2],
      [500, 3]
    ] as const) {
      storage.submitScore(score, level);
    }
    const result = storage.submitScore(50, 1);
    expect(result.stored).toBe(false);
    expect(result.rank).toBeNull();
    expect(result.entries).toHaveLength(5);
    expect(result.entries[0].score).toBe(500);
  });

  it('keeps a new score that makes the top 5 and reports its rank', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    for (const score of [100, 200, 300, 400, 500]) {
      storage.submitScore(score, 1);
    }
    const result = storage.submitScore(250, 2);
    expect(result.stored).toBe(true);
    expect(result.rank).toBe(4);
    expect(result.entries.map((e) => e.score)).toEqual([
      500, 400, 300, 250, 200
    ]);
  });

  it('treats a tie with the lowest kept score as not stored', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    for (const score of [100, 200, 300, 400, 500]) {
      storage.submitScore(score, 1);
    }
    const result = storage.submitScore(100, 1);
    expect(result.stored).toBe(false);
    expect(result.entries).toHaveLength(5);
  });

  it('shares state across instances using the same backend', () => {
    const backend = makeFakeStorage();
    const writer = new HighScoreStorage(backend);
    writer.submitScore(777, 2);
    const reader = new HighScoreStorage(backend);
    expect(reader.getHighScores()[0].score).toBe(777);
  });

  it('survives corrupt stored data', () => {
    const backend = makeFakeStorage();
    backend.setItem(STORAGE_KEY, '{not valid json');
    const storage = new HighScoreStorage(backend);
    expect(storage.getHighScores()).toEqual([]);
    const result = storage.submitScore(42, 1);
    expect(result.stored).toBe(true);
  });

  it('skips malformed entries when parsing', () => {
    const backend = makeFakeStorage();
    backend.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { score: 'nope' },
        { score: 100, level: 2 },
        { foo: 1 },
        { score: 200 }
      ])
    );
    const storage = new HighScoreStorage(backend);
    expect(storage.getHighScores().map((e) => e.score)).toEqual([200, 100]);
  });

  it('records an ISO date on saved entries', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    const result = storage.submitScore(10, 1);
    expect(result.entries[0].date).not.toBe('');
    expect(Number.isNaN(Date.parse(result.entries[0].date))).toBe(false);
  });

  it('clear() empties the list', () => {
    const storage = new HighScoreStorage(makeFakeStorage());
    storage.submitScore(10, 1);
    storage.clear();
    expect(storage.getHighScores()).toEqual([]);
  });
});