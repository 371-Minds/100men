# Database Schema for Gorilla vs 100 Men

## Overview

This document describes the database schema implementation for the Gorilla vs 100 Men game. The database is designed to store player progression, game statistics, achievements, and other relevant data to provide persistence across game sessions.

## Schema Structure

The database schema is organized into several related tables:

### Core Tables

- **players**: Stores user account information
  - `player_id`: Unique identifier for each player
  - `username`: Player's username
  - `email`: Player's email address (optional)
  - `password_hash`: Hashed password for authentication
  - `created_at`: When the account was created
  - `last_login`: When the player last logged in
  - `is_active`: Whether the account is active

- **game_modes**: Defines the available game modes
  - `mode_id`: Unique identifier for each mode
  - `mode_name`: Name of the mode ('gorilla' or 'men')
  - `description`: Description of the mode

### Progression Tables

- **player_progression**: Tracks player level and experience
  - `progression_id`: Unique identifier for each progression record
  - `player_id`: Reference to the player
  - `mode_id`: Reference to the game mode
  - `level`: Current level in this mode
  - `experience`: Current experience points
  - `experience_to_next_level`: Experience needed for next level
  - `skill_points`: Available skill points to spend

- **abilities**: Defines all available abilities
  - `ability_id`: Unique identifier for each ability
  - `mode_id`: Which mode this ability belongs to
  - `ability_code`: Internal code for the ability (e.g., 'groundPound')
  - `name`: Display name of the ability
  - `description`: Description of what the ability does
  - `required_level`: Minimum level required to unlock
  - `cost`: Skill points cost to unlock

- **player_abilities**: Tracks which abilities each player has unlocked
  - `player_ability_id`: Unique identifier
  - `progression_id`: Reference to player's progression
  - `ability_id`: Reference to the ability
  - `unlocked_at`: When the ability was unlocked

- **attributes**: Defines all attributes that can be upgraded
  - `attribute_id`: Unique identifier for each attribute
  - `mode_id`: Which mode this attribute belongs to
  - `attribute_code`: Internal code for the attribute (e.g., 'strength')
  - `name`: Display name of the attribute
  - `description`: Description of what the attribute affects
  - `max_level`: Maximum level for this attribute
  - `cost_per_level`: Skill points cost per level

- **player_attributes**: Tracks the level of each attribute for each player
  - `player_attribute_id`: Unique identifier
  - `progression_id`: Reference to player's progression
  - `attribute_id`: Reference to the attribute
  - `level`: Current level of this attribute

### Achievement and Statistics Tables

- **achievements**: Defines all available achievements
  - `achievement_id`: Unique identifier for each achievement
  - `mode_id`: Which mode this achievement belongs to (null for both)
  - `achievement_code`: Internal code for the achievement
  - `name`: Display name of the achievement
  - `description`: Description of how to earn the achievement
  - `points`: Points awarded for earning this achievement
  - `icon_path`: Path to the achievement icon

- **player_achievements**: Tracks which achievements each player has earned
  - `player_achievement_id`: Unique identifier
  - `player_id`: Reference to the player
  - `achievement_id`: Reference to the achievement
  - `unlocked_at`: When the achievement was earned

- **game_sessions**: Records data about each completed game session
  - `session_id`: Unique identifier for each session
  - `player_id`: Reference to the player
  - `mode_id`: Reference to the game mode
  - `start_time`: When the session started
  - `end_time`: When the session ended
  - `duration_seconds`: How long the session lasted
  - `victory`: Whether the player won
  - `score`: Player's score for this session
  - `experience_earned`: Experience earned in this session

- **game_statistics**: Stores detailed statistics for each game session
  - `stat_id`: Unique identifier for each statistics record
  - `session_id`: Reference to the game session
  - `enemies_defeated`: Number of enemies defeated
  - `damage_dealt`: Total damage dealt
  - `damage_taken`: Total damage taken
  - `abilities_used`: Number of abilities used
  - `distance_traveled`: Distance traveled during the session

## Implementation

The database is implemented using SQLite, a lightweight, file-based database engine. The implementation consists of several key files:

- `database/schema.sql`: SQL schema definition
- `database/DatabaseManager.js`: Abstract database manager interface
- `database/SQLiteDatabaseManager.js`: Concrete SQLite implementation
- `src/progression/DatabaseIntegration.js`: Integration with the game's progression system

## Usage

To use the database in your game:

```javascript
// Import the necessary classes
import { ProgressionSystem } from './src/progression/ProgressionSystem.js';
import { DatabaseIntegration } from './src/progression/DatabaseIntegration.js';

// Create a progression system
const progressionSystem = new ProgressionSystem();

// Create and set up database integration
const dbIntegration = new DatabaseIntegration(progressionSystem);
progressionSystem.setDatabaseIntegration(dbIntegration);

// Initialize the database
await dbIntegration.initialize();

// Now the progression system will automatically save to the database
// when the player levels up, unlocks abilities, or upgrades attributes
```

See `src/examples/DatabaseUsageExample.js` for a complete example of how to use the database integration.

## Dependencies

The database implementation requires the following dependencies:

- `better-sqlite3`: A fast and simple SQLite library for Node.js

These dependencies are included in the project's `package.json` file.

## Future Improvements

Possible future improvements to the database schema include:

- Adding support for multiple save slots per player
- Implementing a leaderboard system
- Adding support for player-to-player interactions
- Implementing a quest/mission tracking system
- Adding support for in-game economy and inventory