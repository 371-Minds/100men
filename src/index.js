// Gorilla vs 100 Men - Main Game Entry Point

import { GameManager } from './core/GameManager.js';
import { UIManager } from './ui/UIManager.js';
import { Renderer } from './core/Renderer.js';

// Initialize the game when the window loads
window.onload = () => {
    console.log('Initializing Gorilla vs 100 Men...');
    
    // Create the game manager instance
    const gameManager = new GameManager();
    
    // Create UI manager
    const uiManager = new UIManager(gameManager);
    
    // Create renderer
    const renderer = new Renderer(gameManager);
    
    // Start the game
    gameManager.initialize();
    uiManager.initialize();
    
    // Set up game loop for rendering
    function gameLoop() {
        // Update UI
        uiManager.updateUI();
        
        // Render game
        renderer.render();
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start game loop
    gameLoop();
    
    console.log('Game initialized successfully!');
};