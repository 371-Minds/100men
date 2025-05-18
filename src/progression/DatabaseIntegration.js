// Gorilla vs 100 Men - Database Integration

import { DatabaseManager } from '../../database/DatabaseManager.js';

/**
 * This class integrates the ProgressionSystem with the DatabaseManager
 * to provide persistent storage for player progression data.
 */
export class DatabaseIntegration {
    constructor(progressionSystem) {
        this.progressionSystem = progressionSystem;
        this.dbManager = new DatabaseManager();
        this.playerId = 1; // Default player ID, in a real implementation this would come from authentication
        this.initialized = false;
    }

    /**
     * Initialize the database integration
     * @returns {Promise<boolean>}
     */
    async initialize() {
        try {
            // Initialize the database
            const dbInitialized = await this.dbManager.initialize();
            if (!dbInitialized) {
                console.error('Failed to initialize database');
                return false;
            }

            // Load player data from database
            const playerData = await this.dbManager.loadPlayerProgression(this.playerId);
            if (playerData) {
                // Update the progression system with loaded data
                this._updateProgressionSystem(playerData);
            } else {
                // No saved data found, save the default progression data
                await this.saveProgress();
            }

            this.initialized = true;
            
            // Set up event listeners for progression events
            this._setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize database integration:', error);
            return false;
        }
    }

    /**
     * Update the progression system with data loaded from the database
     * @param {Object} playerData - The player data from the database
     * @private
     */
    _updateProgressionSystem(playerData) {
        // Update the progression system's playerData with the loaded data
        this.progressionSystem.playerData = playerData;
        console.log('Progression system updated with database data');
    }

    /**
     * Set up event listeners for progression events
     * @private
     */
    _setupEventListeners() {
        // Listen for level up events
        document.addEventListener('levelUp', (event) => {
            this.saveProgress();
        });

        // Listen for ability unlock events
        document.addEventListener('abilityUnlocked', (event) => {
            this.saveProgress();
        });

        // Listen for attribute upgrade events
        document.addEventListener('attributeUpgraded', (event) => {
            this.saveProgress();
        });
    }

    /**
     * Save the current progression data to the database
     * @returns {Promise<boolean>}
     */
    async saveProgress() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const result = await this.dbManager.savePlayerProgression({
                playerId: this.playerId,
                progressionData: this.progressionSystem.playerData
            });

            return result;
        } catch (error) {
            console.error('Failed to save progress to database:', error);
            return false;
        }
    }

    /**
     * Record a completed game session
     * @param {Object} sessionData - Data about the completed game session
     * @returns {Promise<number|null>} The session ID or null if save failed
     */
    async recordGameSession(sessionData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Add player ID to session data
            const fullSessionData = {
                ...sessionData,
                playerId: this.playerId
            };

            return await this.dbManager.recordGameSession(fullSessionData);
        } catch (error) {
            console.error('Failed to record game session:', error);
            return null;
        }
    }

    /**
     * Unlock an achievement for the current player
     * @param {string} achievementCode - The achievement code
     * @returns {Promise<boolean>}
     */
    async unlockAchievement(achievementCode) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            return await this.dbManager.unlockAchievement(this.playerId, achievementCode);
        } catch (error) {
            console.error('Failed to unlock achievement:', error);
            return false;
        }
    }

    /**
     * Get all achievements for the current player
     * @returns {Promise<Array>}
     */
    async getPlayerAchievements() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            return await this.dbManager.getPlayerAchievements(this.playerId);
        } catch (error) {
            console.error('Failed to get player achievements:', error);
            return [];
        }
    }

    /**
     * Get statistics for the current player
     * @returns {Promise<Object>}
     */
    async getPlayerStatistics() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            return await this.dbManager.getPlayerStatistics(this.playerId);
        } catch (error) {
            console.error('Failed to get player statistics:', error);
            return {};
        }
    }

    /**
     * Close the database connection
     * @returns {Promise<void>}
     */
    async close() {
        if (this.initialized) {
            await this.dbManager.close();
            this.initialized = false;
        }
    }
}