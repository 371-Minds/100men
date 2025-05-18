// Gorilla vs 100 Men - SQLite Database Manager

import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Database manager implementation using SQLite
 */
export class SQLiteDatabaseManager {
    /**
     * Create a new SQLite database manager
     * @param {string} dbPath - Path to the SQLite database file
     */
    constructor(dbPath = 'database/gorilla_vs_men.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize the database connection and create tables if they don't exist
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        try {
            // Ensure the directory exists
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Connect to the database
            this.db = new BetterSqlite3(this.dbPath);
            console.log(`Connected to SQLite database at ${this.dbPath}`);
            
            // Load and execute the schema
            const schemaLoaded = await this._loadSchema();
            
            if (schemaLoaded) {
                this.initialized = true;
                console.log('Database schema initialized successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            return false;
        }
    }

    /**
     * Load and execute the database schema
     * @returns {Promise<boolean>}
     * @private
     */
    async _loadSchema() {
        try {
            // Read the schema file
            const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split the schema into individual statements
            const statements = schema
                .split(';')
                .map(statement => statement.trim())
                .filter(statement => statement.length > 0);
            
            // Execute each statement
            this.db.pragma('foreign_keys = ON');
            
            // Begin a transaction for better performance
            const transaction = this.db.transaction(() => {
                for (const statement of statements) {
                    this.db.exec(statement + ';');
                }
            });
            
            // Execute the transaction
            transaction();
            
            console.log(`Executed ${statements.length} SQL statements from schema`);
            return true;
        } catch (error) {
            console.error('Failed to load schema:', error);
            return false;
        }
    }

    /**
     * Save player progression data to the database
     * @param {Object} data - The player progression data
     * @returns {Promise<boolean>} True if save was successful
     */
    async savePlayerProgression(data) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const { playerId, progressionData } = data;
            
            // Begin a transaction
            const transaction = this.db.transaction(() => {
                // Check if player exists, create if not
                const playerExists = this.db.prepare('SELECT 1 FROM players WHERE player_id = ?').get(playerId);
                if (!playerExists) {
                    this.db.prepare('INSERT INTO players (player_id, username, password_hash) VALUES (?, ?, ?)')
                        .run(playerId, `Player${playerId}`, 'placeholder_hash');
                }
                
                // Process gorilla mode progression
                this._saveModePogression(playerId, 1, progressionData.gorilla);
                
                // Process men mode progression
                this._saveModePogression(playerId, 2, progressionData.men);
            });
            
            // Execute the transaction
            transaction();
            
            console.log(`Saved progression data for player ${playerId}`);
            return true;
        } catch (error) {
            console.error('Failed to save player progression:', error);
            return false;
        }
    }
    
    /**
     * Save progression data for a specific mode
     * @param {number} playerId - The player ID
     * @param {number} modeId - The mode ID (1 for gorilla, 2 for men)
     * @param {Object} modeData - The progression data for this mode
     * @private
     */
    _saveModePogression(playerId, modeId, modeData) {
        // Update or insert player progression
        const progressionExists = this.db.prepare(
            'SELECT progression_id FROM player_progression WHERE player_id = ? AND mode_id = ?'
        ).get(playerId, modeId);
        
        let progressionId;
        if (progressionExists) {
            // Update existing progression
            this.db.prepare(
                'UPDATE player_progression SET level = ?, experience = ?, experience_to_next_level = ?, skill_points = ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ? AND mode_id = ?'
            ).run(
                modeData.level,
                modeData.experience,
                modeData.experienceToNextLevel,
                modeData.skillPoints || modeData.researchPoints,
                playerId,
                modeId
            );
            progressionId = progressionExists.progression_id;
        } else {
            // Insert new progression
            const result = this.db.prepare(
                'INSERT INTO player_progression (player_id, mode_id, level, experience, experience_to_next_level, skill_points) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(
                playerId,
                modeId,
                modeData.level,
                modeData.experience,
                modeData.experienceToNextLevel,
                modeData.skillPoints || modeData.researchPoints
            );
            progressionId = result.lastInsertRowid;
        }
        
        // Save unlocked abilities
        this._saveUnlockedAbilities(progressionId, modeId, modeData.unlockedAbilities);
        
        // Save attribute levels
        this._saveAttributeLevels(progressionId, modeId, modeData.upgradeTree);
    }
    
    /**
     * Save unlocked abilities for a player
     * @param {number} progressionId - The progression ID
     * @param {number} modeId - The mode ID
     * @param {Array} unlockedAbilities - Array of ability codes
     * @private
     */
    _saveUnlockedAbilities(progressionId, modeId, unlockedAbilities) {
        // Clear existing abilities
        this.db.prepare(
            'DELETE FROM player_abilities WHERE progression_id = ?'
        ).run(progressionId);
        
        // Insert each unlocked ability
        const insertAbility = this.db.prepare(
            'INSERT INTO player_abilities (progression_id, ability_id) SELECT ?, ability_id FROM abilities WHERE mode_id = ? AND ability_code = ?'
        );
        
        for (const abilityCode of unlockedAbilities) {
            insertAbility.run(progressionId, modeId, abilityCode);
        }
    }
    
    /**
     * Save attribute levels for a player
     * @param {number} progressionId - The progression ID
     * @param {number} modeId - The mode ID
     * @param {Object} upgradeTree - Object mapping attribute codes to levels
     * @private
     */
    _saveAttributeLevels(progressionId, modeId, upgradeTree) {
        // Clear existing attribute levels
        this.db.prepare(
            'DELETE FROM player_attributes WHERE progression_id = ?'
        ).run(progressionId);
        
        // Insert each attribute level
        const insertAttribute = this.db.prepare(
            'INSERT INTO player_attributes (progression_id, attribute_id, level) SELECT ?, attribute_id, ? FROM attributes WHERE mode_id = ? AND attribute_code = ?'
        );
        
        for (const [attributeCode, level] of Object.entries(upgradeTree)) {
            insertAttribute.run(progressionId, level, modeId, attributeCode);
        }
    }

    /**
     * Load player progression data from the database
     * @param {number} playerId - The player ID
     * @returns {Promise<Object|null>} The player progression data or null if not found
     */
    async loadPlayerProgression(playerId) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Check if player exists
            const playerExists = this.db.prepare('SELECT 1 FROM players WHERE player_id = ?').get(playerId);
            if (!playerExists) {
                return null;
            }
            
            // Create the result object with default structure
            const result = {
                gorilla: {
                    level: 1,
                    experience: 0,
                    experienceToNextLevel: 100,
                    skillPoints: 0,
                    unlockedAbilities: [],
                    upgradeTree: {},
                    achievements: []
                },
                men: {
                    level: 1,
                    experience: 0,
                    experienceToNextLevel: 100,
                    researchPoints: 0,
                    unlockedAbilities: [],
                    upgradeTree: {},
                    achievements: []
                }
            };
            
            // Load progression data for gorilla mode (mode_id = 1)
            this._loadModeProgression(playerId, 1, result.gorilla);
            
            // Load progression data for men mode (mode_id = 2)
            this._loadModeProgression(playerId, 2, result.men);
            
            return result;
        } catch (error) {
            console.error('Failed to load player progression:', error);
            return null;
        }
    }
    
    /**
     * Load progression data for a specific mode
     * @param {number} playerId - The player ID
     * @param {number} modeId - The mode ID (1 for gorilla, 2 for men)
     * @param {Object} modeData - The object to populate with mode data
     * @private
     */
    _loadModeProgression(playerId, modeId, modeData) {
        // Load basic progression data
        const progression = this.db.prepare(
            'SELECT progression_id, level, experience, experience_to_next_level, skill_points FROM player_progression WHERE player_id = ? AND mode_id = ?'
        ).get(playerId, modeId);
        
        if (progression) {
            modeData.level = progression.level;
            modeData.experience = progression.experience;
            modeData.experienceToNextLevel = progression.experience_to_next_level;
            
            // Set skill points or research points based on mode
            if (modeId === 1) { // gorilla
                modeData.skillPoints = progression.skill_points;
            } else { // men
                modeData.researchPoints = progression.skill_points;
            }
            
            // Load unlocked abilities
            const abilities = this.db.prepare(
                'SELECT a.ability_code FROM player_abilities pa JOIN abilities a ON pa.ability_id = a.ability_id WHERE pa.progression_id = ?'
            ).all(progression.progression_id);
            
            modeData.unlockedAbilities = abilities.map(a => a.ability_code);
            
            // Load attribute levels
            const attributes = this.db.prepare(
                'SELECT a.attribute_code, pa.level FROM player_attributes pa JOIN attributes a ON pa.attribute_id = a.attribute_id WHERE pa.progression_id = ?'
            ).all(progression.progression_id);
            
            // Initialize upgradeTree with default values
            if (modeId === 1) { // gorilla
                modeData.upgradeTree = {
                    strength: 1,
                    health: 1,
                    speed: 1,
                    rage: 1
                };
            } else { // men
                modeData.upgradeTree = {
                    weapons: 1,
                    armor: 1,
                    tactics: 1,
                    medicine: 1
                };
            }
            
            // Update with actual values from database
            for (const attr of attributes) {
                modeData.upgradeTree[attr.attribute_code] = attr.level;
            }
        }
    }

    /**
     * Record a completed game session
     * @param {Object} sessionData - Data about the game session
     * @returns {Promise<number|null>} The session ID or null if save failed
     */
    async recordGameSession(sessionData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const { playerId, mode_id, victory, score, experience_earned, statistics } = sessionData;
            
            // Begin a transaction
            const transaction = this.db.transaction(() => {
                // Insert game session
                const now = new Date().toISOString();
                const result = this.db.prepare(
                    'INSERT INTO game_sessions (player_id, mode_id, start_time, end_time, victory, score, experience_earned) VALUES (?, ?, ?, ?, ?, ?, ?)'
                ).run(
                    playerId,
                    mode_id,
                    now,
                    now,
                    victory ? 1 : 0,
                    score || 0,
                    experience_earned || 0
                );
                
                const sessionId = result.lastInsertRowid;
                
                // Insert game statistics if provided
                if (statistics) {
                    this.db.prepare(
                        'INSERT INTO game_statistics (session_id, enemies_defeated, damage_dealt, damage_taken, abilities_used, distance_traveled) VALUES (?, ?, ?, ?, ?, ?)'
                    ).run(
                        sessionId,
                        statistics.enemies_defeated || 0,
                        statistics.damage_dealt || 0,
                        statistics.damage_taken || 0,
                        statistics.abilities_used || 0,
                        statistics.distance_traveled || 0
                    );
                }
                
                return sessionId;
            });
            
            // Execute the transaction and return the session ID
            const sessionId = transaction();
            console.log(`Recorded game session with ID: ${sessionId}`);
            return sessionId;
        } catch (error) {
            console.error('Failed to record game session:', error);
            return null;
        }
    }

    /**
     * Unlock an achievement for a player
     * @param {number} playerId - The player ID
     * @param {string} achievementCode - The achievement code
     * @returns {Promise<boolean>} True if achievement was unlocked
     */
    async unlockAchievement(playerId, achievementCode) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Check if achievement exists
            const achievement = this.db.prepare(
                'SELECT achievement_id FROM achievements WHERE achievement_code = ?'
            ).get(achievementCode);
            
            if (!achievement) {
                console.error(`Achievement ${achievementCode} does not exist`);
                return false;
            }
            
            // Check if player already has this achievement
            const existingAchievement = this.db.prepare(
                'SELECT 1 FROM player_achievements WHERE player_id = ? AND achievement_id = ?'
            ).get(playerId, achievement.achievement_id);
            
            if (existingAchievement) {
                console.log(`Player ${playerId} already has achievement ${achievementCode}`);
                return true;
            }
            
            // Unlock the achievement
            this.db.prepare(
                'INSERT INTO player_achievements (player_id, achievement_id) VALUES (?, ?)'
            ).run(playerId, achievement.achievement_id);
            
            console.log(`Unlocked achievement ${achievementCode} for player ${playerId}`);
            return true;
        } catch (error) {
            console.error('Failed to unlock achievement:', error);
            return false;
        }
    }

    /**
     * Get all achievements for a player
     * @param {number} playerId - The player ID
     * @returns {Promise<Array>} Array of achievement objects
     */
    async getPlayerAchievements(playerId) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const achievements = this.db.prepare(
                `SELECT a.achievement_code, a.name, a.description, a.points, a.icon_path, pa.unlocked_at
                FROM player_achievements pa
                JOIN achievements a ON pa.achievement_id = a.achievement_id
                WHERE pa.player_id = ?`
            ).all(playerId);
            
            return achievements;
        } catch (error) {
            console.error('Failed to get player achievements:', error);
            return [];
        }
    }

    /**
     * Get player statistics across all game sessions
     * @param {number} playerId - The player ID
     * @returns {Promise<Object>} Player statistics
     */
    async getPlayerStatistics(playerId) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Get basic session statistics
            const sessionStats = this.db.prepare(
                `SELECT 
                    COUNT(*) as totalGames,
                    SUM(CASE WHEN victory = 1 THEN 1 ELSE 0 END) as victories,
                    SUM(CASE WHEN victory = 0 THEN 1 ELSE 0 END) as defeats,
                    SUM(score) as totalScore,
                    SUM(experience_earned) as totalExperience,
                    SUM(duration_seconds) as totalPlayTime
                FROM game_sessions
                WHERE player_id = ?`
            ).get(playerId);
            
            // Get aggregated game statistics
            const gameStats = this.db.prepare(
                `SELECT 
                    SUM(gs.enemies_defeated) as enemiesDefeated,
                    SUM(gs.damage_dealt) as damageDealt,
                    SUM(gs.damage_taken) as damageTaken,
                    SUM(gs.abilities_used) as abilitiesUsed,
                    SUM(gs.distance_traveled) as distanceTraveled
                FROM game_statistics gs
                JOIN game_sessions s ON gs.session_id = s.session_id
                WHERE s.player_id = ?`
            ).get(playerId);
            
            // Combine the results
            return {
                totalGames: sessionStats?.totalGames || 0,
                victories: sessionStats?.victories || 0,
                defeats: sessionStats?.defeats || 0,
                totalScore: sessionStats?.totalScore || 0,
                totalExperience: sessionStats?.totalExperience || 0,
                totalPlayTime: sessionStats?.totalPlayTime || 0,
                enemiesDefeated: gameStats?.enemiesDefeated || 0,
                damageDealt: gameStats?.damageDealt || 0,
                damageTaken: gameStats?.damageTaken || 0,
                abilitiesUsed: gameStats?.abilitiesUsed || 0,
                distanceTraveled: gameStats?.distanceTraveled || 0
            };
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
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initialized = false;
            console.log('Database connection closed');
        }
    }
}