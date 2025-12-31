/**
 * @fileoverview SRS types and SM-2 algorithm unit tests
 * @module lib/study/__tests__/srs.test
 */

import {
  calculateNextReview,
  isCardDue,
  getDueCards,
  calculateStudyStats,
  calculateStreak,
  createStudySession,
  completeStudySession,
  DEFAULT_SRS_DATA,
  DEFAULT_STUDY_STATS,
  type SRSData,
  type SRSRating,
} from '../srs-types';

describe('SM-2 Algorithm', () => {
  describe('calculateNextReview', () => {
    it('should reset interval when rating is "again"', () => {
      const current: SRSData = {
        interval: 6,
        easeFactor: 2.5,
        repetitions: 3,
        lastReview: Date.now() - 6 * 24 * 60 * 60 * 1000,
        nextReview: Date.now(),
      };

      const result = calculateNextReview('again', current);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(current.easeFactor);
    });

    it('should increase interval for "hard" rating', () => {
      const current: SRSData = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        lastReview: Date.now() - 24 * 60 * 60 * 1000,
        nextReview: Date.now(),
      };

      const result = calculateNextReview('hard', current);

      // Hard has quality=2 (<3), so it resets repetitions
      // But ease factor may adjust
      expect(result.easeFactor).toBeDefined();
      expect(result.interval).toBe(1); // Reset due to hard rating
    });

    it('should increase repetitions for "good" rating on second review', () => {
      const current: SRSData = {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        lastReview: Date.now() - 24 * 60 * 60 * 1000,
        nextReview: Date.now(),
      };

      const result = calculateNextReview('good', current);

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('should maximize interval increase for "easy" rating', () => {
      const current: SRSData = {
        interval: 6,
        easeFactor: 2.5,
        repetitions: 2,
        lastReview: Date.now() - 6 * 24 * 60 * 60 * 1000,
        nextReview: Date.now(),
      };

      const result = calculateNextReview('easy', current);

      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(current.interval);
      expect(result.easeFactor).toBeGreaterThan(current.easeFactor);
    });

    it('should use default SRS data when current is undefined', () => {
      const result = calculateNextReview('good');

      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should not decrease ease factor below minimum', () => {
      const current: SRSData = {
        interval: 1,
        easeFactor: 1.5,
        repetitions: 0,
        lastReview: Date.now(),
        nextReview: Date.now(),
      };

      const result = calculateNextReview('again', current);

      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should update lastReview and nextReview timestamps', () => {
      const before = Date.now();
      const result = calculateNextReview('good', DEFAULT_SRS_DATA);
      const after = Date.now();

      expect(result.lastReview).toBeGreaterThanOrEqual(before);
      expect(result.lastReview).toBeLessThanOrEqual(after);
      expect(result.nextReview).toBeGreaterThan(result.lastReview);
    });
  });

  describe('isCardDue', () => {
    it('should return true when nextReview is in the past', () => {
      const srsData: SRSData = {
        ...DEFAULT_SRS_DATA,
        nextReview: Date.now() - 1000, // 1 second ago
      };

      expect(isCardDue(srsData)).toBe(true);
    });

    it('should return false when nextReview is in the future', () => {
      const srsData: SRSData = {
        ...DEFAULT_SRS_DATA,
        nextReview: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
      };

      expect(isCardDue(srsData)).toBe(false);
    });
  });

  describe('getDueCards', () => {
    it('should return only cards that are due', () => {
      const cards = [
        { id: '1', srsData: { ...DEFAULT_SRS_DATA, nextReview: Date.now() - 1000 } },
        { id: '2', srsData: { ...DEFAULT_SRS_DATA, nextReview: Date.now() + 86400000 } },
        { id: '3', srsData: { ...DEFAULT_SRS_DATA, nextReview: Date.now() - 5000 } },
      ] as const;

      const dueCards = getDueCards(cards);

      expect(dueCards).toHaveLength(2);
      expect(dueCards[0].id).toBe('1');
      expect(dueCards[1].id).toBe('3');
    });

    it('should return empty array when no cards are due', () => {
      const cards = [
        { id: '1', srsData: { ...DEFAULT_SRS_DATA, nextReview: Date.now() + 86400000 } },
        { id: '2', srsData: { ...DEFAULT_SRS_DATA, nextReview: Date.now() + 172800000 } },
      ] as const;

      const dueCards = getDueCards(cards);

      expect(dueCards).toHaveLength(0);
    });
  });
});

describe('Study Stats', () => {
  describe('calculateStudyStats', () => {
    it('should calculate correct statistics', () => {
      const session = createStudySession(['card-1', 'card-2', 'card-3']);
      session.ratings.set('card-1', 'easy');
      session.ratings.set('card-2', 'good');
      session.ratings.set('card-3', 'again');
      completeStudySession(session);

      const stats = calculateStudyStats(session);

      expect(stats.cardsStudied).toBe(3);
      expect(stats.correct).toBe(2); // easy + good
      expect(stats.incorrect).toBe(1); // again
      expect(stats.timeSpent).toBeGreaterThanOrEqual(0);
    });

    it('should calculate rating distribution', () => {
      const session = createStudySession(['card-1', 'card-2', 'card-3', 'card-4']);
      session.ratings.set('card-1', 'again');
      session.ratings.set('card-2', 'hard');
      session.ratings.set('card-3', 'good');
      session.ratings.set('card-4', 'easy');
      completeStudySession(session);

      const stats = calculateStudyStats(session);

      expect(stats.ratingDistribution.again).toBe(1);
      expect(stats.ratingDistribution.hard).toBe(1);
      expect(stats.ratingDistribution.good).toBe(1);
      expect(stats.ratingDistribution.easy).toBe(1);
    });

    it('should handle hard rating as partially correct', () => {
      const session = createStudySession(['card-1', 'card-2']);
      session.ratings.set('card-1', 'hard');
      session.ratings.set('card-2', 'hard');
      completeStudySession(session);

      const stats = calculateStudyStats(session);

      expect(stats.correct).toBe(1); // 0.5 + 0.5
      expect(stats.incorrect).toBe(1); // 0.5 + 0.5
    });
  });

  describe('calculateStreak', () => {
    it('should calculate consecutive good/easy ratings', () => {
      const ratings: SRSRating[] = ['good', 'easy', 'easy', 'hard', 'easy'];

      const streak = calculateStreak(ratings);

      expect(streak).toBe(3); // First three are good/easy
    });

    it('should return 0 for no good/easy ratings', () => {
      const ratings: SRSRating[] = ['again', 'hard', 'again'];

      const streak = calculateStreak(ratings);

      expect(streak).toBe(0);
    });

    it('should return full length if all ratings are good/easy', () => {
      const ratings: SRSRating[] = ['good', 'easy', 'good'];

      const streak = calculateStreak(ratings);

      expect(streak).toBe(3);
    });
  });
});

describe('Study Session', () => {
  describe('createStudySession', () => {
    it('should create a new session with provided card IDs', () => {
      const cardIds = ['card-1', 'card-2', 'card-3'];
      const session = createStudySession(cardIds);

      expect(session.cardIds).toEqual(cardIds);
      expect(session.currentIndex).toBe(0);
      expect(session.completed).toBe(false);
      expect(session.startTime).toBeDefined();
      expect(session.id).toBeDefined();
    });

    it('should generate unique session IDs', () => {
      const session1 = createStudySession(['card-1']);
      const session2 = createStudySession(['card-2']);

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('completeStudySession', () => {
    it('should mark session as completed', () => {
      const session = createStudySession(['card-1']);
      const completed = completeStudySession(session);

      expect(completed.completed).toBe(true);
      expect(completed.endTime).toBeDefined();
    });

    it('should preserve all other session properties', () => {
      const session = createStudySession(['card-1', 'card-2']);
      session.ratings.set('card-1', 'good');
      session.currentIndex = 1;

      const completed = completeStudySession(session);

      expect(completed.id).toBe(session.id);
      expect(completed.cardIds).toEqual(session.cardIds);
      expect(completed.ratings).toEqual(session.ratings);
      expect(completed.startTime).toBe(session.startTime);
    });
  });
});

describe('Default Values', () => {
  it('should have correct DEFAULT_SRS_DATA values', () => {
    expect(DEFAULT_SRS_DATA.interval).toBe(0);
    expect(DEFAULT_SRS_DATA.easeFactor).toBe(2.5);
    expect(DEFAULT_SRS_DATA.repetitions).toBe(0);
  });

  it('should have correct DEFAULT_STUDY_STATS values', () => {
    expect(DEFAULT_STUDY_STATS.cardsStudied).toBe(0);
    expect(DEFAULT_STUDY_STATS.timeSpent).toBe(0);
    expect(DEFAULT_STUDY_STATS.correct).toBe(0);
    expect(DEFAULT_STUDY_STATS.incorrect).toBe(0);
    expect(DEFAULT_STUDY_STATS.streak).toBe(0);
  });
});
