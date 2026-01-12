/*
  # Ajout des politiques pour utilisateurs anonymes
  
  1. Problème identifié
    - Les utilisateurs anonymes ne peuvent pas accéder aux données car seules les policies "authenticated" existent
    - L'application utilise signInAnonymously() mais les RLS policies bloquent l'accès
  
  2. Solution
    - Ajouter des policies identiques pour le role "anon"
    - Permettre aux utilisateurs anonymes de gérer leurs propres albums et photos
  
  3. Sécurité
    - Chaque utilisateur anonyme ne peut accéder qu'à ses propres données
    - Les policies vérifient toujours auth.uid() pour l'isolation des données
*/

-- Drop existing policies if they exist and recreate with anon access
DO $$
BEGIN
  -- Albums policies
  DROP POLICY IF EXISTS "Anon users can view own albums" ON albums;
  DROP POLICY IF EXISTS "Anon users can insert own albums" ON albums;
  DROP POLICY IF EXISTS "Anon users can update own albums" ON albums;
  DROP POLICY IF EXISTS "Anon users can delete own albums" ON albums;
  
  -- Photos policies
  DROP POLICY IF EXISTS "Anon users can view photos from own albums" ON photos;
  DROP POLICY IF EXISTS "Anon users can insert photos in own albums" ON photos;
  DROP POLICY IF EXISTS "Anon users can update photos in own albums" ON photos;
  DROP POLICY IF EXISTS "Anon users can delete photos from own albums" ON photos;
  
  -- Share codes policies
  DROP POLICY IF EXISTS "Anon users can view share codes for own albums" ON share_codes;
  DROP POLICY IF EXISTS "Anon users can create share codes for own albums" ON share_codes;
  DROP POLICY IF EXISTS "Anon users can delete own share codes" ON share_codes;
END $$;

-- Politiques pour albums (anon)
CREATE POLICY "Anon users can view own albums"
  ON albums FOR SELECT
  TO anon
  USING (auth.uid() = user_id);

CREATE POLICY "Anon users can insert own albums"
  ON albums FOR INSERT
  TO anon
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users can update own albums"
  ON albums FOR UPDATE
  TO anon
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users can delete own albums"
  ON albums FOR DELETE
  TO anon
  USING (auth.uid() = user_id);

-- Politiques pour photos (anon)
CREATE POLICY "Anon users can view photos from own albums"
  ON photos FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon users can insert photos in own albums"
  ON photos FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon users can update photos in own albums"
  ON photos FOR UPDATE
  TO anon
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

CREATE POLICY "Anon users can delete photos from own albums"
  ON photos FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = auth.uid()
    )
  );

-- Politiques pour share_codes (anon)
CREATE POLICY "Anon users can view share codes for own albums"
  ON share_codes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon users can create share codes for own albums"
  ON share_codes FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Anon users can delete own share codes"
  ON share_codes FOR DELETE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = auth.uid()
    )
  );

-- Politiques pour folders si la table existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'folders' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Anon users can view folders from own albums" ON folders;
    DROP POLICY IF EXISTS "Anon users can insert folders in own albums" ON folders;
    DROP POLICY IF EXISTS "Anon users can update folders in own albums" ON folders;
    DROP POLICY IF EXISTS "Anon users can delete folders from own albums" ON folders;

    EXECUTE 'CREATE POLICY "Anon users can view folders from own albums"
      ON folders FOR SELECT
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM albums
          WHERE albums.id = folders.album_id
          AND albums.user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Anon users can insert folders in own albums"
      ON folders FOR INSERT
      TO anon
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM albums
          WHERE albums.id = folders.album_id
          AND albums.user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Anon users can update folders in own albums"
      ON folders FOR UPDATE
      TO anon
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
      )';

    EXECUTE 'CREATE POLICY "Anon users can delete folders from own albums"
      ON folders FOR DELETE
      TO anon
      USING (
        EXISTS (
          SELECT 1 FROM albums
          WHERE albums.id = folders.album_id
          AND albums.user_id = auth.uid()
        )
      )';
  END IF;
END $$;
