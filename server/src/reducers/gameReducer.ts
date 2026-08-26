import { randomUUID } from "node:crypto";
import { CLIENT_MSG, ERROR } from "../constants";
import {
  CreateGameData,
  Game,
  GameAction,
  JoinGameData,
  StartGameData,
} from "../types";
import { validateQuestions, validateStartGame } from "../validators";
import { generateCode } from "../utils/generateCode";
import { Logger } from "../utils/logger";
import { reject } from "../utils/reject";
import { findGameById } from "../utils/findGameById";

export interface Result {
  success: boolean;
  data: CreateGameData | JoinGameData | StartGameData | {};
  errorText?: string;
  game?: Game;
}

interface ReturnedValue {
  state: Map<string, Game>;
  result: Result;
}

export const gameReducer = (
  state: Map<string, Game>,
  action: GameAction,
): ReturnedValue => {
  const newState = new Map(state);

  switch (action.type) {
    case CLIENT_MSG.CREATE_GAME: {
      const { questions, hostId } = action.payload;

      const questionsError = validateQuestions(questions);

      if (questionsError) {
        return reject(state, questionsError);
      }

      /** Room code */
      let code = generateCode();

      while (newState.has(code)) {
        code = generateCode();
      }

      const gameId = randomUUID();

      newState.set(code, {
        id: gameId,
        code,
        hostId,
        questions,
        players: [],
        currentQuestion: -1,
        status: "waiting",
        playerAnswers: new Map(),
      });

      Logger.success("🎲 Game created");

      return {
        state: newState,
        result: {
          success: true,
          data: { gameId, code },
        },
      };
    }

    case CLIENT_MSG.JOIN_GAME: {
      const { code, player } = action.payload;
      const game = newState.get(code);

      // Check game exists, game status is waiting and user isn't in the game
      if (
        !game ||
        game.status !== "waiting" ||
        game.players.find((p) => p.index === player.index)
      ) {
        return reject(state, ERROR.FAILED_TO_JOIN_GAME);
      }

      game.players.push(player);

      return {
        state: newState,
        result: {
          success: true,
          data: { gameId: game.id },
          game,
        },
      };
    }

    case CLIENT_MSG.START_GAME: {
      const { gameId, hostId } = action.payload;
      const game = findGameById(newState, gameId);

      if (!game) {
        return reject(state, ERROR.GAME_NOT_FOUND);
      }

      const errorMsg = validateStartGame({ hostId, game });

      if (errorMsg) {
        return reject(state, errorMsg);
      }

      game.status = "in_progress";
      game.currentQuestion = 0;
      game.playerAnswers = new Map();
      game.questionStartTime = Date.now();

      const currentQuestion = game.questions[game.currentQuestion];

      return {
        state: newState,
        result: {
          success: true,
          data: {
            questionNumber: 1,
            totalQuestions: game.questions.length,
            text: currentQuestion.text,
            options: currentQuestion.options,
            timeLimitSec: currentQuestion.timeLimitSec,
          },
          game,
        },
      };
    }

    default:
      return reject(state, ERROR.UNEXPECTED_ERROR);
  }
};
