import { randomUUID } from 'node:crypto';
import { CLIENT_MSG } from '../constants';
import { RegResponseData, User, UserAction } from '../types';
import { Logger } from '../utils/logger';

export interface Result {
  success: boolean;
  data: RegResponseData;
}

interface ReturnedResult {
  state: Map<string, User>;
  result: Result;
}

export const userReducer = (
  state: Map<string, User>,
  action: UserAction
): ReturnedResult => {
  const newState = new Map(state);
  const { name, password } = action.payload;

  switch (action.type) {
    case CLIENT_MSG.REGISTER:
      const isRegistered = state.has(name);

      if (isRegistered) {
        const user = state.get(name)!; // ! - to avoid double check that user exists

        if (user.password === password) {
          Logger.user(`✅ Successful login for user: ${name}`);
          return {
            state: newState,
            result: {
              success: true,
              data: { name, index: user.index, error: false, errorText: '' },
            },
          };
        } else {
          Logger.error(`❌ Wrong password for user: ${name}`);
          return {
            state: newState,
            result: {
              success: false,
              data: {
                name,
                index: user.index,
                error: true,
                errorText: 'Wrong password',
              },
            },
          };
        }
      }

      const index = randomUUID();
      newState.set(name, { name, password, index });
      Logger.user(`✅ User ${name} successfully registered`);

      return {
        state: newState,
        result: {
          success: true,
          data: { name, index, error: false, errorText: '' },
        },
      };

    default:
      return {
        state: newState,
        result: {
          success: true,
          data: { name, index: '', error: false, errorText: '' },
        },
      };
  }
};
