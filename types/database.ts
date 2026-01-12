export interface Album {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  user_id: string;
  sort_order: number;
}

export interface Folder {
  id: string;
  album_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  folder_id?: string | null;
  image_uri: string;
  thumbnail_uri: string;
  sort_order: number;
  voice_note_uri: string;
  decorations: Decoration[];
  created_at: string;
}

export interface Decoration {
  type: 'sticker' | 'frame' | 'emoji';
  value: string;
  x: number;
  y: number;
  scale?: number;
}

export interface ShareCode {
  id: string;
  album_id: string;
  code: string;
  created_at: string;
  expires_at: string;
}

export interface ParentalControlSettings {
  id: string;
  user_id: string;
  password_hash: string;
  email: string;
  is_active: boolean;
  rating_scale: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoRating {
  id: string;
  photo_id: string;
  rating: number;
  rating_scale: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface PasswordRecoveryToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface DailyRating {
  id: string;
  user_id: string;
  rating_date: string;
  rating_value: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'default' | 'neon' | 'pastel' | 'seasonal';
  seasonal_variant: 'christmas' | 'halloween' | 'spring' | 'summer' | 'fall' | 'winter' | null;
  created_at: string;
  updated_at: string;
}
