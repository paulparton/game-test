#!/usr/bin/env node

/**
 * Test script using Playwright to check if Phaser is rendering
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testGame() {
  console.log('🔍 Starting Playwright browser...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log('🌐 Browser:', msg.type().toUpperCase(), msg.text());
  });

  // Capture errors
  page.on('error', err => {
    console.error('🌐 Browser error:', err);
  });

  try {
    console.log('📄 Loading http://localhost:5173...');
    const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('📄 Navigation response:', response?.status());

    // Wait a bit for Vite/scripts to load
    await page.waitForTimeout(3000);

    // Check for canvas
    const canvasCount = await page.locator('canvas').count();
    console.log(`🎨 Canvas elements found: ${canvasCount}`);

    if (canvasCount > 0) {
      const canvas = page.locator('canvas').first();
      const canvasWidth = await canvas.getAttribute('width');
      const canvasHeight = await canvas.getAttribute('height');
      console.log(`📏 Canvas size: ${canvasWidth}x${canvasHeight}`);
    }

    // Check for status div
    const statusText = await page.locator('#status').textContent();
    console.log(`📊 Status text (first 500 chars):\n${statusText?.substring(0, 500)}`);

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({ path: '/tmp/game-screenshot.png' });
    console.log('✅ Screenshot saved to /tmp/game-screenshot.png');

    // Check for errors in page
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('🛑 Browser closed');
  }
}

testGame().catch(console.error);

