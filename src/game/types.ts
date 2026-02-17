/**
 * Core game type definitions for Puyo Puyo
 */

export enum PuyoColor {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Yellow = 'yellow',
  Empty = 'empty',
  Garbage = 'garbage',
}

export interface Puyo {
  color: PuyoColor;
  isLocked?: boolean;
  isMatched?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  positions: Position[];
  colors: PuyoColor[];
  rotation: number;
  x: number;
  y: number;
}

export interface Board {
  grid: Puyo[][];
  width: number;
  height: number;
}

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  chainCount: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface PlayerState {
  id: string;
  gameState: GameState;
  attackMeter: number;
  activeAttacks: string[];
  wins: number;
  losses: number;
}

export interface ChainEvent {
  positions: Position[];
  depth: number;
  damage: number;
}

export type GameMode = 'single-player' | 'two-player' | 'ai';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'extreme';
