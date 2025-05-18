# Database Schema for Gorilla vs 100 Men

This directory contains the database schema and integration code for the Gorilla vs 100 Men game. The database is designed to store player progression, game statistics, and other relevant data.

## Schema Structure

The database schema (`schema.sql`) defines the following tables:

### Core Tables
- **players**: Stores user account information
- **game_modes**: Defines the available game modes (gorilla and men)
- **player_progression**: Tracks player level, experience, and skill points for each mode

### Progression Tables
- **abilities**: Defines all available abilities for each mode
- **player_abilities**: Tracks which abilities each player has unlocked
- **attributes**: Defines all attributes that can be upgraded (strength, health, etc.)
- **player_attributes**: Tracks the level of each attribute for each player

### Achievement and Statistics Tables
- **achievements**: Defines all available achievements
- **player_achievements**: Tracks which achievements each player has unlocked
- **game_sessions**: Records data about each completed game session
- **game_statistics**: Stores detailed statistics for each game session

### Miscellaneous Tables
- **settings**: Stores player-specific settings

## Integration with Game

The database integration is handled by two main classes:

1. **DatabaseManager.js**: Handles direct database operations like querying and updating tables
2. **DatabaseIntegration.js**: Connects the ProgressionSystem with the DatabaseManager

## Usage

To use the database in the game:

```javascript
import { ProgressionSystem } from './src/progression/ProgressionSystem.js';
import { DatabaseIntegration } from './src/progression/DatabaseIntegration.js';

// Create progression system
const progressionSystem = new ProgressionSystem();

// Create database integration
const dbIntegration = new DatabaseIntegration(progressionSystem);

// Initialize database
await dbIntegration.initialize();

// Now progression data will be automatically saved to the database
// when the player levels up, unlocks abilities, or upgrades attributes

// Record a game session
await dbIntegration.recordGameSession({
  mode_id: 1, // gorilla mode
  victory: true,
  score: 5000,
  experience_earned: 200,
  // other session data
});

// Unlock an achievement
await dbIntegration.unlockAchievement('first_victory_gorilla');

// Get player statistics
const stats = await dbIntegration.getPlayerStatistics();
```

## Implementation Notes

The current implementation uses a placeholder for actual database operations. In a production environment, you would need to:

1. Choose a database system (SQLite for local storage, or a server-based solution)
2. Implement the actual database operations in DatabaseManager.js
3. Add proper user authentication to identify players

The schema is designed to be flexible and can be extended with additional tables as needed.