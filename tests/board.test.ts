/**
 * Tests for board logic
 */

import { describe, it, expect } from 'vitest';
import {
  createBoard,
  createRandomPiece,
  isValidPosition,
  canPlacePiece,
  placePiece,
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  applyGravity,
  detectMatches,
  detectChains,
} from '../src/game/board';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../src/game/constants';
import { PuyoColor } from '../src/game/types';

describe('Board Logic', () => {
  describe('createBoard', () => {
    it('creates a board with correct dimensions', () => {
      const board = createBoard();
      expect(board.width).toBe(BOARD_WIDTH);
      expect(board.height).toBe(BOARD_HEIGHT);
      expect(board.grid.length).toBe(BOARD_HEIGHT);
      expect(board.grid[0].length).toBe(BOARD_WIDTH);
    });

    it('initializes all cells as empty', () => {
      const board = createBoard();
      board.grid.forEach((row) => {
        row.forEach((puyo) => {
          expect(puyo.color).toBe(PuyoColor.Empty);
        });
      });
    });
  });

  describe('createRandomPiece', () => {
    it('creates a piece with 2 positions', () => {
      const piece = createRandomPiece();
      expect(piece.positions.length).toBe(2);
    });

    it('piece colors are valid', () => {
      const piece = createRandomPiece();
      const validColors = [PuyoColor.Red, PuyoColor.Blue, PuyoColor.Green, PuyoColor.Yellow];
      piece.colors.forEach((color) => {
        expect(validColors).toContain(color);
      });
    });

    it('piece starts at correct position', () => {
      const piece = createRandomPiece();
      expect(piece.x).toBe(2);
      expect(piece.y).toBe(0);
    });
  });

  describe('isValidPosition', () => {
    it('accepts valid positions', () => {
      const board = createBoard();
      expect(isValidPosition(board, 0, 0)).toBe(true);
      expect(isValidPosition(board, BOARD_HEIGHT - 1, BOARD_WIDTH - 1)).toBe(true);
    });

    it('rejects negative positions', () => {
      const board = createBoard();
      expect(isValidPosition(board, -1, 0)).toBe(false);
      expect(isValidPosition(board, 0, -1)).toBe(false);
    });

    it('rejects positions beyond board', () => {
      const board = createBoard();
      expect(isValidPosition(board, BOARD_HEIGHT, 0)).toBe(false);
      expect(isValidPosition(board, 0, BOARD_WIDTH)).toBe(false);
    });
  });

  describe('Movement', () => {
    it('moves piece left', () => {
      const board = createBoard();
      const piece = createRandomPiece();
      const initialX = piece.x;

      const moved = movePieceLeft(board, piece);
      expect(moved.x).toBe(initialX - 1);
    });

    it('moves piece right', () => {
      const board = createBoard();
      const piece = createRandomPiece();
      const initialX = piece.x;

      const moved = movePieceRight(board, piece);
      expect(moved.x).toBe(initialX + 1);
    });

    it('moves piece down', () => {
      const board = createBoard();
      const piece = createRandomPiece();
      const initialY = piece.y;

      const moved = movePieceDown(board, piece);
      expect(moved).not.toBeNull();
        expect(moved!.y).toBe(initialY + 1);
    });

    it('prevents moving into occupied space', () => {
      const board = createBoard();
      board.grid[1][2].color = PuyoColor.Red;

      const piece = createRandomPiece();
      const moved = movePieceDown(board, piece);
      expect(moved).toBeNull();
    });
  });

  describe('Piece Placement', () => {
    it('places piece on board', () => {
      const board = createBoard();
      const piece = createRandomPiece();

      const newBoard = placePiece(board, piece);
      piece.positions.forEach((pos, idx) => {
        const row = piece.y + pos.row;
        const col = piece.x + pos.col;
        expect(newBoard.grid[row][col].color).toBe(piece.colors[idx]);
      });
    });
  });

  describe('Gravity', () => {
    it('applies gravity correctly', () => {
      const board = createBoard();
      board.grid[5][0].color = PuyoColor.Red;
      board.grid[6][0].color = PuyoColor.Empty;
      board.grid[7][0].color = PuyoColor.Empty;

      const result = applyGravity(board);
      expect(result.grid[5][0].color).toBe(PuyoColor.Empty);
      expect(result.grid[7][0].color).toBe(PuyoColor.Red);
    });

    it('stacks multiple pieces', () => {
      const board = createBoard();
      board.grid[4][0].color = PuyoColor.Red;
      board.grid[5][0].color = PuyoColor.Blue;
      board.grid[6][0].color = PuyoColor.Empty;
      board.grid[7][0].color = PuyoColor.Empty;

      const result = applyGravity(board);
      expect(result.grid[6][0].color).toBe(PuyoColor.Red);
      expect(result.grid[7][0].color).toBe(PuyoColor.Blue);
    });
  });

  describe('Chain Detection', () => {
    it('detects horizontal matches', () => {
      const board = createBoard();
      // Create a 4-in-a-row
      board.grid[10][0].color = PuyoColor.Red;
      board.grid[10][1].color = PuyoColor.Red;
      board.grid[10][2].color = PuyoColor.Red;
      board.grid[10][3].color = PuyoColor.Red;

      const matches = detectMatches(board);
      expect(matches.length).toBe(4);
    });

    it('detects vertical matches', () => {
      const board = createBoard();
      // Create a 4-in-a-column
      board.grid[8][0].color = PuyoColor.Blue;
      board.grid[9][0].color = PuyoColor.Blue;
      board.grid[10][0].color = PuyoColor.Blue;
      board.grid[11][0].color = PuyoColor.Blue;

      const matches = detectMatches(board);
      expect(matches.length).toBe(4);
    });

    it('ignores matches less than 4', () => {
      const board = createBoard();
      board.grid[10][0].color = PuyoColor.Red;
      board.grid[10][1].color = PuyoColor.Red;
      board.grid[10][2].color = PuyoColor.Red;

      const matches = detectMatches(board);
      expect(matches.length).toBe(0);
    });
  });

  describe('Full Game Sequence', () => {
    it('handles piece placement and chain detection', () => {
      const board = createBoard();

      // Setup a chain scenario
      for (let i = 0; i < 4; i++) {
        board.grid[11][i].color = PuyoColor.Red;
      }

      const { board: resultBoard, chainCount } = detectChains(board);
      expect(chainCount).toBeGreaterThan(0);
      // After clearing, those cells should be empty or have dropped puyos
      expect(resultBoard.grid[11][0].color).not.toBe(PuyoColor.Red);
    });
  });
});
