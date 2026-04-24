import { randomUUID } from 'node:crypto';
import { CLIENT_MSG } from '../constants';
import { Game, GameAction } from '../types';
import { generateCode } from '../utils/generateCode';
import { Logger } from '../utils/logger';

export const gameReducer = (state: Map<string, Game>, action: GameAction) => {
  const newState = new Map(state);

  switch (action.type) {
    case CLIENT_MSG.CREATE_GAME: {
      const { questions, hostId } = action.payload;
      const code = generateCode();
      const gameId = randomUUID();

      newState.set(code, {
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

    case CLIENT_MSG.JOIN_GAME: {
      const { code, player } = action.payload;
      const game = newState.get(code);

      if (!game) {
        Logger.error('❌ Game not found');

        return {
          state: newState,
          result: {
            success: false,
            error: true,
            errorText: 'Game not found',
          },
        };
      }

      if (game.status !== 'waiting') {
        Logger.warning('⚠️ Game already started');

        return {
          state: newState,
          result: {
            success: false,
            error: true,
            errorText: 'Game already started',
          },
        };
      }

      const alreadyInGame = game.players.some(
        (existingPlayer) => existingPlayer.index === player.index
      );

      if (!alreadyInGame) {
        game.players.push(player);
      }

      Logger.success('🎲 Successfully join to game');

      return {
        state: newState,
        result: {
          success: true,
          error: false,
          errorText: '',
          gameId: game.id,
          players: game.players,
          joinedPlayerName: player.name,
        },
      };
    }

    case CLIENT_MSG.START_GAME: {
      const { gameId, hostId } = action.payload;

      let game: Game | undefined;
      for (const [, g] of newState) {
        if (g.id === gameId) {
          game = g;
          break;
        }
      }

      if (!game) {
        Logger.error('❌ Game not found');

        return {
          state: newState,
          result: {
            success: false,
            errorText: 'Game not found',
          },
        };
      }

      if (String(game.hostId) !== String(hostId)) {
        Logger.warning('⚠️ Start_game: not the host');

        return {
          state: newState,
          result: {
            success: false,
            errorText: 'Only the host can start the game',
          },
        };
      }

      game.status = 'in_progress';
      game.currentQuestion = 0;
      game.playerAnswers = new Map();
      game.questionStartTime = Date.now();

      const first = game.questions[0];
      const questionPayload = {
        questionNumber: 1,
        totalQuestions: game.questions.length,
        text: first.text,
        options: first.options,
        timeLimitSec: first.timeLimitSec,
      };

      Logger.success('🎮 Game started — question 1 sent');

      return {
        state: newState,
        result: {
          success: true,
          errorText: '',
          game,
          question: questionPayload,
        },
      };
    }

    default:
      return { state: newState, result: { gameId: '', code: '' } };
  }
};
