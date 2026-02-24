/**
 * Page Object Model: Study Workspace
 *
 * @module e2e/pages/StudyPage
 */

import { Page, Locator, expect } from '@playwright/test';

export class StudyPage {
    readonly page: Page;
    readonly url: string = '/study';

    // Locators
    readonly sessionList: Locator;
    readonly studyPanel: Locator;
    readonly startSessionButton: Locator;
    readonly quizPanel: Locator;
    readonly flashcardPanel: Locator;
    readonly generateQuizButton: Locator;
    readonly generateFlashcardsButton: Locator;
    readonly answerInput: Locator;
    readonly submitAnswerButton: Locator;
    readonly nextQuestionButton: Locator;
    readonly scoreDisplay: Locator;
    readonly progressDisplay: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.sessionList = page.locator('[data-testid="session-list"]');
        this.studyPanel = page.locator('[data-testid="study-panel"]');
        this.startSessionButton = page.getByRole('button', { name: /start session|begin/i });
        this.quizPanel = page.locator('[data-testid="quiz-panel"]');
        this.flashcardPanel = page.locator('[data-testid="flashcard-panel"]');
        this.generateQuizButton = page.getByRole('button', { name: /generate quiz|create quiz/i });
        this.generateFlashcardsButton = page.getByRole('button', { name: /generate flashcards|create flashcards/i });
        this.answerInput = page.locator('[data-testid="quiz-answer-input"]');
        this.submitAnswerButton = page.getByRole('button', { name: /submit|check/i });
        this.nextQuestionButton = page.getByRole('button', { name: /next|continue/i });
        this.scoreDisplay = page.locator('[data-testid="score-display"]');
        this.progressDisplay = page.locator('[data-testid="progress-display"]');
    }

    /**
     * Navigate to Study workspace
     */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.waitForLoad();
    }

    /**
     * Wait for Study workspace to fully load
     */
    async waitForLoad(): Promise<void> {
        await expect(this.studyPanel).toBeVisible({ timeout: 10000 });
    }

    /**
     * Start a new study session
     */
    async startSession(sessionType: 'quiz' | 'flashcards' | 'mixed'): Promise<void> {
        await this.startSessionButton.click();

        // Select session type
        await this.page.getByRole('menuitem', { name: new RegExp(sessionType, 'i') }).click();

        // Confirm
        await this.page.getByRole('button', { name: /start|begin/i }).click();

        // Wait for session to start
        await expect(this.quizPanel.or(this.flashcardPanel)).toBeVisible();
    }

    /**
     * Generate a quiz from content
     */
    async generateQuiz(topic: string, questionCount: number = 5): Promise<void> {
        await this.generateQuizButton.click();

        // Fill in quiz generation form
        const topicInput = this.page.getByRole('textbox', { name: /topic|subject/i });
        await topicInput.fill(topic);

        const countInput = this.page.getByRole('spinbutton', { name: /count|number/i });
        await countInput.fill(String(questionCount));

        // Submit
        await this.page.getByRole('button', { name: /generate|create/i }).click();

        // Wait for quiz to be generated
        await expect(this.quizPanel).toBeVisible({ timeout: 30000 });
    }

    /**
     * Generate flashcards from content
     */
    async generateFlashcards(topic: string, cardCount: number = 10): Promise<void> {
        await this.generateFlashcardsButton.click();

        // Fill in flashcard generation form
        const topicInput = this.page.getByRole('textbox', { name: /topic|subject/i });
        await topicInput.fill(topic);

        const countInput = this.page.getByRole('spinbutton', { name: /count|number/i });
        await countInput.fill(String(cardCount));

        // Submit
        await this.page.getByRole('button', { name: /generate|create/i }).click();

        // Wait for flashcards to be generated
        await expect(this.flashcardPanel).toBeVisible({ timeout: 30000 });
    }

    /**
     * Answer a quiz question
     */
    async answerQuizQuestion(answer: string): Promise<void> {
        await this.answerInput.fill(answer);
        await this.submitAnswerButton.click();
    }

    /**
     * Get current quiz question
     */
    async getCurrentQuestion(): Promise<string> {
        const question = await this.quizPanel.locator('[data-testid="quiz-question"]').innerText();
        return question;
    }

    /**
     * Get quiz score
     */
    async getScore(): Promise<number> {
        const scoreText = await this.scoreDisplay.innerText();
        const match = scoreText.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Get progress percentage
     */
    async getProgress(): Promise<number> {
        const progressText = await this.progressDisplay.innerText();
        const match = progressText.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Navigate to next question
     */
    async nextQuestion(): Promise<void> {
        await this.nextQuestionButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Flip current flashcard
     */
    async flipFlashcard(): Promise<void> {
        const card = this.flashcardPanel.locator('[data-testid="flashcard"]');
        await card.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Get flashcard front text
     */
    async getFlashcardFront(): Promise<string> {
        const front = await this.flashcardPanel.locator('[data-testid="flashcard-front"]').innerText();
        return front;
    }

    /**
     * Get flashcard back text
     */
    async getFlashcardBack(): Promise<string> {
        const back = await this.flashcardPanel.locator('[data-testid="flashcard-back"]').innerText();
        return back;
    }

    /**
     * Mark flashcard as known/unknown
     */
    async markFlashcard(status: 'known' | 'unknown'): Promise<void> {
        const button = this.page.getByRole('button', { name: new RegExp(status, 'i') });
        await button.click();
    }

    /**
     * Get list of study sessions
     */
    async getSessionList(): Promise<string[]> {
        const sessions = await this.sessionList.allTextContents();
        return sessions;
    }

    /**
     * Assert quiz is active
     */
    async assertQuizActive(): Promise<void> {
        await expect(this.quizPanel).toBeVisible();
    }

    /**
     * Assert flashcards are active
     */
    async assertFlashcardsActive(): Promise<void> {
        await expect(this.flashcardPanel).toBeVisible();
    }

    /**
     * End current session
     */
    async endSession(): Promise<void> {
        const endButton = this.page.getByRole('button', { name: /end|finish|complete/i });
        await endButton.click();

        // Confirm if dialog appears
        const confirmButton = this.page.getByRole('button', { name: /end|confirm/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
        }
    }
}
