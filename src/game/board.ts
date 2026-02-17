/**
 * Board logic - handles board state, piece placement, gravity, collisions
 */

import { Puyo, PuyoColor, Position, Piece, Board } from './types';
import { BOARD_WIDTH, BOARD_HEIGHT, PUYO_COLORS, MIN_MATCH } from './constants';

/**
 * Create an empty board
 */
export function createBoard(): Board {
  const grid: Puyo[][] = [];
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    grid[row] = [];
    for (let col = 0; col < BOARD_WIDTH; col++) {
      grid[row][col] = { color: PuyoColor.Empty };
    }
  }
  return {
    grid,
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
  };
}

/**
 * Create a random piece (2x2 Puyo piece with 2 random colors)
 */
export function createRandomPiece(): Piece {
  const color1 = PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
  const color2 = PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];

  // Standard Puyo piece: vertical orientation
  // [0, 0] = color1
  // [1, 0] = color2
  return {
    positions: [
      { row: 0, col: 2 },
      { row: 1, col: 2 },
    ],
    colors: [color1, color2],
    rotation: 0,
    x: 2,
    y: 0,
  };
}

/**
 * Check if a position is valid on the board
 */
export function isValidPosition(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.height && col >= 0 && col < board.width;
}

/**
 * Check if a piece can be placed at given position
 */
export function canPlacePiece(board: Board, piece: Piece): boolean {
  return piece.positions.every((pos) => {
    const row = piece.y + pos.row;
    const col = piece.x + pos.col;
    if (!isValidPosition(board, row, col)) {
      return false;
    }
    const cell = board.grid[row][col];
    return cell.color === PuyoColor.Empty;
  });
}

/**
 * Place a piece on the board
 */
export function placePiece(board: Board, piece: Piece): Board {
  const newBoard = JSON.parse(JSON.stringify(board));

  piece.positions.forEach((pos, index) => {
    const row = piece.y + pos.row;
    const col = piece.x + pos.col;

    if (isValidPosition(newBoard, row, col)) {
      newBoard.grid[row][col] = {
        color: piece.colors[index],
      };
    }
  });

  return newBoard;
}

/**
 * Move piece left
 */
export function movePieceLeft(board: Board, piece: Piece): Piece {
  const newPiece = { ...piece, x: piece.x - 1 };
  return canPlacePiece(board, newPiece) ? newPiece : piece;
}

/**
 * Move piece right
 */
export function movePieceRight(board: Board, piece: Piece): Piece {
  const newPiece = { ...piece, x: piece.x + 1 };
  return canPlacePiece(board, newPiece) ? newPiece : piece;
}

/**
 * Move piece down
 */
export function movePieceDown(board: Board, piece: Piece): Piece | null {
  const newPiece = { ...piece, y: piece.y + 1 };
  return canPlacePiece(board, newPiece) ? newPiece : null;
}

/**
 * Check if piece can move down
 */
export function canMovePieceDown(board: Board, piece: Piece): boolean {
  const newPiece = { ...piece, y: piece.y + 1 };
  return canPlacePiece(board, newPiece);
}

/**
 * Apply gravity - drop all unsupported puyos
 */
export function applyGravity(board: Board): Board {
  const newBoard = JSON.parse(JSON.stringify(board));

  for (let col = 0; col < board.width; col++) {
    let emptyCount = 0;

    for (let row = board.height - 1; row >= 0; row--) {
      if (newBoard.grid[row][col].color === PuyoColor.Empty) {
        emptyCount++;
      } else if (emptyCount > 0) {
        const temp = newBoard.grid[row][col];
        newBoard.grid[row + emptyCount][col] = temp;
        newBoard.grid[row][col] = { color: PuyoColor.Empty };
      }
    }
  }

  return newBoard;
}

/**
 * Get all adjacent puyos of same color
 */
function getAdjacentSameColor(
  board: Board,
  row: number,
  col: number,
  color: PuyoColor,
  visited: Set<string>
): Position[] {
  if (!isValidPosition(board, row, col)) return [];
  if (board.grid[row][col].color !== color) return [];

  const key = `${row},${col}`;
  if (visited.has(key)) return [];

  visited.add(key);
  let result: Position[] = [{ row, col }];

  // Check all 4 directions
  const neighbors = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];

  neighbors.forEach(({ row: r, col: c }) => {
    result = result.concat(getAdjacentSameColor(board, r, c, color, visited));
  });

  return result;
}

/**
 * Detect all chains (matched puyos)
 */
export function detectMatches(board: Board): Position[] {
  const matched: Set<string> = new Set();

  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      const color = board.grid[row][col].color;

      if (color === PuyoColor.Empty || color === PuyoColor.Garbage) continue;

      const key = `${row},${col}`;
      if (matched.has(key)) continue;

      const visited = new Set<string>();
      const group = getAdjacentSameColor(board, row, col, color, visited);

      if (group.length >= MIN_MATCH) {
        group.forEach(({ row: r, col: c }) => {
          matched.add(`${r},${c}`);
        });
      }
    }
  }

  return Array.from(matched).map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

/**
 * Clear matched puyos from board
 */
export function clearMatches(board: Board, positions: Position[]): Board {
  const newBoard = JSON.parse(JSON.stringify(board));

  positions.forEach(({ row, col }) => {
    newBoard.grid[row][col] = { color: PuyoColor.Empty };
  });

  return applyGravity(newBoard);
}

/**
 * Calculate chain depth by detecting cascading matches
 */
export function detectChains(initialBoard: Board): { board: Board; chainCount: number } {
  let board = JSON.parse(JSON.stringify(initialBoard));
  let chainCount = 0;

  while (true) {
    const matches = detectMatches(board);
    if (matches.length === 0) break;

    chainCount++;
    board = clearMatches(board, matches);
  }

  return { board, chainCount };
}

/**
 * Add garbage blocks to board (bottom rows)
 */
export function addGarbage(board: Board, rows: number): Board {
  const newBoard = JSON.parse(JSON.stringify(board));

  // Shift board up and add garbage at bottom
  for (let r = rows; r < newBoard.height; r++) {
    for (let c = 0; c < newBoard.width; c++) {
      newBoard.grid[r - rows][c] = newBoard.grid[r][c];
    }
  }

  // Add garbage with one empty column (hole)
  for (let r = newBoard.height - rows; r < newBoard.height; r++) {
    for (let c = 0; c < newBoard.width; c++) {
      // Random hole position
      const hole = Math.floor(Math.random() * newBoard.width);
      newBoard.grid[r][c] = {
        color: c === hole ? PuyoColor.Empty : PuyoColor.Garbage,
      };
    }
  }

  return newBoard;
}

/**
 * Check if board is full (game over)
 */
export function isBoardFull(board: Board): boolean {
  // Check if any piece can be placed at spawn position
  for (let col = 0; col < BOARD_WIDTH; col++) {
    if (board.grid[0][col].color === PuyoColor.Empty) {
      return false;
    }
  }
  return true;
}

/**
 * Clone board
 */
export function cloneBoard(board: Board): Board {
  return JSON.parse(JSON.stringify(board));
}

/**
 * Rotate piece 90 degrees clockwise
 * Puyo pieces are 2-block pieces that rotate between vertical and horizontal
 */
export function rotatePiece(piece: Piece, board: Board): Piece | null {
  const newPiece = { ...piece, rotation: (piece.rotation + 1) % 2 };

  // For a 2-block puyo piece, rotate between two states:
  // Rotation 0 (vertical): [[0, 0], [1, 0]]  - one above the other
  // Rotation 1 (horizontal): [[0, 0], [0, 1]] - side by side
  let rotatedPositions;
  
  if (piece.rotation === 0) {
    // Vertical to horizontal
    rotatedPositions = [
      { row: 0, col: 0 },
      { row: 0, col: 1 }
    ];
  } else {
    // Horizontal to vertical
    rotatedPositions = [
      { row: 0, col: 0 },
      { row: 1, col: 0 }
    ];
  }

  newPiece.positions = rotatedPositions;

  // Check if new position is valid
  if (canPlacePiece(board, newPiece)) {
    return newPiece;
  }

  // Try wall kick - shift left/right to fit
  for (let shift = 1; shift <= 2; shift++) {
    // Try right shift
    const rightShifted = {
      ...newPiece,
      x: newPiece.x + shift,
    };
    if (canPlacePiece(board, rightShifted)) {
      return rightShifted;
    }

    // Try left shift
    const leftShifted = {
      ...newPiece,
      x: newPiece.x - shift,
    };
    if (canPlacePiece(board, leftShifted)) {
      return leftShifted;
    }
  }

  // Rotation not possible
  return null;
}
