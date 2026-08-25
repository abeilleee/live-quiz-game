import type { WebSocket } from "ws";
import { CLIENT_MSG } from "./constants";

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
      payload: AnswerData;
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
