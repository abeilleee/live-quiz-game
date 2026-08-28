import { Game, QuestionMessage } from "../types";

export const toQuestionMessage = (game: Game): QuestionMessage => {
  const question = game.questions[game.currentQuestion];

  return {
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
  };
};

export const startQuestion = (
  game: Game,
  questionIndex: number,
): QuestionMessage => {
  game.status = "in_progress";
  game.currentQuestion = questionIndex;
  game.playerAnswers = new Map();
  game.questionStartTime = Date.now();

  return toQuestionMessage(game);
};
