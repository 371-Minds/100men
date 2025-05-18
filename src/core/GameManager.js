// Gorilla vs 100 Men - Game Manager

import { Gorilla } from '../entities/Gorilla.js';
import { MenManager } from '../entities/MenManager.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { ProgressionSystem } from '../progression/ProgressionSystem.js';

export class GameManager {
    constructor() {
        this.gameState = {
            currentMode: null, // 'gorilla' or 'men'
            difficulty: 'normal',
            score: 0,
            timeElapsed: 0,
            isGameOver: false,
            isPaused: false
        };
        
        // Game entities
        this.gorilla = null;
        this.menManager = null;
        
        // Game systems
        this.combatSystem = null;
        this.progressionSystem = null;
        
        // Game loop variables
        this.lastTimestamp = 0;
        this.gameLoopId = null;
    }
    
    initialize() {
        console.log('Initializing Game Manager...');
        
        // Initialize game systems
        this.combatSystem = new CombatSystem();
        this.progressionSystem = new ProgressionSystem();
        
        // Set up event listeners
        this._setupEventListeners();
        
        console.log('Game Manager initialized!');
    }
    
    startNewGame(mode) {
        console.log(`Starting new game as: ${mode}`);
        
        // Reset game state
        this.gameState.currentMode = mode;
        this.gameState.score = 0;
        this.gameState.timeElapsed = 0;
        this.gameState.isGameOver = false;
        this.gameState.isPaused = false;
        
        // Initialize entities based on selected mode
        if (mode === 'gorilla') {
            this.gorilla = new Gorilla();
            this.menManager = new MenManager('ai');
        } else if (mode === 'men') {
            this.gorilla = new Gorilla('ai');
            this.menManager = new MenManager();
        }
        
        // Start game loop
        this.lastTimestamp = performance.now();
        this.gameLoopId = requestAnimationFrame(this._gameLoop.bind(this));
    }
    
    pauseGame() {
        if (!this.gameState.isPaused) {
            this.gameState.isPaused = true;
            cancelAnimationFrame(this.gameLoopId);
            console.log('Game paused');
        }
    }
    
    resumeGame() {
        if (this.gameState.isPaused) {
            this.gameState.isPaused = false;
            this.lastTimestamp = performance.now();
            this.gameLoopId = requestAnimationFrame(this._gameLoop.bind(this));
            console.log('Game resumed');
        }
    }
    
    endGame(victory) {
        this.gameState.isGameOver = true;
        cancelAnimationFrame(this.gameLoopId);
        
        const result = victory ? 'Victory!' : 'Defeat!';
        console.log(`Game over: ${result}`);
        
        // Save progression and stats
        this.progressionSystem.saveProgress(this.gameState);
        
        // Trigger game over event
        const gameOverEvent = new CustomEvent('gameOver', {
            detail: {
                victory,
                score: this.gameState.score,
                timeElapsed: this.gameState.timeElapsed,
                mode: this.gameState.currentMode
            }
        });
        document.dispatchEvent(gameOverEvent);
    }
    
    _gameLoop(timestamp) {
        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;
        
        // Update game time
        this.gameState.timeElapsed += deltaTime;
        
        // Update game entities
        if (this.gorilla) this.gorilla.update(deltaTime);
        if (this.menManager) this.menManager.update(deltaTime);
        
        // Process combat
        this.combatSystem.processCombat(this.gorilla, this.menManager, deltaTime);
        
        // Check win/loss conditions
        this._checkGameConditions();
        
        // Continue game loop if game is not over
        if (!this.gameState.isGameOver) {
            this.gameLoopId = requestAnimationFrame(this._gameLoop.bind(this));
        }
    }
    
    _checkGameConditions() {
        // Check if gorilla is defeated
        if (this.gorilla && this.gorilla.health <= 0) {
            if (this.gameState.currentMode === 'gorilla') {
                this.endGame(false); // Player lost as gorilla
            } else {
                this.endGame(true); // Player won as men
            }
        }
        
        // Check if all men are defeated
        if (this.menManager && this.menManager.getRemainingMenCount() <= 0) {
            if (this.gameState.currentMode === 'gorilla') {
                this.endGame(true); // Player won as gorilla
            } else {
                this.endGame(false); // Player lost as men
            }
        }
    }
    
    _setupEventListeners() {
        // Listen for user input and game events
        document.addEventListener('keydown', this._handleKeyDown.bind(this));
    }
    
    _handleKeyDown(event) {
        // Handle pause/resume with Escape key
        if (event.key === 'Escape') {
            if (this.gameState.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        }
    }
}