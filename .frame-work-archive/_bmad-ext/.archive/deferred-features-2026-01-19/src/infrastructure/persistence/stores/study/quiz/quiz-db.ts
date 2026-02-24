/**
 * @fileoverview Quiz Database
 * @module infrastructure/persistence/stores/study/quiz/quiz-db
 */

import Dexie, { type Table } from 'dexie';
import type { QuizSettings } from '../../../../../lib/study/quiz-types';

/**
 * Quiz Record Interface
 */
export interface QuizRecord {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    questionIds: string[];
    sourceIds: string[];
    settings: QuizSettings;
    createdAt: number;
    updatedAt: number;
}

/**
 * Quiz Question Record Interface
 */
export interface QuizQuestionRecord {
    id: string;
    workspaceId: string;
    quizId: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    sourceIds: string[];
    createdAt: number;
}

/**
 * Dexie database for quiz persistence
 */
export class QuizDatabase extends Dexie {
    quizzes!: Table<QuizRecord>;
    quizQuestions!: Table<QuizQuestionRecord>;

    constructor() {
        super('ProjectAlphaQuizDB');
        this.version(1).stores({
            quizzes: 'id, title, createdAt, topic, *sourceIds',
            quizQuestions: 'id, quizId, difficulty, topic, *sourceIds',
        }).upgrade(async (tx) => {
            // Migration to version 2: Add workspaceId
            const defaultWorkspaceId = 'default';
            const quizzes = await tx.table('quizzes').toArray() as (QuizRecord & { workspaceId?: string })[];
            const quizQuestions = await tx.table('quizQuestions').toArray() as (QuizQuestionRecord & { workspaceId?: string })[];

            await Promise.all([
                ...quizzes.map((quiz) =>
                    tx.table('quizzes').put({
                        ...quiz,
                        workspaceId: quiz.workspaceId || defaultWorkspaceId,
                    })
                ),
                ...quizQuestions.map((q) =>
                    tx.table('quizQuestions').put({
                        ...q,
                        workspaceId: q.workspaceId || defaultWorkspaceId,
                    })
                ),
            ]);
        });
        this.version(2).stores({
            quizzes: 'id, workspaceId, title, createdAt, topic, *sourceIds',
            quizQuestions: 'id, workspaceId, quizId, difficulty, topic, *sourceIds',
        });
    }
}

// Lazy initialization of database
let db: QuizDatabase | null = null;

export function getQuizDB(): QuizDatabase {
    if (!db) {
        db = new QuizDatabase();
    }
    return db;
}
