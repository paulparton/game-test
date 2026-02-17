/**
 * Game constants and configuration
 */

import { PuyoColor } from './types';

// Board dimensions
export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;
export const VISIBLE_HEIGHT = 12;

// Piece dimensions
export const PUYO_SIZE = 32; // pixels
export const PIECE_SIZE = 2; // standard Puyo piece is 2x2

// Game timings (in milliseconds)
export const BASE_FALL_SPEED = 500; // ms per row
export const SOFT_DROP_MULTIPLIER = 0.3; // 1/3 speed
export const PIECE_LOCK_DELAY = 500; // ms before piece locks
export const CLEAR_ANIMATION_TIME = 300; // ms for clear animation
export const GARBAGE_DELAY = 200; // ms before garbage lands

// Scoring
export const BASE_CHAIN_SCORE = 100;
export const CHAIN_MULTIPLIER = 1.5;
export const COLOR_BONUS_MULTIPLIER = 1.2;
export const POSITION_MULTIPLIER_BASE = 2;

// Match conditions
export const MIN_MATCH = 4; // Minimum puyos to match

// Colors available
export const PUYO_COLORS = [PuyoColor.Red, PuyoColor.Blue, PuyoColor.Green, PuyoColor.Yellow];

// Attack system
export const ATTACK_METER_MAX = 100;
export const ATTACK_TIER_1_THRESHOLD = 50; // Unlock tier 1 attacks
export const ATTACK_TIER_2_THRESHOLD = 75; // Unlock tier 2 attacks
export const ATTACK_TIER_3_THRESHOLD = 100; // Unlock tier 3 attacks

// Chain detection bonuses
export const CHAIN_BONUSES = {
  2: 50,
  3: 100,
  4: 200,
  5: 400,
  6: 800,
  7: 1600,
};

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  easy: {
    fallSpeed: 700,
    aiResponseTime: 1500,
    aiChainDepth: 2,
  },
  normal: {
    fallSpeed: 500,
    aiResponseTime: 1000,
    aiChainDepth: 4,
  },
  hard: {
    fallSpeed: 300,
    aiResponseTime: 600,
    aiChainDepth: 6,
  },
  extreme: {
    fallSpeed: 150,
    aiResponseTime: 300,
    aiChainDepth: 8,
  },
};

// UI
export const UI_PADDING = 16;
export const UI_FONT_SIZE = 16;

// Performance
export const TARGET_FPS = 60;
export const DEBUG_MODE = false;
