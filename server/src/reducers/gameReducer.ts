import { randomUUID } from "node:crypto";
import { CLIENT_MSG, ERROR, GAME_ACTION } from "../constants";
import {
  CreateGameData,
  Game,
  GameAction,
  GameFinishedMessage,
  JoinGameData,
  PlayerResult,
  QuestionMessage,
  QuestionResultMessage,
  StartGameData,
} from "../types";
import {
  validateAnswer,
  validateQuestions,
  validateStartGame,
} from "../validators";
import { generateCode } from "../utils/generateCode";
import { Logger } from "../utils/logger";
import { reject } from "../utils/reject";
import { findGameById } from "../utils/findGameById";
import { calculatePoints } from "../utils/calculatePoints";
import { startQuestion } from "../utils/startQuestion";
import { buildScoreboard } from "../utils/buildScoreboard";
import { validateEndQuestion } from "../validators/validateEndQuestion";

export interface Result {
  success: boolean;
  data:
    | CreateGameData
    | JoinGameData
    | StartGameData
    | QuestionMessage
    | QuestionResultMessage
    | GameFinishedMessage
    | {};
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

      const firstQuestionIdx = 0;
      const questionMessage = startQuestion(game, firstQuestionIdx);

      return {
        state: newState,
        result: {
          success: true,
          data: questionMessage,
          game,
        },
      };
    }

    case CLIENT_MSG.ANSWER: {
      const { gameId, answerIndex, questionIndex, playerIndex } =
        action.payload;
      const game = findGameById(newState, gameId);

      if (!game) {
        return reject(state, ERROR.GAME_NOT_FOUND);
      }

      const errorMsg = validateAnswer(playerIndex, game, {
        questionIndex,
        answerIndex,
      });

      if (errorMsg) {
        return reject(state, errorMsg);
      }

      game.playerAnswers.set(playerIndex, {
        answerIndex,
        timestamp: Date.now(),
      });

      return {
        state: newState,
        result: {
          success: true,
          data: { questionIndex },
        },
      };
    }

    case GAME_ACTION.END_QUESTION: {
      const { gameId, questionIndex } = action.payload;
      const game = findGameById(newState, gameId);

      if (!game) {
        return reject(state, ERROR.GAME_NOT_FOUND);
      }

      const error = validateEndQuestion({ game, questionIndex });

      if (error) {
        return reject(state, error);
      }

      const question = game.questions[questionIndex];
      const questionStartTime = game.questionStartTime;

      const playerResults: PlayerResult[] = game.players.map((player) => {
        const playerAnswer = game.playerAnswers.get(player.index);
        const answered = Boolean(playerAnswer);
        const correct = Boolean(
          playerAnswer && playerAnswer.answerIndex === question.correctIndex,
        );
        const pointsEarned =
          correct && playerAnswer && questionStartTime != null
            ? calculatePoints({
                timeLimitSec: question.timeLimitSec,
                questionStartTime,
                answeredAt: playerAnswer.timestamp,
              })
            : 0;

        player.score += pointsEarned;

        return {
          name: player.name,
          answered,
          correct,
          pointsEarned,
          totalScore: player.score,
        };
      });

      const questionResultMessage: QuestionResultMessage = {
        questionIndex,
        correctIndex: question.correctIndex,
        playerResults,
      };

      return {
        state: newState,
        result: {
          success: true,
          data: questionResultMessage,
          game,
        },
      };
    }

    case GAME_ACTION.NEXT_QUESTION: {
      const { gameId } = action.payload;
      const game = findGameById(newState, gameId);

      if (!game) {
        return reject(state, ERROR.GAME_NOT_FOUND);
      }

      if (game.status !== "in_progress") {
        return reject(state, ERROR.GAME_NOT_IN_PROGRESS);
      }

      const nextQuestionIndex = game.currentQuestion + 1;

      if (nextQuestionIndex >= game.questions.length) {
        game.status = "finished";

        const gameFinishedMessage: GameFinishedMessage = {
          scoreboard: buildScoreboard(game),
        };

        return {
          state: newState,
          result: {
            success: true,
            data: gameFinishedMessage,
            game,
          },
        };
      }

      const questionMessage = startQuestion(game, nextQuestionIndex);

      return {
        state: newState,
        result: {
          success: true,
          data: questionMessage,
          game,
        },
      };
    }

    case GAME_ACTION.REMOVE_PLAYER: {
      const { playerIndex } = action.payload;
      const game = [...newState.values()].find((g) =>
        g.players.some((p) => p.index === playerIndex),
      );

      if (!game) {
        return reject(state, ERROR.NOT_A_PLAYER);
      }

      game.players = game.players.filter((p) => p.index !== playerIndex);
      game.playerAnswers.delete(playerIndex);

      return {
        state: newState,
        result: {
          success: true,
          data: {},
          game,
        },
      };
    }

    default:
      return reject(state, ERROR.UNEXPECTED_ERROR);
  }
};
