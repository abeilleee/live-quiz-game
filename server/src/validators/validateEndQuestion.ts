import { ERROR } from "../constants";
import { Game } from "../types";

export const validateEndQuestion = ({
  game,
  questionIndex,
}: {
  game: Game;
  questionIndex: number;
}) => {
  if (game.status !== "in_progress") {
    return ERROR.GAME_NOT_IN_PROGRESS;
  }

  if (game.currentQuestion !== questionIndex) {
    return ERROR.WRONG_QUESTION;
  }

  return null;
};
