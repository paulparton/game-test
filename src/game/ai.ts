/**
 * AI opponent logic
 */

import { Board, Piece, GameState } from './types';
import {
  canMovePieceDown,
  movePieceLeft,
  movePieceRight,
  movePieceDown,
  placePiece,
  detectChains,
} from './board';

/**
 * Evaluate board state for AI decision making
 */
export function evaluateBoard(board: Board, chainCount: number): number {
  let score = 0;

  // Award points for chains
  score += chainCount * 1000;

  // Penalize high board (more pieces = worse position)
  let highestPiece = 0;
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      if (board.grid[row][col].color !== 'empty') {
        highestPiece = Math.min(highestPiece, row);
      }
    }
  }
  score -= Math.abs(highestPiece) * 100;

  // Reward balanced piece distribution
  const columHeights: number[] = [];
  for (let col = 0; col < board.width; col++) {
    for (let row = board.height - 1; row >= 0; row--) {
      if (board.grid[row][col].color !== 'empty') {
        columHeights[col] = board.height - row;
        break;
      }
    }
  }

  const heightVariance =
    columHeights.reduce((a, b) => a + Math.abs(b - columHeights[0]), 0) / columHeights.length;
  score -= heightVariance * 50;

  return score;
}

/**
 * Get all possible moves for a piece
 */
export function getPossibleMoves(board: Board, piece: Piece): Piece[] {
  const moves: Piece[] = [];

  // Try all horizontal positions
  let currentPiece = { ...piece };

  // Move left
  while (true) {
    const left = movePieceLeft(board, currentPiece);
    if (left.x === currentPiece.x) break;
    currentPiece = left;
    moves.push({ ...currentPiece });
  }

  // Reset to start
  currentPiece = { ...piece };

  // Move right
  while (true) {
    const right = movePieceRight(board, currentPiece);
    if (right.x === currentPiece.x) break;
    currentPiece = right;
    moves.push({ ...currentPiece });
  }

  return moves;
}

/**
 * Simulate dropping a piece and return resulting board
 */
export function simulateDrop(board: Board, piece: Piece): { board: Board; chainCount: number } {
  let currentPiece = { ...piece };

  while (canMovePieceDown(board, currentPiece)) {
    const next = movePieceDown(board, currentPiece);
    if (!next) break;
    currentPiece = next;
  }

  const newBoard = placePiece(board, currentPiece);
  const result = detectChains(newBoard);

  return result;
}

/**
 * Find best move using greedy evaluation
 */
export function findBestMove(board: Board, piece: Piece, _depth: number = 1): Piece {
  const possibleMoves = getPossibleMoves(board, piece);

  if (possibleMoves.length === 0) {
    return piece;
  }

  let bestMove = possibleMoves[0];
  let bestScore = -Infinity;

  for (const move of possibleMoves) {
    const result = simulateDrop(board, move);
    const score = evaluateBoard(result.board, result.chainCount);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove || piece;
}

/**
 * Make AI decision with configurable depth
 * Returns the piece position the AI wants to place at
 */
export function getAIMove(gameState: GameState, _difficulty?: string): Piece | null {
  if (!gameState.currentPiece) return null;

  const piece = gameState.currentPiece;

  // Difficulty-based lookahead, currently all use level 1 (immediate best move)
  // Can be extended to deeper minimax in future
  const bestPiece = findBestMove(gameState.board, piece, 1);

  return bestPiece;
}

/**
 * Simple AI tick - called periodically to make moves
 */
export function getAIAction(
  gameState: GameState,
  difficulty: string,
  lastActionTime: number,
  currentTime: number
): 'move-left' | 'move-right' | 'drop' | 'lock' | null {
  // Rate limit AI decisions based on difficulty
  const responseTime =
    difficulty === 'easy'
      ? 1500
      : difficulty === 'normal'
        ? 1000
        : difficulty === 'hard'
          ? 600
          : 300;

  if (currentTime - lastActionTime < responseTime) return null;

  // Every few decisions, plan optimal move
  const bestPiece = getAIMove(gameState, difficulty);
  if (!bestPiece || !gameState.currentPiece) return null;

  // Compare current position with best position
  if (bestPiece.x < gameState.currentPiece.x) {
    return 'move-left';
  } else if (bestPiece.x > gameState.currentPiece.x) {
    return 'move-right';
  }

  // Try to drop piece further
  if (gameState.currentPiece) {
    const canDrop = findBestMove(gameState.board, gameState.currentPiece, 1).y >
      gameState.currentPiece.y;
    if (canDrop) {
      return 'drop';
    }
  }

  // Lock piece when in optimal position
  return 'lock';
}
