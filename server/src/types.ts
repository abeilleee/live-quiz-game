import type { WebSocket } from "ws";
import { CLIENT_MSG, GAME_ACTION } from "./constants";

export interface Player {
  name: string;
  index: string;
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

export interface Game {
  id: string;
  code: string;
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number;
  status: "waiting" | "in_progress" | "finished";
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers: Map<string, { answerIndex: number; timestamp: number }>;
}

export type GameAction =
  | {
      type: CLIENT_MSG.CREATE_GAME;
      payload: CreateGameData & { hostId: string };
    }
  | {
      type: CLIENT_MSG.JOIN_GAME;
      payload: JoinGameData & { player: Player };
    }
  | {
      type: CLIENT_MSG.START_GAME;
      payload: StartGameData & { hostId: string };
    }
  | {
      type: CLIENT_MSG.ANSWER;
      payload: AnswerData & { playerIndex: string };
    }
  | {
      type: GAME_ACTION.END_QUESTION;
      payload: { gameId: string; questionIndex: number };
    }
  | {
      type: GAME_ACTION.NEXT_QUESTION;
      payload: { gameId: string };
    }
  | {
      type: GAME_ACTION.REMOVE_PLAYER;
      payload: { playerIndex: string };
    };

export interface User {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export type UserAction = {
  type: CLIENT_MSG;
  payload: { name: string; password: string };
};

export interface WSMessage {
  type: string;
  data: any;
  id: number;
}

export interface RegData {
  name: string;
  password: string;
}

export interface CreateGameData {
  questions: Question[];
}

export interface JoinGameData {
  code: string;
}

export interface StartGameData {
  gameId: string;
}

export interface AnswerData {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

export interface RegResponseData {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
}

export interface PlayerResult {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface QuestionResultMessage {
  questionIndex: number;
  correctIndex: number;
  playerResults: PlayerResult[];
}

export interface QuestionMessage {
  questionNumber: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeLimitSec: number;
}

export interface ScoreboardEntry {
  name: string;
  score: number;
  rank: number;
}

export interface GameFinishedMessage {
  scoreboard: ScoreboardEntry[];
}
