// Gorilla vs 100 Men - Database Usage Example

import { ProgressionSystem } from '../progression/ProgressionSystem.js';
import { DatabaseIntegration } from '../progression/DatabaseIntegration.js';

/**
 * This example demonstrates how to use the database integration with the game.
 * It shows how to initialize the database, save and load progression data,
 * record game sessions, and track achievements.
 */
export class DatabaseUsageExample {
    constructor() {
        // Create the progression system
        this.progressionSystem = new ProgressionSystem();
        
        // Create the database integration
        this.dbIntegration = new DatabaseIntegration(this.progressionSystem);
        
        // Set up the database integration with the progression system
        this.progressionSystem.setDatabaseIntegration(this.dbIntegration);
    }
    
    /**
     * Initialize the database and load player data
     */
    async initialize() {
        console.log('Initializing database integration...');
        
        // Initialize the database integration
        // This will load player data from the database if available
        const initialized = await this.dbIntegration.initialize();
        
        if (initialized) {
            console.log('Database integration initialized successfully');
        } else {
            console.error('Failed to initialize database integration');
        }
        
        return initialized;
    }
    
    /**
     * Example of recording a game session
     * @param {string} mode - The game mode ('gorilla' or 'men')
     * @param {boolean} victory - Whether the player won the game
     * @param {number} score - The player's score
     * @param {number} experienceEarned - The amount of experience earned
     */
    async recordGameSession(mode, victory, score, experienceEarned) {
        console.log(`Recording game session for ${mode} mode`);
        
        // Add experience to the player's progression
        const leveledUp = this.progressionSystem.addExperience(mode, experienceEarned);
        
        if (leveledUp) {
            console.log(`Player leveled up in ${mode} mode!`);
        }
        
        // Record the game session in the database
        const sessionId = await this.dbIntegration.recordGameSession({
            mode_id: mode === 'gorilla' ? 1 : 2,
            victory: victory,
            score: score,
            experience_earned: experienceEarned,
            // Additional statistics could be added here
            statistics: {
                enemies_defeated: Math.floor(Math.random() * 50),
                damage_dealt: Math.floor(Math.random() * 5000),
                damage_taken: Math.floor(Math.random() * 2000),
                abilities_used: Math.floor(Math.random() * 20),
                distance_traveled: Math.floor(Math.random() * 1000)
            }
        });
        
        if (sessionId) {
            console.log(`Game session recorded with ID: ${sessionId}`);
        } else {
            console.error('Failed to record game session');
        }
        
        // Check for achievements
        if (victory) {
            if (mode === 'gorilla') {
                await this.dbIntegration.unlockAchievement('first_victory_gorilla');
            } else {
                await this.dbIntegration.unlockAchievement('first_victory_men');
            }
        }
        
        // Check for attribute-based achievements
        const playerData = this.progressionSystem.getPlayerData(mode);
        if (mode === 'gorilla' && playerData.upgradeTree.strength >= 10) {
            await this.dbIntegration.unlockAchievement('max_strength');
        } else if (mode === 'men' && playerData.upgradeTree.weapons >= 10) {
            await this.dbIntegration.unlockAchievement('max_weapons');
        }
        
        // Save progress to ensure all changes are persisted
        this.progressionSystem.saveProgress();
    }
    
    /**
     * Example of upgrading player attributes
     * @param {string} mode - The game mode ('gorilla' or 'men')
     * @param {string} attributeId - The attribute to upgrade
     */
    upgradeAttribute(mode, attributeId) {
        const upgraded = this.progressionSystem.upgradeAttribute(mode, attributeId);
        
        if (upgraded) {
            console.log(`Upgraded ${attributeId} for ${mode} mode`);
            
            // Progress is automatically saved due to event listeners in DatabaseIntegration
        } else {
            console.log(`Failed to upgrade ${attributeId} for ${mode} mode`);
        }
    }
    
    /**
     * Example of unlocking an ability
     * @param {string} mode - The game mode ('gorilla' or 'men')
     * @param {string} abilityId - The ability to unlock
     */
    unlockAbility(mode, abilityId) {
        const unlocked = this.progressionSystem.unlockAbility(mode, abilityId);
        
        if (unlocked) {
            console.log(`Unlocked ${abilityId} for ${mode} mode`);
            
            // Progress is automatically saved due to event listeners in DatabaseIntegration
        } else {
            console.log(`Failed to unlock ${abilityId} for ${mode} mode`);
        }
    }
    
    /**
     * Example of getting player statistics
     */
    async getPlayerStatistics() {
        const stats = await this.dbIntegration.getPlayerStatistics();
        
        console.log('Player Statistics:');
        console.log(stats);
        
        return stats;
    }
    
    /**
     * Example of getting player achievements
     */
    async getPlayerAchievements() {
        const achievements = await this.dbIntegration.getPlayerAchievements();
        
        console.log('Player Achievements:');
        console.log(achievements);
        
        return achievements;
    }
    
    /**
     * Clean up resources when done
     */
    async cleanup() {
        await this.dbIntegration.close();
        console.log('Database connection closed');
    }
}

// Example usage:
/*
const example = new DatabaseUsageExample();
await example.initialize();

// Record a game session
await example.recordGameSession('gorilla', true, 5000, 200);

// Upgrade an attribute
example.upgradeAttribute('gorilla', 'strength');

// Unlock an ability
example.unlockAbility('gorilla', 'roar');

// Get player statistics
const stats = await example.getPlayerStatistics();

// Get player achievements
const achievements = await example.getPlayerAchievements();

// Clean up
await example.cleanup();
*/