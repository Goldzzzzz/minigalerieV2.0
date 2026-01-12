/*
  # Amélioration: Support des dossiers personnalisés dans les albums

  ## 1. Nouvelles Tables
    - `folders`
      - `id` (uuid, primary key) - Identifiant unique du dossier
      - `album_id` (uuid, foreign key) - Album parent
      - `name` (text) - Nom du dossier (ex. "Mes jouets", "Mes dessins")
      - `icon` (text) - Icône/emoji du dossier
      - `color` (text) - Couleur du dossier
      - `sort_order` (integer) - Ordre d'affichage
      - `created_at` (timestamptz) - Date de création

  ## 2. Modifications
    - Ajout colonne `folder_id` à la table `photos` pour lier les photos aux dossiers
    - Index pour améliorer les requêtes par dossier
  
  ## 3. Sécurité
    - RLS activé sur la table `folders`
    - Politiques restrictives pour accès utilisateur uniquement
*/

-- Créer la table folders
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Nouveau dossier',
  icon text DEFAULT '📁',
  color text DEFAULT '#4ECDC4',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Ajouter colonne folder_id à la table photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'folder_id'
  ) THEN
    ALTER TABLE photos ADD COLUMN folder_id uuid REFERENCES folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Activer RLS sur folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Politiques pour folders avec gestion des erreurs
DO $$
BEGIN
  CREATE POLICY "Users can view folders in own albums"
    ON folders FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM albums
        WHERE albums.id = folders.album_id
        AND albums.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can insert folders in own albums"
    ON folders FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM albums
        WHERE albums.id = folders.album_id
        AND albums.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update folders in own albums"
    ON folders FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM albums
        WHERE albums.id = folders.album_id
        AND albums.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM albums
        WHERE albums.id = folders.album_id
        AND albums.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete folders in own albums"
    ON folders FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM albums
        WHERE albums.id = folders.album_id
        AND albums.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Créer des index pour performances
CREATE INDEX IF NOT EXISTS idx_folders_album_id ON folders(album_id);
CREATE INDEX IF NOT EXISTS idx_folders_sort_order ON folders(sort_order);
CREATE INDEX IF NOT EXISTS idx_photos_folder_id ON photos(folder_id);
