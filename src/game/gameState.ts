import { create } from 'zustand';
import {
  GameState,
  PlayerState,
  GameMode,
  Difficulty,
  PuyoColor,
} from './types';
import {
  createBoard,
  createRandomPiece,
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  rotatePiece,
  placePiece,
  detectChains,
  addGarbage,
} from './board';
import { ATTACK_METER_MAX } from './constants';

interface GameStore {
  // State
  player1: PlayerState;
  player2: PlayerState;
  gameMode: GameMode;
  difficulty: Difficulty;
  isGameActive: boolean;
  currentPlayer: number;

  // Actions
  initializeGame: (mode: GameMode, difficulty: Difficulty) => void;
  updatePlayerGameState: (playerNum: number, gameState: GameState) => void;
  movePieceLeftAction: (playerNum: number) => void;
  movePieceRightAction: (playerNum: number) => void;
  dropPieceAction: (playerNum: number) => void;
  rotatePieceAction: (playerNum: number) => void;
  lockPieceAction: (playerNum: number) => void;
  addChainDamage: (toPlayer: number, damage: number) => void;
  setGameActive: (active: boolean) => void;
  resetGame: () => void;
}

const createInitialGameState = (): GameState => ({
  board: createBoard(),
  currentPiece: createRandomPiece(),
  nextPiece: createRandomPiece(),
  score: 0,
  level: 1,
  lines: 0,
  chainCount: 0,
  isGameOver: false,
  isPaused: false,
});

const createInitialPlayerState = (id: string): PlayerState => ({
  id,
  gameState: createInitialGameState(),
  attackMeter: 0,
  activeAttacks: [],
  wins: 0,
  losses: 0,
});

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  player1: createInitialPlayerState('player1'),
  player2: createInitialPlayerState('player2'),
  gameMode: 'ai',
  difficulty: 'normal',
  isGameActive: false,
  currentPlayer: 1,

  // Actions
  initializeGame: (mode: GameMode, difficulty: Difficulty) => {
    set(() => ({
      gameMode: mode,
      difficulty: difficulty,
      player1: createInitialPlayerState('player1'),
      player2: createInitialPlayerState('player2'),
      isGameActive: true,
      currentPlayer: 1,
    }));
  },

  updatePlayerGameState: (playerNum: number, gameState: GameState) => {
    set((state) => ({
      ...state,
      ...(playerNum === 1 ? { player1: { ...state.player1, gameState } } : { player2: { ...state.player2, gameState } }),
    }));
  },

  movePieceLeftAction: (playerNum: number) => {
    set((state) => {
      const player = playerNum === 1 ? state.player1 : state.player2;
      if (!player.gameState.currentPiece) return state;

      const newPiece = movePieceLeft(player.gameState.board, player.gameState.currentPiece);
      const updatedPlayer = {
        ...player,
        gameState: { ...player.gameState, currentPiece: newPiece },
      };

      return playerNum === 1
        ? { ...state, player1: updatedPlayer }
        : { ...state, player2: updatedPlayer };
    });
  },

  movePieceRightAction: (playerNum: number) => {
    set((state) => {
      const player = playerNum === 1 ? state.player1 : state.player2;
      if (!player.gameState.currentPiece) return state;

      const newPiece = movePieceRight(player.gameState.board, player.gameState.currentPiece);
      const updatedPlayer = {
        ...player,
        gameState: { ...player.gameState, currentPiece: newPiece },
      };

      return playerNum === 1
        ? { ...state, player1: updatedPlayer }
        : { ...state, player2: updatedPlayer };
    });
  },

  dropPieceAction: (playerNum: number) => {
    set((state) => {
      const player = playerNum === 1 ? state.player1 : state.player2;
      if (!player.gameState.currentPiece) return state;

      const newPiece = movePieceDown(player.gameState.board, player.gameState.currentPiece);
      if (!newPiece) return state;

      const updatedPlayer = {
        ...player,
        gameState: { ...player.gameState, currentPiece: newPiece },
      };

      return playerNum === 1
        ? { ...state, player1: updatedPlayer }
        : { ...state, player2: updatedPlayer };
    });
  },

  rotatePieceAction: (playerNum: number) => {
    set((state) => {
      const player = playerNum === 1 ? state.player1 : state.player2;
      if (!player.gameState.currentPiece) return state;

      const rotated = rotatePiece(player.gameState.currentPiece, player.gameState.board);
      if (!rotated) return state;

      const updatedPlayer = {
        ...player,
        gameState: { ...player.gameState, currentPiece: rotated },
      };

      return playerNum === 1
        ? { ...state, player1: updatedPlayer }
        : { ...state, player2: updatedPlayer };
    });
  },

  lockPieceAction: (playerNum: number) => {
    set((state) => {
      const player = playerNum === 1 ? state.player1 : state.player2;
      if (!player.gameState.currentPiece) return state;

      // Place piece on board
      let newBoard = placePiece(player.gameState.board, player.gameState.currentPiece);

      // Detect chains and clear
      const result = detectChains(newBoard);
      newBoard = result.board;

      // Calculate score
      const chainBonus = result.chainCount > 0 ? Math.pow(2, result.chainCount) * 100 : 0;
      const newScore = player.gameState.score + chainBonus;

      // Spawn next piece
      const nextCurrent = player.gameState.nextPiece;
      const nextNext = createRandomPiece();

      // Check for game over
      const isGameOver =
        !nextCurrent || newBoard.grid[0].every((p) => p.color !== PuyoColor.Empty);

      // Update attack meter
      let newMeter = player.attackMeter;
      if (result.chainCount > 0) {
        newMeter = Math.min(newMeter + 20 * result.chainCount, ATTACK_METER_MAX);
      }

      const updatedPlayer = {
        ...player,
        gameState: {
          ...player.gameState,
          board: newBoard,
          currentPiece: nextCurrent,
          nextPiece: nextNext,
          score: newScore,
          chainCount: result.chainCount,
          isGameOver,
        },
        attackMeter: newMeter,
      };

      const newState =
        playerNum === 1
          ? { ...state, player1: updatedPlayer }
          : { ...state, player2: updatedPlayer };

      if (isGameOver) {
        newState.isGameActive = false;
      }

      return newState;
    });
  },

  addChainDamage: (toPlayer: number, damage: number) => {
    set((state) => {
      const player = toPlayer === 1 ? state.player1 : state.player2;
      const newBoard = addGarbage(player.gameState.board, Math.ceil(damage / 6));
      const updatedPlayer = {
        ...player,
        gameState: { ...player.gameState, board: newBoard },
      };

      return toPlayer === 1
        ? { ...state, player1: updatedPlayer }
        : { ...state, player2: updatedPlayer };
    });
  },

  setGameActive: (active: boolean) => {
    set(() => ({
      isGameActive: active,
    }));
  },

  resetGame: () => {
    set(() => ({
      player1: createInitialPlayerState('player1'),
      player2: createInitialPlayerState('player2'),
      isGameActive: false,
    }));
  },
}));
