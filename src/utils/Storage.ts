/**
 * High score persistence backed by localStorage.
 *
 * Stores the top 5 scores as JSON under a single key. The storage backend is
 * injectable so the logic can be unit tested without a browser environment.
 */

export interface HighScoreEntry {
  score: number;
  level: number;
  date: string; // ISO timestamp of when the score was achieved
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SubmitScoreResult {
  /** Whether the score was kept (made the top 5). */
  stored: boolean;
  /** True when the score beats every previously saved score. */
  isNewHigh: boolean;
  /** 1-based rank in the saved list, or null when not stored. */
  rank: number | null;
  /** The full updated list of saved scores (best first). */
  entries: HighScoreEntry[];
}

export const STORAGE_KEY = 'qbert_high_scores';
const MAX_ENTRIES = 5;

export class HighScoreStorage {
  private backend: StorageLike;

  constructor(backend?: StorageLike) {
    this.backend = backend ?? HighScoreStorage.defaultBackend();
  }

  /** Saved scores, best first (sorted by score descending). */
  getHighScores(): HighScoreEntry[] {
    return this.parse(this.backend.getItem(STORAGE_KEY)).sort(
      (a, b) => b.score - a.score
    );
  }

  /**
   * Add a finished game's score. Keeps the top 5, sorted best first.
   * The first-ever score is not counted as a "new high" unless it beats zero.
   */
  submitScore(score: number, level: number): SubmitScoreResult {
    const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;

    const previous = this.getHighScores();
    const previousBest = previous.length > 0 ? previous[0].score : 0;
    const isNewHigh = safeScore > previousBest;

    const entry: HighScoreEntry = {
      score: safeScore,
      level: safeLevel,
      date: new Date().toISOString()
    };

    const merged = [...previous, entry].sort(
      (a, b) => b.score - a.score || a.date.localeCompare(b.date)
    );
    const kept = merged.slice(0, MAX_ENTRIES);

    const rankIndex = kept.findIndex((e) => e === entry);
    const stored = rankIndex !== -1;

    this.save(kept);

    return {
      stored,
      isNewHigh,
      rank: stored ? rankIndex + 1 : null,
      entries: kept
    };
  }

  /** Remove all saved scores. */
  clear(): void {
    this.backend.setItem(STORAGE_KEY, JSON.stringify([]));
  }

  private save(entries: HighScoreEntry[]): void {
    this.backend.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  /**
   * Parse stored JSON defensively — corrupt or malformed data is treated as
   * an empty list rather than crashing the game.
   */
  private parse(raw: string | null): HighScoreEntry[] {
    if (!raw) return [];
    try {
      const data: unknown = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.flatMap((item) => {
        if (typeof item !== 'object' || item === null) return [];
        const record = item as Record<string, unknown>;
        const score = record['score'];
        if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
          return [];
        }
        const level = record['level'];
        const date = record['date'];
        return [
          {
            score,
            level:
              typeof level === 'number' && Number.isFinite(level) && level >= 1
                ? level
                : 1,
            date: typeof date === 'string' ? date : ''
          }
        ];
      });
    } catch {
      return [];
    }
  }

  /**
   * Resolve the default storage backend. Falls back to an in-memory map when
   * localStorage is unavailable (SSR, tests, privacy modes that block it).
   */
  private static defaultBackend(): StorageLike {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      // localStorage access can throw (e.g. blocked cookies); fall back below.
    }
    const map = new Map<string, string>();
    return {
      getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
      setItem: (key, value) => {
        map.set(key, value);
      }
    };
  }
}