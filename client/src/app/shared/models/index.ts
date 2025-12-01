/**
 * Shared TypeScript models for the application
 * 
 * We can define the shape of data, when using these, we can ensure consistency and type safety across the application
 * 
 */

// ===============================
// USER AND AUTHENTICATION MODELS
// ===============================

/**
 * Represents a user in the application
 * Matches what is returned from the backend API
 */
export interface User {
    id: number;
    username: string;
    email: string;
    displayName: string;
    color: string;
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * User types into login form
 * The backend will validate this data
 */
export interface LoginUser {
    username: string;
    password: string;
}


/**
 * User types into register form
 */
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    color?: string;
}

/**
 * What the backend returns when a user logs in
 */
export interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

/**
 * What the user can update
 */
export interface ProfileUpdate {
    displayName?: string;
    color?: string;
    email?: string;
    password?: string;
}

// ===============================
// GAME DATA
// ===============================

/**
 * A trivia question in the server
 */
export interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

/**
 * A player in a game
 */
export interface Player {
    socketId: string;
    userId: string;
    username: string;
    displayName: string;
    color: string;
    score: number;
    answered: boolean;
}

/**
 * A room in the game
 */
export interface Room {
    id: string;
    players: Player[];
    currentQuestionIndex: number;
    gameStarted: boolean;
}

/**
 * Final score for a player in a game
 */
export interface FinalScore {
    socketId: string;
    userId: string;
    username: string;
    displayName: string;
    color: string;
    score: number;
}

/**
 * Result of answering a question
 */
export interface AnswerResult {
    correct: boolean;
    correctAnswer: number;
}

// ===============================
// LEADERBOARD MODELS
// ===============================

/**
 * A player on the leaderboard
 */
export interface LeaderboardEntry {
    rank: number;
    username: string;
    displayName: string;
    color: string;
    gamesPlayed: number;
    gamesWon: number;
    totalScore: number;
    winRate: number;
}

// ===============================
// SOCKET EVENT MODELS
// ===============================

/**
 * What the backend returns when a player joins a room
 */
export interface RoomJoinedResponse {
    roomId: string;
    playerNumber: number;
}

// ===============================
// GAME STATE
// ===============================

/**
 * The state of the game
 */

export type GameState = 'home' | 'waiting' | 'playing' | 'finished';