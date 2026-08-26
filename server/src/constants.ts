export const OPTIONS_PER_QUESTION = 4;
export const BASE_IDX = 0;

export enum CLIENT_MSG {
  REGISTER = "reg",
  CREATE_GAME = "create_game",
  JOIN_GAME = "join_game",
  START_GAME = "start_game",
  ANSWER = "answer",
}

export enum SERVER_MSG {
  REGISTER = "reg",
  GAME_CREATED = "game_created",
  GAME_JOINED = "game_joined",
  PLAYER_JOINED = "player_joined",
  UPDATE_PLAYERS = "update_players",
  QUESTION = "question",
  ANSWER_ACCEPTED = "answer_accepted",
  QUESTION_RESULT = "question_result",
  GAME_FINISHED = "game_finished",
  ERROR = "error",
}

export const enum ERROR {
  UNEXPECTED_ERROR = "Unexpected error",
  WRONG_PASSWORD = "Wrong password",
  NO_QUESTIONS = "No questions provided",
  INVALID_QUESTIONS = "Invalid questions",
  UNREGISTERED = "Please register first",
  FAILED_TO_CREATE_GAME = "Failed to create game",
  FAILED_TO_JOIN_GAME = "Failed to join game",
  NOT_HOST = "Not the host",
  GAME_NOT_FOUND = "Game not found",
  GAME_ALREADY_STARTED = "Game already started",
  NO_PLAYERS = "No players in the game",
  GAME_NOT_IN_PROGRESS = "Game is not in progress",
  WRONG_QUESTION = "Wrong question",
  NOT_A_PLAYER = "Not a player in this game",
  ALREADY_ANSWERED = "Already answered",
  INVALID_ANSWER = "Invalid answer",
}
