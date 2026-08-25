import { randomUUID } from "node:crypto";
import { CLIENT_MSG, ERROR } from "../constants";
import { RegResponseData, User, UserAction } from "../types";
import { Logger } from "../utils/logger";

export interface Result {
  success: boolean;
  data: RegResponseData;
}

interface Response {
  state: Map<string, User>;
  result: Result;
}

export const userReducer = (
  state: Map<string, User>,
  action: UserAction,
): Response => {
  const newState = new Map(state);

  switch (action.type) {
    case CLIENT_MSG.REGISTER:
      const { name, password } = action.payload;
      const isRegistered = newState.has(action.payload.name);

      // If user is already registered
      if (isRegistered) {
        const user = newState.get(name);

        if (user?.password === password) {
          Logger.user(`User ${name} logged in`);

          return {
            state: newState,
            result: {
              success: true,
              data: { name, index: user.index, error: false, errorText: "" },
            },
          };
        } else {
          Logger.error(ERROR.WRONG_PASSWORD);

          return {
            state: newState,
            result: {
              success: false,
              data: {
                name: "",
                index: "",
                error: true,
                errorText: ERROR.WRONG_PASSWORD,
              },
            },
          };
        }
      }

      // Register new user
      const index = randomUUID();

      newState.set(name, {
        name,
        password,
        index,
      });

      return {
        state: newState,
        result: {
          success: true,
          data: { name, index, error: false, errorText: "" },
        },
      };

    default:
      return {
        state: newState,
        result: {
          success: false,
          data: {
            name: "",
            index: "",
            error: true,
            errorText: ERROR.UNEXPECTED_ERROR,
          },
        },
      };
  }
};
