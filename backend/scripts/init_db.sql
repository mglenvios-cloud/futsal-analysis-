-- Futsal Analysis Platform - Database Initialization
-- PostgreSQL 16

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(10),
    logo_url VARCHAR(500),
    category VARCHAR(50) DEFAULT 'Division A',
    division VARCHAR(50) DEFAULT 'A',
    coach VARCHAR(100),
    stadium VARCHAR(200),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Argentina',
    founded_year INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    age INTEGER,
    position VARCHAR(50),
    height FLOAT,
    weight FLOAT,
    dominant_foot VARCHAR(10),
    jersey_number INTEGER,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'Division A',
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_category ON players(category);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    date DATE NOT NULL,
    time TIME,
    venue VARCHAR(200),
    category VARCHAR(50) DEFAULT 'Division A',
    round VARCHAR(50),
    status VARCHAR(20) DEFAULT 'scheduled',
    video_url VARCHAR(500),
    notes TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_category ON matches(category);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    filepath VARCHAR(1000) NOT NULL,
    file_size FLOAT,
    duration FLOAT,
    width INTEGER,
    height INTEGER,
    fps FLOAT,
    format VARCHAR(20),
    source_type VARCHAR(20) DEFAULT 'upload',
    is_processed BOOLEAN DEFAULT FALSE,
    processing_progress FLOAT DEFAULT 0,
    processing_status VARCHAR(20) DEFAULT 'pending',
    thumbnail_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    minute INTEGER,
    second INTEGER,
    x_position FLOAT,
    y_position FLOAT,
    description TEXT,
    video_timestamp FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_match ON events(match_id);
CREATE INDEX idx_events_type ON events(event_type);

-- Statistics table
CREATE TABLE IF NOT EXISTS statistics (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    stat_type VARCHAR(50) NOT NULL,
    stat_category VARCHAR(50) NOT NULL,
    distance_covered FLOAT DEFAULT 0,
    max_speed FLOAT DEFAULT 0,
    avg_speed FLOAT DEFAULT 0,
    sprint_count INTEGER DEFAULT 0,
    accelerations INTEGER DEFAULT 0,
    decelerations INTEGER DEFAULT 0,
    direction_changes INTEGER DEFAULT 0,
    time_moving FLOAT DEFAULT 0,
    time_stopped FLOAT DEFAULT 0,
    intensity_index FLOAT DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    pass_accuracy FLOAT DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    tackles INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    possessions_won INTEGER DEFAULT 0,
    possessions_lost INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    fouls_received INTEGER DEFAULT 0,
    tactical_system VARCHAR(50),
    pressing_intensity FLOAT DEFAULT 0,
    coverage_quality FLOAT DEFAULT 0,
    rotation_efficiency FLOAT DEFAULT 0,
    transition_speed FLOAT DEFAULT 0,
    minutes_played FLOAT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    extra_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stats_player ON statistics(player_id);
CREATE INDEX idx_stats_match ON statistics(match_id);

-- Scouting data table
CREATE TABLE IF NOT EXISTS scouting_data (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    player_surname VARCHAR(100),
    club VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Division A',
    age INTEGER,
    position VARCHAR(50),
    height FLOAT,
    weight FLOAT,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    source_url VARCHAR(500),
    source_name VARCHAR(100),
    last_scouted TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    raw_data JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scouting_name ON scouting_data(player_name);
CREATE INDEX idx_scouting_club ON scouting_data(club);
CREATE INDEX idx_scouting_category ON scouting_data(category);

-- Cardiac data table
CREATE TABLE IF NOT EXISTS cardiac_data (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    device_type VARCHAR(50),
    device_id VARCHAR(100),
    heart_rate FLOAT,
    heart_rate_max FLOAT,
    heart_rate_avg FLOAT,
    heart_rate_min FLOAT,
    zone_1_duration FLOAT DEFAULT 0,
    zone_2_duration FLOAT DEFAULT 0,
    zone_3_duration FLOAT DEFAULT 0,
    zone_4_duration FLOAT DEFAULT 0,
    zone_5_duration FLOAT DEFAULT 0,
    hrv FLOAT,
    recovery_score FLOAT,
    fatigue_level FLOAT,
    timestamp TIMESTAMP,
    session_type VARCHAR(50),
    extra_metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cardiac_player ON cardiac_data(player_id);

-- Trainings table
CREATE TABLE IF NOT EXISTS trainings (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    duration FLOAT,
    intensity VARCHAR(20),
    distance_covered FLOAT DEFAULT 0,
    avg_heart_rate FLOAT,
    max_heart_rate FLOAT,
    calories_burned FLOAT,
    type VARCHAR(50),
    notes VARCHAR(500),
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Injuries table
CREATE TABLE IF NOT EXISTS injuries (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    injury_type VARCHAR(100) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    severity VARCHAR(20),
    date DATE NOT NULL,
    recovery_date DATE,
    days_missed INTEGER,
    matches_missed INTEGER,
    description TEXT,
    treatment TEXT,
    is_recurring INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tactical analyses table
CREATE TABLE IF NOT EXISTS tactical_analyses (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    match_id INTEGER REFERENCES matches(id) ON DELETE SET NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    formation VARCHAR(20),
    tactical_system VARCHAR(100),
    high_press_intensity FLOAT DEFAULT 0,
    mid_press_intensity FLOAT DEFAULT 0,
    low_press_intensity FLOAT DEFAULT 0,
    coverage_efficiency FLOAT DEFAULT 0,
    rotation_quality FLOAT DEFAULT 0,
    transition_offensive_speed FLOAT DEFAULT 0,
    transition_defensive_speed FLOAT DEFAULT 0,
    numerical_superiority_attacks INTEGER DEFAULT 0,
    numerical_inferiority_defenses INTEGER DEFAULT 0,
    heatmap_data JSONB,
    movement_trails JSONB,
    positioning_map JSONB,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    score FLOAT,
    future_performance_score FLOAT,
    injury_risk_score FLOAT,
    physical_evolution_score FLOAT,
    potential_score FLOAT,
    predicted_metrics JSONB,
    confidence_interval JSONB,
    risk_factors JSONB,
    recommendations JSONB,
    model_version VARCHAR(20),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_player ON predictions(player_id);
CREATE INDEX idx_predictions_score ON predictions(score DESC);

-- Insert sample data
INSERT INTO teams (name, short_name, category, division, city) VALUES
    ('Club Atlético Boca Juniors', 'BOCA', 'Division A', 'A', 'Buenos Aires'),
    ('Club Atlético River Plate', 'RIVER', 'Division A', 'A', 'Buenos Aires'),
    ('Club Atlético Independiente', 'INDI', 'Division A', 'A', 'Avellaneda'),
    ('Racing Club', 'RACI', 'Division A', 'A', 'Avellaneda'),
    ('San Lorenzo de Almagro', 'SLA', 'Division A', 'A', 'Buenos Aires')
ON CONFLICT DO NOTHING;
