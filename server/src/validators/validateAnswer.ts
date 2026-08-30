import { ERROR, OPTIONS_PER_QUESTION } from "../constants";
import { AnswerData, Game } from "../types";

export const validateAnswer = (
  playerIndex: string,
  game: Game,
  {
    questionIndex,
    answerIndex,
  }: Pick<AnswerData, "questionIndex" | "answerIndex">,
) => {
  if (game.status !== "in_progress") {
    return ERROR.GAME_NOT_IN_PROGRESS;
  }

  if (game.currentQuestion !== questionIndex) {
    return ERROR.WRONG_QUESTION;
  }

  if (!game.questions[questionIndex]) {
    return ERROR.UNEXPECTED_ERROR;
  }

  if (!game.players.some((player) => player.index === playerIndex)) {
    return ERROR.NOT_A_PLAYER;
  }

  if (game.playerAnswers.has(playerIndex)) {
    return ERROR.ALREADY_ANSWERED;
  }

  if (answerIndex < 0 || answerIndex >= OPTIONS_PER_QUESTION) {
    return ERROR.INVALID_ANSWER;
  }

  return null;
};
