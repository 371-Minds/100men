-- Gorilla vs 100 Men - Database Schema

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Players table to store user information
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Game modes table
CREATE TABLE game_modes (
    mode_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_name TEXT NOT NULL UNIQUE,  -- 'gorilla' or 'men'
    description TEXT
);

-- Insert default game modes
INSERT INTO game_modes (mode_name, description) VALUES
('gorilla', 'Play as the gorilla against 100 men'),
('men', 'Command 100 men against the gorilla');

-- Player progression table
CREATE TABLE player_progression (
    progression_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    mode_id INTEGER NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    experience_to_next_level INTEGER NOT NULL DEFAULT 100,
    skill_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id),
    UNIQUE(player_id, mode_id)
);

-- Abilities table
CREATE TABLE abilities (
    ability_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_id INTEGER NOT NULL,
    ability_code TEXT NOT NULL,  -- e.g., 'groundPound', 'roar'
    name TEXT NOT NULL,
    description TEXT,
    required_level INTEGER NOT NULL DEFAULT 1,
    cost INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id),
    UNIQUE(mode_id, ability_code)
);

-- Insert default gorilla abilities
INSERT INTO abilities (mode_id, ability_code, name, description, required_level, cost) VALUES
(1, 'groundPound', 'Ground Pound', 'Slam the ground, damaging nearby enemies', 1, 0),
(1, 'roar', 'Mighty Roar', 'Stun nearby enemies with a powerful roar', 3, 2),
(1, 'charge', 'Primal Charge', 'Charge forward, damaging enemies in your path', 5, 3),
(1, 'rageFrenzy', 'Rage Frenzy', 'Enter a frenzy, increasing attack speed and damage', 8, 4),
(1, 'throwObject', 'Throw Object', 'Pick up and throw environmental objects', 10, 5);

-- Insert default men abilities
INSERT INTO abilities (mode_id, ability_code, name, description, required_level, cost) VALUES
(2, 'coordinated_attack', 'Coordinated Attack', 'Coordinate an attack, increasing damage', 1, 0),
(2, 'defensive_formation', 'Defensive Formation', 'Form a defensive position, reducing damage taken', 3, 2),
(2, 'medical_support', 'Medical Support', 'Deploy medics to heal nearby units', 5, 3),
(2, 'artillery_strike', 'Artillery Strike', 'Call in an artillery strike on a target area', 8, 4),
(2, 'reinforcements', 'Reinforcements', 'Call in additional troops', 10, 5);

-- Player unlocked abilities
CREATE TABLE player_abilities (
    player_ability_id INTEGER PRIMARY KEY AUTOINCREMENT,
    progression_id INTEGER NOT NULL,
    ability_id INTEGER NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (progression_id) REFERENCES player_progression(progression_id) ON DELETE CASCADE,
    FOREIGN KEY (ability_id) REFERENCES abilities(ability_id),
    UNIQUE(progression_id, ability_id)
);

-- Attributes table
CREATE TABLE attributes (
    attribute_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_id INTEGER NOT NULL,
    attribute_code TEXT NOT NULL,  -- e.g., 'strength', 'health'
    name TEXT NOT NULL,
    description TEXT,
    max_level INTEGER NOT NULL DEFAULT 10,
    cost_per_level INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id),
    UNIQUE(mode_id, attribute_code)
);

-- Insert default gorilla attributes
INSERT INTO attributes (mode_id, attribute_code, name, description, max_level, cost_per_level) VALUES
(1, 'strength', 'Strength', 'Increases damage dealt', 10, 1),
(1, 'health', 'Vitality', 'Increases maximum health', 10, 1),
(1, 'speed', 'Agility', 'Increases movement speed', 10, 1),
(1, 'rage', 'Fury', 'Increases rage generation and maximum rage', 10, 1);

-- Insert default men attributes
INSERT INTO attributes (mode_id, attribute_code, name, description, max_level, cost_per_level) VALUES
(2, 'weapons', 'Weapons Technology', 'Improves weapon damage', 10, 1),
(2, 'armor', 'Armor Technology', 'Improves unit health and damage resistance', 10, 1),
(2, 'tactics', 'Tactical Training', 'Improves unit coordination and movement speed', 10, 1),
(2, 'medicine', 'Medical Technology', 'Improves healing abilities and survival rate', 10, 1);

-- Player attribute levels
CREATE TABLE player_attributes (
    player_attribute_id INTEGER PRIMARY KEY AUTOINCREMENT,
    progression_id INTEGER NOT NULL,
    attribute_id INTEGER NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (progression_id) REFERENCES player_progression(progression_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(attribute_id),
    UNIQUE(progression_id, attribute_id)
);

-- Achievements table
CREATE TABLE achievements (
    achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_id INTEGER,  -- NULL means achievement applies to all modes
    achievement_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    icon_path TEXT,
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id)
);

-- Insert some example achievements
INSERT INTO achievements (mode_id, achievement_code, name, description, points) VALUES
(1, 'first_victory_gorilla', 'King of the Jungle', 'Win your first match as the gorilla', 10),
(1, 'max_strength', 'Ultimate Power', 'Reach maximum strength level', 20),
(2, 'first_victory_men', 'Strength in Numbers', 'Win your first match commanding the men', 10),
(2, 'max_weapons', 'Arms Race Winner', 'Reach maximum weapons technology level', 20),
(NULL, 'play_both_sides', 'Double Agent', 'Win at least one match with each faction', 30);

-- Player achievements
CREATE TABLE player_achievements (
    player_achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id),
    UNIQUE(player_id, achievement_id)
);

-- Game sessions table
CREATE TABLE game_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    mode_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    victory BOOLEAN,
    score INTEGER DEFAULT 0,
    experience_earned INTEGER DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id)
);

-- Game statistics table
CREATE TABLE game_statistics (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    enemies_defeated INTEGER DEFAULT 0,
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    abilities_used INTEGER DEFAULT 0,
    distance_traveled REAL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE settings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    UNIQUE(player_id, setting_key)
);

-- Indexes for performance optimization
CREATE INDEX idx_player_progression_player_id ON player_progression(player_id);
CREATE INDEX idx_player_abilities_progression_id ON player_abilities(progression_id);
CREATE INDEX idx_player_attributes_progression_id ON player_attributes(progression_id);
CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_statistics_session_id ON game_statistics(session_id);