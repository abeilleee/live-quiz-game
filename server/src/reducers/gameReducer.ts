import { randomUUID } from "node:crypto";
import { CLIENT_MSG, ERROR } from "../constants";
import {
  CreateGameData,
  Game,
  GameAction,
  JoinGameData,
  StartGameData,
} from "../types";
import { generateCode } from "../utils/generateCode";
import { Logger } from "../utils/logger";

export interface Result {
  success: boolean;
  data: CreateGameData | JoinGameData | StartGameData | {};
  error?: boolean;
  errorText?: string;
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
    case CLIENT_MSG.CREATE_GAME:
      const { questions, hostId } = action.payload;

      if (!Array.isArray(questions) || questions.length === 0) {
        return {
          state,
          result: {
            success: false,
            data: { error: true, errorText: ERROR.NO_QUESTIONS },
          },
        };
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

    default:
      return { state, result: { success: false, data: {} } };
  }
};
