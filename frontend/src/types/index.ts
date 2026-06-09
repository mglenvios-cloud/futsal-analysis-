export interface Player {
  id: number;
  unique_id: string;
  name: string;
  surname: string;
  age?: number;
  position?: string;
  height?: number;
  weight?: number;
  dominant_foot?: string;
  jersey_number?: number;
  team_id?: number;
  category?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  short_name?: string;
  logo_url?: string;
  category?: string;
  division?: string;
  coach?: string;
  stadium?: string;
  city?: string;
  country?: string;
  founded_year?: number;
  is_active: boolean;
  created_at: string;
}

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  date: string;
  time?: string;
  venue?: string;
  category?: string;
  status: string;
  is_processed: boolean;
}

export interface Video {
  id: number;
  title: string;
  filename: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  processing_status: string;
  processing_progress: number;
  created_at: string;
}

export interface PhysicalMetrics {
  distance_covered: number;
  max_speed: number;
  avg_speed: number;
  sprint_count: number;
  accelerations: number;
  decelerations: number;
  direction_changes: number;
  time_moving: number;
  time_stopped: number;
  intensity_index: number;
}

export interface CardiacData {
  heart_rate: number;
  heart_rate_max: number;
  heart_rate_avg: number;
  heart_rate_min: number;
  hrv?: number;
  zone: number;
  timestamp: string;
}

export interface TacticalMetrics {
  formation?: string;
  tactical_system?: string;
  high_press_intensity: number;
  mid_press_intensity: number;
  low_press_intensity: number;
  coverage_efficiency: number;
  rotation_quality: number;
  transition_offensive_speed: number;
  transition_defensive_speed: number;
  numerical_superiority_attacks: number;
  numerical_inferiority_defenses: number;
}

export interface ScoutedPlayer {
  id: number;
  name: string;
  club?: string;
  category: string;
  position?: string;
  age?: number;
  goals: number;
  assists: number;
  matches_played: number;
}

export interface Prediction {
  overall_score: number;
  performance: {
    score: number;
    predicted_metrics: Record<string, number>;
    recommendations: string[];
  };
  injury_risk: {
    score: number;
    risk_factors: string[];
    recommendations: string[];
  };
  potential: {
    score: number;
    physical_evolution: number;
    predicted_metrics: Record<string, number>;
    recommendations: string[];
  };
}

export interface Statistics {
  player_id: number;
  match_id: number;
  goals: number;
  assists: number;
  distance_covered: number;
  max_speed: number;
  avg_speed: number;
  sprint_count: number;
  rating: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}
