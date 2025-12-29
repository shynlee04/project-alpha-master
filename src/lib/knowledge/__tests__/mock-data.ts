/**
 * @fileoverview Mock data for flashcard generation testing
 * @module lib/knowledge/__tests__/mock-data
 */

import type { Flashcard, FlashcardSet } from '../types';

/**
 * Mock source data for testing flashcard generation
 */
export const mockSources = [
  {
    id: 'src-1',
    title: 'Introduction to Machine Learning',
    content: `Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

Key concepts:
1. Supervised Learning: Training a model on labeled data to make predictions
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error with rewards

Common algorithms include linear regression, decision trees, random forests, and neural networks.

Machine learning applications include image recognition, natural language processing, recommendation systems, and autonomous vehicles.`,
  },
  {
    id: 'src-2',
    title: 'Neural Networks Deep Dive',
    content: `Neural networks are computing systems inspired by biological neural networks that constitute animal brains.

Structure:
- Input Layer: Receives raw data features
- Hidden Layers: Perform computations on inputs
- Output Layer: Produces final predictions

Activation functions introduce non-linearity:
- ReLU (Rectified Linear Unit): f(x) = max(0, x)
- Sigmoid: Maps values to [0, 1]
- Tanh: Maps values to [-1, 1]

Backpropagation is the algorithm used to train neural networks by propagating errors backward through the network layers.

Deep learning refers to neural networks with many hidden layers, enabling the learning of complex patterns in data.`,
  },
  {
    id: 'src-3',
    title: 'Data Science Fundamentals',
    content: `Data science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract insights from structured and unstructured data.

The data science workflow:
1. Problem Definition: Understanding the business question
2. Data Collection: Gathering relevant data sources
3. Data Cleaning: Handling missing values and outliers
4. Exploratory Data Analysis: Understanding data patterns
5. Feature Engineering: Creating meaningful features
6. Model Building: Training predictive models
7. Evaluation: Assessing model performance
8. Deployment: Putting models into production

Key tools include Python, R, SQL, and cloud platforms like AWS, GCP, and Azure.`,
  },
];

/**
 * Generate expected flashcards from mock sources
 */
export function generateExpectedFlashcards(sourceId: string): Flashcard[] {
  const baseTime = Date.now();

  return [
    {
      id: `fc-${baseTime}-0-abc123`,
      question: 'What is machine learning?',
      answer: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
      difficulty: 'easy',
      topic: 'Machine Learning',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-1-def456`,
      question: 'What are the three main types of machine learning?',
      answer: 'The three main types of machine learning are: 1) Supervised Learning (training on labeled data), 2) Unsupervised Learning (finding patterns in unlabeled data), and 3) Reinforcement Learning (learning through trial and error with rewards).',
      difficulty: 'easy',
      topic: 'Machine Learning',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-2-ghi789`,
      question: 'What is the structure of a neural network?',
      answer: 'A neural network consists of three layers: 1) Input Layer (receives raw data features), 2) Hidden Layers (perform computations on inputs), and 3) Output Layer (produces final predictions).',
      difficulty: 'medium',
      topic: 'Neural Networks',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-3-jkl012`,
      question: 'What are common activation functions in neural networks?',
      answer: 'Common activation functions include: 1) ReLU (Rectified Linear Unit): f(x) = max(0, x), 2) Sigmoid (maps to [0, 1]), and 3) Tanh (maps to [-1, 1]).',
      difficulty: 'medium',
      topic: 'Neural Networks',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-4-mno345`,
      question: 'What is backpropagation?',
      answer: 'Backpropagation is the algorithm used to train neural networks by propagating errors backward through the network layers, allowing weights to be adjusted to minimize prediction errors.',
      difficulty: 'hard',
      topic: 'Neural Networks',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-5-pqr678`,
      question: 'What is the data science workflow?',
      answer: 'The data science workflow consists of: 1) Problem Definition, 2) Data Collection, 3) Data Cleaning, 4) Exploratory Data Analysis, 5) Feature Engineering, 6) Model Building, 7) Evaluation, and 8) Deployment.',
      difficulty: 'easy',
      topic: 'Data Science',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
    {
      id: `fc-${baseTime}-6-stu901`,
      question: 'What does deep learning refer to?',
      answer: 'Deep learning refers to neural networks with many hidden layers, which enable the learning of complex patterns in large amounts of data.',
      difficulty: 'medium',
      topic: 'Neural Networks',
      sourceIds: [sourceId],
      createdAt: baseTime,
    },
  ];
}

/**
 * Mock flashcard set for testing
 */
export function createMockFlashcardSet(sourceIds: string[]): FlashcardSet {
  const allCards = mockSources.flatMap((source) => generateExpectedFlashcards(source.id));
  const now = Date.now();

  return {
    id: `fcs-mock-${now}-set`,
    name: 'Mock Flashcard Set',
    description: 'Auto-generated flashcards from mock sources for testing',
    cardIds: allCards.slice(0, 5).map((c) => c.id),
    sourceIds,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Sample content for quick testing
 */
export const sampleContents = {
  short: 'Machine learning is a subset of AI. It enables systems to learn from data.',

  medium: `Photosynthesis is the process by which plants convert light energy into chemical energy.

The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

Key points:
- Occurs in chloroplasts
- Requires sunlight, water, and carbon dioxide
- Produces glucose and oxygen
- Essential for life on Earth`,

  long: mockSources[0].content,
};
