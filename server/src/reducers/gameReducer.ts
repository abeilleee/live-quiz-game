import { randomUUID } from 'node:crypto';
import { SERVER_MSG } from '../constants';
import { Game, GameAction } from '../types';
import { generateCode } from '../utils/generateCode';
import { Logger } from '../utils/logger';

export const gameReducer = (state: Map<string, Game>, action: GameAction) => {
  const newState = new Map(state);

  switch (action.type) {
    case SERVER_MSG.GAME_CREATED: {
      const { questions, hostId } = action.payload;
      const code = generateCode();
      const gameId = randomUUID();

      newState.set(gameId, {
        id: gameId,
        code,
        hostId,
        questions,
        players: [],
        currentQuestion: -1,
        status: 'waiting',
        playerAnswers: new Map(),
      });

      Logger.success('🎲 Game created');

      return {
        state: newState,
        result: { gameId, code },
      };
    }
  }
};
