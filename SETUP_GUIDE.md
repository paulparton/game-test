# Puyo Puyo Game - Setup & Debugging Guide

## Overview
The Puyo Puyo game is built with TypeScript, Vite, and Phaser 3.

## Quick Start

### 1. Verify Dev Server is Running
```bash
# From the project directory
npm run dev

# Expected output:
#   VITE v5.4.21 ready in XXX ms
#   ➜  Local: http://localhost:5173/
#   ➜  Network: use --host to expose
```

### 2. Open in a Real Browser
**Important: Use a real browser (Chrome, Firefox, Safari), NOT VS Code's Simple Browser**

```bash
# macOS - Open in Chrome
open http://localhost:5173 -a "Google Chrome"

# macOS - Open in Firefox  
open http://localhost:5173 -a "Firefox"

# Or manually: Visit http://localhost:5173 in your browser
```

### 3. What Should Appear

When you first load the page, you should see:

**Top-Left Corner (Green bordered box):**
- Status messages showing initialization progress
- Should show: "HTML loaded", "App div ready", "Canvas found", etc.
- If you see nothing at all, the page isn't rendering

**Main Canvas Area (1200x800):**
- After ~1-2 seconds, you should see a RED RECTANGLE on a GREEN background
- This is the MinimalScene (debug scene to verify Phaser works)
- A white "CENTER" text in the middle
- Should be interactive when you click

## Diagnostic Tests

### Test 1: Basic HTML Rendering
```
URL: http://localhost:5173/test-html.html
Expected: GREEN background with white text
Purpose: Verify browser can render HTML/CSS at all
```

### Test 2: Canvas 2D API
```
URL: http://localhost:5173/diagnostics.html  
Expected: Green rectangle, diagnostics information
Purpose: Verify Canvas 2D rendering works
```

### Test 3: Phaser Direct
```
URL: http://localhost:5173/phaser-direct.html
Expected: GREEN background with RED rectangle and interactive button
Purpose: Verify Phaser works in isolation
```

### Test 4: Main Game
```
URL: http://localhost:5173/
Expected: Status panel + Game scene with graphics
Purpose: Verify full game setup works
```

## Troubleshooting

### Issue: I see nothing on screen

**Step 1:** Check if you're using the right browser
- Open in Google Chrome or Firefox  
- NOT VS Code's Simple Browser (may not support canvas/WebGL)

**Step 2:** Check the browser console (F12)
- Look for JavaScript errors
- Look for "Canvas found", "Game created" messages
- Take a screenshot of the console

**Step 3:** Try the diagnostic tests in order
- Start with test-html.html (simplest)
- Then diagnostics.html (tests canvas)
- Then phaser-direct.html (tests Phaser)
- Finally the main game

**Step 4:** Check the status panel
- Should appear in top-left corner with green border
- If it appears but says errors, report the error messages

### Issue: Blank white/black screen

**Possible Causes:**
- Browser's Simple Browser doesn't support canvas
- Browser cache isn't cleared
- Vite dev server crashed

**Solutions:**
- Use real browser (Chrome, Firefox, Safari)
- Hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)
- Restart dev server: `npm run dev`

### Issue: Browser shows "Cannot GET /"

**Solution:**
- Check dev server is running: `npm run dev`
- Wait for Vite to be ready (~150ms)
- Try again in browser

### Issue: Code works but nothing renders

**This usually means:**
- Phaser canvas is created but not rendering
- Parent div (#app) might have issues
- WebGL not supported
- Browser doesn't support required APIs

**Debug steps:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Elements/Inspector tab - look for `<canvas>` element
4. Report any errors you see

## File Structure

```
src/
├── main.ts                      # Entry point - creates Phaser game
├── scenes/
│   ├── MinimalScene.ts         # Debug scene (red rect + text)
│   ├── TestScene.ts            # Test scene (more complex graphics)
│   ├── SplashScene.ts          # Splash screen with START button
│   ├── MenuScene.ts            # Mode/difficulty selection  
│   └── GameScene.ts            # Main game
├── game/
│   ├── board.ts                # Game logic
│   ├── gameState.ts            # Zustand state management
│   ├── ai.ts                   # AI system
│   └── types.ts                # TypeScript types
└── input/
    └── inputManager.ts         # Input handling

index.html                       # Main HTML file with #app div
test-html.html                  # Basic HTML/CSS test
test-phaser.html                # Phaser CDN test
diagnostics.html                # Canvas/Phaser diagnostics
phaser-direct.html              # Direct Phaser test (no Vite)
```

## Expected Behavior Timeline

1. **0ms**: Page loads
2. **~50ms**: HTML parsed, #status div visible with green border
3. **~100ms**: Vite bundling complete, TypeScript loaded
4. **~150ms**: Phaser library loads
5. **~200ms**: Phaser.Game() executes
6. **~250ms**: Canvas element created and injected into #app  
7. **~300ms**: MinimalScene.create() called
8. **~350ms**: Graphics rendered (RED RECTANGLE appears)

If you don't see graphics by ~500ms, something is wrong.

## Development Tips

- **Hot Reload**: Save any .ts file, page automatically updates
- **Console**: Browser console (F12) shows all status messages
- **Restart**: If stuck, kill dev server and run `npm run dev` again
- **Type Checking**: Run `npm run type-check` to check TypeScript errors

## Getting Help

If graphics still don't appear:

1. Take a screenshot showing:
   - What appears on screen
   - Browser console (F12 > Console tab)
   - The URL you're visiting

2. Report the status messages (if any) from the green status panel

3. Try the diagnostic tests and report which ones work/fail

---

Generated: $(date)
Device: macOS
Browser: Chrome/Firefox/Safari (NOT VS Code Simple Browser)
