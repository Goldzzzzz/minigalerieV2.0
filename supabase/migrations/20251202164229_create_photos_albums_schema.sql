/*
  # Schéma de base pour l'application de classement de photos pour enfants

  ## 1. Nouvelles Tables
    - `albums`
      - `id` (uuid, primary key) - Identifiant unique de l'album
      - `name` (text) - Nom de l'album (ex. "Mes jouets", "Mes dessins")
      - `icon` (text) - Icône ou emoji pour l'album
      - `color` (text) - Couleur de l'album
      - `created_at` (timestamptz) - Date de création
      - `user_id` (uuid) - Propriétaire de l'album
      - `sort_order` (integer) - Ordre d'affichage
    
    - `photos`
      - `id` (uuid, primary key) - Identifiant unique de la photo
      - `album_id` (uuid, foreign key) - Album parent
      - `image_uri` (text) - URI de l'image (stockage local)
      - `thumbnail_uri` (text) - URI de la miniature
      - `sort_order` (integer) - Ordre dans l'album
      - `voice_note_uri` (text) - URI de la note vocale
      - `decorations` (jsonb) - Stickers, cadres appliqués
      - `created_at` (timestamptz) - Date d'ajout
    
    - `share_codes`
      - `id` (uuid, primary key) - Identifiant unique
      - `album_id` (uuid, foreign key) - Album partagé
      - `code` (text, unique) - Code de partage sécurisé
      - `created_at` (timestamptz) - Date de création
      - `expires_at` (timestamptz) - Date d'expiration

  ## 2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour accès authentifié uniquement
    - Partage sécurisé via codes temporaires
*/

-- Créer la table albums
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  icon text DEFAULT '📁',
  color text DEFAULT '#FF6B6B',
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  sort_order integer DEFAULT 0
);

-- Créer la table photos
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  image_uri text NOT NULL,
  thumbnail_uri text DEFAULT '',
  sort_order integer DEFAULT 0,
  voice_note_uri text DEFAULT '',
  decorations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Créer la table share_codes
CREATE TABLE IF NOT EXISTS share_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Activer RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_codes ENABLE ROW LEVEL SECURITY;

-- Politiques pour albums
CREATE POLICY "Users can view own albums"
  ON albums FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums"
  ON albums FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums"
  ON albums FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour photos
CREATE POLICY "Users can view photos from own albums"
  ON photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos in own albums"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos in own albums"
  ON photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from own albums"
  ON photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

-- Politiques pour share_codes
CREATE POLICY "Users can view share codes for own albums"
  ON share_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create share codes for own albums"
  ON share_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own share codes"
  ON share_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

-- Créer des index pour performances
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_share_codes_code ON share_codes(code);
CREATE INDEX IF NOT EXISTS idx_share_codes_album_id ON share_codes(album_id);