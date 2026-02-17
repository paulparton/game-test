/**
 * Input handling system - manages keyboard input with separate controls for each player
 * 
 * Player 1 Controls (Arrow Keys):
 * - Left/Right: Move piece left/right
 * - Down: Soft drop
 * - Space/Up: Rotate
 * - Enter: Hard drop
 * 
 * Player 2 Controls (WASD):
 * - A/D: Move piece left/right
 * - S: Soft drop
 * - W: Rotate
 * - Q: Hard drop
 * 
 * Shared:
 * - P / Escape: Pause/Resume
 */

interface InputState {
  // Player 1 (Arrow keys)
  p1Left: boolean;
  p1Right: boolean;
  p1Down: boolean;
  p1Rotate: boolean;
  p1Drop: boolean;
  
  // Player 2 (WASD)
  p2Left: boolean;
  p2Right: boolean;
  p2Down: boolean;
  p2Rotate: boolean;
  p2Drop: boolean;
  
  // Shared
  pause: boolean;
}

interface InputManager {
  state: InputState;
  listeners: Map<string, Function[]>;
  update: () => void;
  subscribe: (event: string, callback: Function) => void;
}

/**
 * Create input manager with separate player controls
 */
export function createInputManager(): InputManager {
  const state: InputState = {
    // Player 1
    p1Left: false,
    p1Right: false,
    p1Down: false,
    p1Rotate: false,
    p1Drop: false,
    
    // Player 2
    p2Left: false,
    p2Right: false,
    p2Down: false,
    p2Rotate: false,
    p2Drop: false,
    
    // Shared
    pause: false,
  };

  const listeners = new Map<string, Function[]>();

  /**
   * Handle keyboard events with player-specific controls
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    // Player 1 controls (Arrow Keys)
    if (key === 'arrowleft') {
      e.preventDefault();
      state.p1Left = true;
      emit('p1-move-left');
    }
    if (key === 'arrowright') {
      e.preventDefault();
      state.p1Right = true;
      emit('p1-move-right');
    }
    if (key === 'arrowdown') {
      e.preventDefault();
      state.p1Down = true;
      emit('p1-soft-drop');
    }
    if (key === 'arrowup') {
      e.preventDefault();
      state.p1Rotate = true;
      emit('p1-rotate');
    }
    if (key === ' ') {
      e.preventDefault();
      state.p1Rotate = true;
      emit('p1-rotate');
    }
    if (key === 'enter') {
      e.preventDefault();
      state.p1Drop = true;
      emit('p1-hard-drop');
    }

    // Player 2 controls (WASD)
    if (key === 'a') {
      state.p2Left = true;
      emit('p2-move-left');
    }
    if (key === 'd') {
      state.p2Right = true;
      emit('p2-move-right');
    }
    if (key === 's') {
      e.preventDefault();
      state.p2Down = true;
      emit('p2-soft-drop');
    }
    if (key === 'w') {
      e.preventDefault();
      state.p2Rotate = true;
      emit('p2-rotate');
    }
    if (key === 'q') {
      state.p2Drop = true;
      emit('p2-hard-drop');
    }

    // Shared controls
    if (key === 'escape') {
      e.preventDefault();
      state.pause = true;
      emit('pause');
    }
    if (key === 'p') {
      state.pause = true;
      emit('pause');
    }
  };

  const handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    // Player 1 (Arrow keys)
    if (key === 'arrowleft') state.p1Left = false;
    if (key === 'arrowright') state.p1Right = false;
    if (key === 'arrowdown') state.p1Down = false;
    if (key === 'arrowup') state.p1Rotate = false;
    if (key === ' ') state.p1Rotate = false;
    if (key === 'enter') state.p1Drop = false;

    // Player 2 (WASD)
    if (key === 'a') state.p2Left = false;
    if (key === 'd') state.p2Right = false;
    if (key === 's') state.p2Down = false;
    if (key === 'w') state.p2Rotate = false;
    if (key === 'q') state.p2Drop = false;

    // Shared
    if (key === 'escape' || key === 'p') state.pause = false;
  };

  /**
   * Emit event to listeners
   */
  const emit = (eventName: string): void => {
    const callbacks = listeners.get(eventName) || [];
    callbacks.forEach((cb) => cb());
  };

  /**
   * Subscribe to input event
   */
  const subscribe = (event: string, callback: Function): (() => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback as any);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  };

  /**
   * Update input state (call each frame)
   */
  const update = (): void => {
    // Currently keyboard-only, can add gamepad later
  };

  // Add event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    state,
    listeners,
    update,
    subscribe,
  };
}
