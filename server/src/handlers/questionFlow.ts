import {
  ERROR,
  GAME_ACTION,
  RESULTS_DISPLAY_MS,
  SERVER_MSG,
} from "../constants";
import { gameStore } from "../store/gameStore";
import { Game } from "../types";
import { broadcastToParticipants } from "../utils/broadcastToParticipants";
import { Logger } from "../utils/logger";
import { toQuestionMessage } from "../utils/startQuestion";

/** Broadcast question result and set timer to start next question */
const onQuestionTimeUp = (game: Game, questionIndex: number) => {
  const ended = gameStore.dispatch({
    type: GAME_ACTION.END_QUESTION,
    payload: { gameId: game.id, questionIndex },
  });

  if (!ended.success) {
    Logger.error(ended.errorText ?? ERROR.UNEXPECTED_ERROR);
    return;
  }

  broadcastToParticipants({
    room: game.code,
    payload: {
      type: SERVER_MSG.QUESTION_RESULT,
      data: ended.data,
    },
  });

  game.questionTimer = setTimeout(() => {
    const next = gameStore.dispatch({
      type: GAME_ACTION.NEXT_QUESTION,
      payload: { gameId: game.id },
    });

    if (!next.success || !next.game) {
      Logger.error(next.errorText ?? ERROR.UNEXPECTED_ERROR);

      return;
    }

    if (next.game.status === "finished") {
      if (next.game.questionTimer) {
        clearTimeout(next.game.questionTimer);
        next.game.questionTimer = undefined;
      }

      Logger.success(`Game ${next.game.code} finished`);

      broadcastToParticipants({
        room: next.game.code,
        payload: {
          type: SERVER_MSG.GAME_FINISHED,
          data: next.data,
        },
      });
      return;
    }

    deliverQuestion(next.game);
  }, RESULTS_DISPLAY_MS);
};

/** Broadcast all game participants and start the question timer */
export const deliverQuestion = (game: Game) => {
  const question = game.questions[game.currentQuestion];

  if (!question) {
    Logger.error(ERROR.UNEXPECTED_ERROR);

    return;
  }

  broadcastToParticipants({
    room: game.code,
    payload: {
      type: SERVER_MSG.QUESTION,
      data: toQuestionMessage(game),
    },
  });

  if (game.questionTimer) {
    clearTimeout(game.questionTimer);
  }

  const questionIndex = game.currentQuestion;

  game.questionTimer = setTimeout(() => {
    onQuestionTimeUp(game, questionIndex);
  }, question.timeLimitSec * 1000);
};
