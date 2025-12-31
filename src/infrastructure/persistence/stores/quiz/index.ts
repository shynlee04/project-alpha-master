/**
 * @fileoverview Quiz store barrel exports
 * @module infrastructure/persistence/stores/quiz
 */

// Main store
export { useQuizStore, initializeQuizStore } from './quiz-store';
export type { QuizState } from './quiz-store';

// Database layer
export { QuizDatabase, getQuizDB } from './quiz-database';
export type { QuizRecord, QuizQuestionRecord } from './quiz-database';

// Actions
export {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  loadAllQuizzes,
} from './quiz-actions';

export {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from './quiz-question-actions';

export { filterQuizzes, searchQuizzes } from './quiz-query-actions';
