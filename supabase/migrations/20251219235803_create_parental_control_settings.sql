/*
  # Création de la table parental_control_settings
  
  1. Nouvelle Table
    - `parental_control_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers auth.users)
      - `password_hash` (text) - Mot de passe hashé en SHA256
      - `email` (text) - Email de récupération
      - `is_active` (boolean) - Indique si le contrôle parental est actif
      - `rating_scale` (integer) - Échelle de notation (ex: 5, 10, 20)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Sécurité
    - Enable RLS sur `parental_control_settings`
    - Politique permettant aux utilisateurs authentifiés de lire/modifier leurs propres paramètres
    - Politique permettant aux utilisateurs anonymes de lire leurs propres paramètres
  
  3. Contraintes
    - Un seul enregistrement par utilisateur (contrainte unique sur user_id)
    - rating_scale doit être entre 5 et 20
*/

CREATE TABLE IF NOT EXISTS parental_control_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  email text NOT NULL,
  is_active boolean DEFAULT false,
  rating_scale integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_parental_settings UNIQUE (user_id),
  CONSTRAINT rating_scale_range CHECK (rating_scale >= 5 AND rating_scale <= 20)
);

ALTER TABLE parental_control_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parental settings"
  ON parental_control_settings FOR SELECT
  TO authenticated, anon
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parental settings"
  ON parental_control_settings FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parental settings"
  ON parental_control_settings FOR UPDATE
  TO authenticated, anon
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own parental settings"
  ON parental_control_settings FOR DELETE
  TO authenticated, anon
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_parental_control_user_id ON parental_control_settings(user_id);