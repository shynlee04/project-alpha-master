/**
 * @fileoverview Unit tests for quiz session types and utilities
 * @module lib/study/__tests__/quiz-session.test
 */

import type { Quiz, QuizQuestion } from '../quiz-types';
import type { QuizSession, QuizAnswer, QuizResult } from '../quiz-session';
import {
  createQuizSession,
  selectAnswer,
  nextQuestion,
  previousQuestion,
  completeQuizSession,
  calculateGrade,
  estimateQuizTime,
  getDifficultyBreakdown,
  getQuizTopics,
} from '../quiz-session';

// Mock timer for consistent testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Test quiz data
const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: 'Basic arithmetic: 2 + 2 = 4',
    difficulty: 'easy',
    topic: 'math',
    createdAt: Date.now(),
    sourceIds: [],
  },
  {
    id: 'q2',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctIndex: 2,
    explanation: 'Paris is the capital of France',
    difficulty: 'easy',
    topic: 'geography',
    createdAt: Date.now(),
    sourceIds: [],
  },
  {
    id: 'q3',
    question: 'What is H2O?',
    options: ['Carbon dioxide', 'Water', 'Oxygen', 'Hydrogen peroxide'],
    correctIndex: 1,
    explanation: 'H2O is the chemical formula for water',
    difficulty: 'easy',
    topic: 'science',
    createdAt: Date.now(),
    sourceIds: [],
  },
];

const mockQuiz: Quiz = {
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'A test quiz for unit testing',
  questions: mockQuestions,
  totalQuestions: 3,
  topics: ['math', 'geography', 'science'],
  sourcesUsed: ['source-1'],
  createdAt: Date.now(),
};

describe('Quiz Session Utilities', () => {
  describe('createQuizSession', () => {
    it('should create a new quiz session with correct initial state', () => {
      const session = createQuizSession(mockQuiz);

      expect(session.quizId).toBe(mockQuiz.id);
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.answers.size).toBe(0);
      expect(session.timeSpent).toBe(0);
      expect(session.completed).toBe(false);
      expect(session.startTime).toBeDefined();
    });

    it('should initialize with empty answers Map', () => {
      const session = createQuizSession(mockQuiz);

      expect(session.answers).toBeInstanceOf(Map);
      expect(session.answers.size).toBe(0);
    });
  });

  describe('selectAnswer', () => {
    it('should record correct answer', () => {
      const session = createQuizSession(mockQuiz);
      const question = mockQuiz.questions[0];
      const updatedSession = selectAnswer(session, question, 1, 5000);

      expect(updatedSession.answers.size).toBe(1);
      expect(updatedSession.answers.get('q1')?.isCorrect).toBe(true);
      expect(updatedSession.answers.get('q1')?.selectedIndex).toBe(1);
      expect(updatedSession.answers.get('q1')?.timeSpent).toBe(5000);
    });

    it('should record incorrect answer', () => {
      const session = createQuizSession(mockQuiz);
      const question = mockQuiz.questions[0];
      const updatedSession = selectAnswer(session, question, 0, 3000);

      expect(updatedSession.answers.size).toBe(1);
      expect(updatedSession.answers.get('q1')?.isCorrect).toBe(false);
      expect(updatedSession.answers.get('q1')?.selectedIndex).toBe(0);
    });

    it('should preserve answers from previous questions', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 1, 1000);
      session = selectAnswer(session, mockQuiz.questions[1], 2, 2000);

      expect(session.answers.size).toBe(2);
      expect(session.answers.has('q1')).toBe(true);
      expect(session.answers.has('q2')).toBe(true);
    });

    it('should allow updating answer for same question', () => {
      let session = createQuizSession(mockQuiz);
      const question = mockQuiz.questions[0];

      session = selectAnswer(session, question, 0, 1000);
      expect(session.answers.get('q1')?.selectedIndex).toBe(0);

      session = selectAnswer(session, question, 1, 2000);
      expect(session.answers.get('q1')?.selectedIndex).toBe(1);
      expect(session.answers.size).toBe(1);
    });
  });

  describe('nextQuestion', () => {
    it('should increment question index when not at last question', () => {
      const session = createQuizSession(mockQuiz);
      const updated = nextQuestion(session, mockQuiz.questions.length);

      expect(updated.currentQuestionIndex).toBe(1);
    });

    it('should not change index when at last question', () => {
      let session = createQuizSession(mockQuiz);
      session = { ...session, currentQuestionIndex: 2 };
      const updated = nextQuestion(session, mockQuiz.questions.length);

      expect(updated.currentQuestionIndex).toBe(2);
    });

    it('should not exceed total questions minus one', () => {
      let session = createQuizSession(mockQuiz);
      session = { ...session, currentQuestionIndex: 1 };
      const updated = nextQuestion(session, mockQuiz.questions.length);

      expect(updated.currentQuestionIndex).toBe(2);
    });
  });

  describe('previousQuestion', () => {
    it('should decrement question index when not at first question', () => {
      let session = createQuizSession(mockQuiz);
      session = { ...session, currentQuestionIndex: 2 };
      const updated = previousQuestion(session);

      expect(updated.currentQuestionIndex).toBe(1);
    });

    it('should not change index when at first question', () => {
      const session = createQuizSession(mockQuiz);
      const updated = previousQuestion(session);

      expect(updated.currentQuestionIndex).toBe(0);
    });

    it('should not go below zero', () => {
      let session = createQuizSession(mockQuiz);
      session = { ...session, currentQuestionIndex: 0 };
      const updated = previousQuestion(session);

      expect(updated.currentQuestionIndex).toBe(0);
    });
  });

  describe('completeQuizSession', () => {
    it('should calculate correct score for all correct answers', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 1, 1000);
      session = selectAnswer(session, mockQuiz.questions[1], 2, 2000);
      session = selectAnswer(session, mockQuiz.questions[2], 1, 3000);

      const result = completeQuizSession(session, mockQuiz, 6000);

      expect(result.quizId).toBe(mockQuiz.id);
      expect(result.totalQuestions).toBe(3);
      expect(result.correctAnswers).toBe(3);
      expect(result.percentage).toBeCloseTo(100, 0);
      expect(result.timeSpent).toBe(6000);
      expect(result.answers.length).toBe(3);
    });

    it('should calculate correct score for mixed answers', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 1, 1000); // correct
      session = selectAnswer(session, mockQuiz.questions[1], 0, 2000); // wrong
      session = selectAnswer(session, mockQuiz.questions[2], 1, 3000); // correct

      const result = completeQuizSession(session, mockQuiz, 6000);

      expect(result.correctAnswers).toBe(2);
      expect(result.percentage).toBeCloseTo(66.67, 1);
    });

    it('should calculate correct score for all incorrect answers', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 0, 1000);
      session = selectAnswer(session, mockQuiz.questions[1], 0, 2000);
      session = selectAnswer(session, mockQuiz.questions[2], 0, 3000);

      const result = completeQuizSession(session, mockQuiz, 6000);

      expect(result.correctAnswers).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should mark answers correctly in result', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 1, 1000);
      session = selectAnswer(session, mockQuiz.questions[1], 0, 2000);

      const result = completeQuizSession(session, mockQuiz, 3000);

      expect(result.answers[0].isCorrect).toBe(true);
      expect(result.answers[1].isCorrect).toBe(false);
    });

    it('should only include answered questions', () => {
      let session = createQuizSession(mockQuiz);
      session = selectAnswer(session, mockQuiz.questions[0], 1, 1000);
      // Question 2 not answered

      const result = completeQuizSession(session, mockQuiz, 1000);

      expect(result.answers.length).toBe(1);
      expect(result.totalQuestions).toBe(3);
    });
  });

  describe('calculateGrade', () => {
    it('should return A for 90% and above', () => {
      expect(calculateGrade(100)).toBe('A');
      expect(calculateGrade(95)).toBe('A');
      expect(calculateGrade(90)).toBe('A');
    });

    it('should return B for 80-89%', () => {
      expect(calculateGrade(89)).toBe('B');
      expect(calculateGrade(85)).toBe('B');
      expect(calculateGrade(80)).toBe('B');
    });

    it('should return C for 70-79%', () => {
      expect(calculateGrade(79)).toBe('C');
      expect(calculateGrade(75)).toBe('C');
      expect(calculateGrade(70)).toBe('C');
    });

    it('should return D for 60-69%', () => {
      expect(calculateGrade(69)).toBe('D');
      expect(calculateGrade(65)).toBe('D');
      expect(calculateGrade(60)).toBe('D');
    });

    it('should return F for below 60%', () => {
      expect(calculateGrade(59)).toBe('F');
      expect(calculateGrade(50)).toBe('F');
      expect(calculateGrade(0)).toBe('F');
    });
  });

  describe('estimateQuizTime', () => {
    it('should calculate time based on question count and seconds per question', () => {
      const time = estimateQuizTime(mockQuestions, 30);

      expect(time).toBe(90); // 3 questions * 30 seconds
    });

    it('should use default 30 seconds per question', () => {
      const time = estimateQuizTime(mockQuestions);

      expect(time).toBe(90); // 3 questions * 30 seconds default
    });

    it('should handle empty questions array', () => {
      const time = estimateQuizTime([], 30);

      expect(time).toBe(0);
    });
  });

  describe('getDifficultyBreakdown', () => {
    it('should count questions by difficulty', () => {
      const questions: QuizQuestion[] = [
        { ...mockQuestions[0], difficulty: 'easy', id: 'q1', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[1], difficulty: 'medium', id: 'q2', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[2], difficulty: 'hard', id: 'q3', createdAt: Date.now(), sourceIds: [] },
      ];

      const breakdown = getDifficultyBreakdown(questions);

      expect(breakdown.easy).toBe(1);
      expect(breakdown.medium).toBe(1);
      expect(breakdown.hard).toBe(1);
    });

    it('should handle multiple questions of same difficulty', () => {
      const questions: QuizQuestion[] = [
        { ...mockQuestions[0], difficulty: 'easy', id: 'q1', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[0], difficulty: 'easy', id: 'q2', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[0], difficulty: 'easy', id: 'q3', createdAt: Date.now(), sourceIds: [] },
      ];

      const breakdown = getDifficultyBreakdown(questions);

      expect(breakdown.easy).toBe(3);
      expect(breakdown.medium).toBe(0);
      expect(breakdown.hard).toBe(0);
    });

    it('should return zero counts for empty array', () => {
      const breakdown = getDifficultyBreakdown([]);

      expect(breakdown.easy).toBe(0);
      expect(breakdown.medium).toBe(0);
      expect(breakdown.hard).toBe(0);
    });
  });

  describe('getQuizTopics', () => {
    it('should extract unique topics from questions', () => {
      const topics = getQuizTopics(mockQuestions);

      expect(topics).toContain('math');
      expect(topics).toContain('geography');
      expect(topics).toContain('science');
      expect(topics.length).toBe(3);
    });

    it('should return unique topics only', () => {
      const questions: QuizQuestion[] = [
        { ...mockQuestions[0], topic: 'math', id: 'q1', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[0], topic: 'math', id: 'q2', createdAt: Date.now(), sourceIds: [] },
        { ...mockQuestions[0], topic: 'physics', id: 'q3', createdAt: Date.now(), sourceIds: [] },
      ];

      const topics = getQuizTopics(questions);

      expect(topics).toEqual(['math', 'physics']);
    });

    it('should return empty array for no questions', () => {
      const topics = getQuizTopics([]);

      expect(topics).toEqual([]);
    });
  });
});
