import { ERROR } from "../constants";
import { Question } from "../types";

const OPTIONS_PER_QUESTION = 4;
const LAST_OPTION_INDEX = OPTIONS_PER_QUESTION - 1;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isValidQuestion = (question: unknown): boolean => {
  if (!question || typeof question !== "object") {
    return false;
  }

  const { text, options, correctIndex, timeLimitSec } = question as Question;

  if (!isNonEmptyString(text)) {
    return false;
  }

  if (!Array.isArray(options) || options.length !== 4) {
    return false;
  }

  if (!options.every(isNonEmptyString)) {
    return false;
  }

  if (
    typeof correctIndex !== "number" ||
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > LAST_OPTION_INDEX
  ) {
    return false;
  }

  if (
    typeof timeLimitSec !== "number" ||
    !Number.isFinite(timeLimitSec) ||
    timeLimitSec <= 0
  ) {
    return false;
  }

  return true;
};

export const validateQuestions = (questions: unknown): string | null => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return ERROR.NO_QUESTIONS;
  }

  if (!questions.every(isValidQuestion)) {
    return ERROR.INVALID_QUESTIONS;
  }

  return null;
};
