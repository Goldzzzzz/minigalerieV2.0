/*
  # Fix Security and Performance Issues

  ## Changes
  
  1. **Add Missing Index**
    - Add index on `password_recovery_tokens.user_id` for better foreign key performance
  
  2. **Optimize RLS Policies**
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation for each row and improves performance at scale
  
  3. **Remove Duplicate Policies**
    - Remove duplicate policies on `parental_control_settings` table
  
  4. **Fix Function Security**
    - Update `update_updated_at_column` function with immutable search_path

  ## Security Improvements
  - Better query performance for RLS policies
  - Proper indexing for foreign keys
  - Secure function search path
*/

-- Add missing index on password_recovery_tokens
CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_user_id 
  ON password_recovery_tokens(user_id);

-- Fix function search path to be immutable using CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop all existing RLS policies to recreate them with optimized auth checks
-- Albums policies
DROP POLICY IF EXISTS "Users can view own albums" ON albums;
DROP POLICY IF EXISTS "Users can insert own albums" ON albums;
DROP POLICY IF EXISTS "Users can update own albums" ON albums;
DROP POLICY IF EXISTS "Users can delete own albums" ON albums;
DROP POLICY IF EXISTS "Anon users can view own albums" ON albums;
DROP POLICY IF EXISTS "Anon users can insert own albums" ON albums;
DROP POLICY IF EXISTS "Anon users can update own albums" ON albums;
DROP POLICY IF EXISTS "Anon users can delete own albums" ON albums;

-- Create optimized albums policies
CREATE POLICY "Anon users can view own albums"
  ON albums FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Anon users can insert own albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Anon users can update own albums"
  ON albums FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Anon users can delete own albums"
  ON albums FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Photos policies
DROP POLICY IF EXISTS "Users can view photos from own albums" ON photos;
DROP POLICY IF EXISTS "Users can insert photos in own albums" ON photos;
DROP POLICY IF EXISTS "Users can update photos in own albums" ON photos;
DROP POLICY IF EXISTS "Users can delete photos from own albums" ON photos;
DROP POLICY IF EXISTS "Anon users can view photos from own albums" ON photos;
DROP POLICY IF EXISTS "Anon users can insert photos in own albums" ON photos;
DROP POLICY IF EXISTS "Anon users can update photos in own albums" ON photos;
DROP POLICY IF EXISTS "Anon users can delete photos from own albums" ON photos;

-- Create optimized photos policies
CREATE POLICY "Anon users can view photos from own albums"
  ON photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can insert photos in own albums"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can update photos in own albums"
  ON photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can delete photos from own albums"
  ON photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = photos.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

-- Folders policies
DROP POLICY IF EXISTS "Users can view folders in own albums" ON folders;
DROP POLICY IF EXISTS "Users can insert folders in own albums" ON folders;
DROP POLICY IF EXISTS "Users can update folders in own albums" ON folders;
DROP POLICY IF EXISTS "Users can delete folders in own albums" ON folders;
DROP POLICY IF EXISTS "Anon users can view folders from own albums" ON folders;
DROP POLICY IF EXISTS "Anon users can insert folders in own albums" ON folders;
DROP POLICY IF EXISTS "Anon users can update folders in own albums" ON folders;
DROP POLICY IF EXISTS "Anon users can delete folders from own albums" ON folders;

-- Create optimized folders policies
CREATE POLICY "Anon users can view folders from own albums"
  ON folders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = folders.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can insert folders in own albums"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = folders.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can update folders in own albums"
  ON folders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = folders.album_id
      AND albums.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = folders.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can delete folders from own albums"
  ON folders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = folders.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

-- Share codes policies
DROP POLICY IF EXISTS "Users can view share codes for own albums" ON share_codes;
DROP POLICY IF EXISTS "Users can create share codes for own albums" ON share_codes;
DROP POLICY IF EXISTS "Users can delete own share codes" ON share_codes;
DROP POLICY IF EXISTS "Anon users can view share codes for own albums" ON share_codes;
DROP POLICY IF EXISTS "Anon users can create share codes for own albums" ON share_codes;
DROP POLICY IF EXISTS "Anon users can delete own share codes" ON share_codes;

-- Create optimized share codes policies
CREATE POLICY "Anon users can view share codes for own albums"
  ON share_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can create share codes for own albums"
  ON share_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anon users can delete own share codes"
  ON share_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums
      WHERE albums.id = share_codes.album_id
      AND albums.user_id = (select auth.uid())
    )
  );

-- Photo ratings policies
DROP POLICY IF EXISTS "Authenticated users can view photo ratings" ON photo_ratings;
DROP POLICY IF EXISTS "Authenticated users can insert photo ratings" ON photo_ratings;
DROP POLICY IF EXISTS "Authenticated users can update photo ratings" ON photo_ratings;
DROP POLICY IF EXISTS "Authenticated users can delete photo ratings" ON photo_ratings;

-- Create optimized photo ratings policies
CREATE POLICY "Authenticated users can view photo ratings"
  ON photo_ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos
      JOIN albums ON albums.id = photos.album_id
      WHERE photos.id = photo_ratings.photo_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can insert photo ratings"
  ON photo_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM photos
      JOIN albums ON albums.id = photos.album_id
      WHERE photos.id = photo_ratings.photo_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can update photo ratings"
  ON photo_ratings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos
      JOIN albums ON albums.id = photos.album_id
      WHERE photos.id = photo_ratings.photo_id
      AND albums.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM photos
      JOIN albums ON albums.id = photos.album_id
      WHERE photos.id = photo_ratings.photo_id
      AND albums.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can delete photo ratings"
  ON photo_ratings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM photos
      JOIN albums ON albums.id = photos.album_id
      WHERE photos.id = photo_ratings.photo_id
      AND albums.user_id = (select auth.uid())
    )
  );

-- Parental control settings policies (remove duplicates)
DROP POLICY IF EXISTS "Users can view own parental control settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can view own parental settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can insert own parental control settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can insert own parental settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can update own parental control settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can update own parental settings" ON parental_control_settings;
DROP POLICY IF EXISTS "Users can delete own parental settings" ON parental_control_settings;

-- Create single optimized parental control policies
CREATE POLICY "Users can view own parental control settings"
  ON parental_control_settings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own parental control settings"
  ON parental_control_settings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own parental control settings"
  ON parental_control_settings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own parental control settings"
  ON parental_control_settings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Password recovery tokens policies
DROP POLICY IF EXISTS "Users can view own recovery tokens" ON password_recovery_tokens;
DROP POLICY IF EXISTS "Users can insert own recovery tokens" ON password_recovery_tokens;
DROP POLICY IF EXISTS "Users can update own recovery tokens" ON password_recovery_tokens;

-- Create optimized password recovery tokens policies
CREATE POLICY "Users can view own recovery tokens"
  ON password_recovery_tokens FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own recovery tokens"
  ON password_recovery_tokens FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own recovery tokens"
  ON password_recovery_tokens FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Daily ratings policies
DROP POLICY IF EXISTS "Users can view own daily ratings" ON daily_ratings;
DROP POLICY IF EXISTS "Users can insert own daily ratings" ON daily_ratings;
DROP POLICY IF EXISTS "Users can update own daily ratings" ON daily_ratings;
DROP POLICY IF EXISTS "Users can delete own daily ratings" ON daily_ratings;

-- Create optimized daily ratings policies
CREATE POLICY "Users can view own daily ratings"
  ON daily_ratings FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own daily ratings"
  ON daily_ratings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own daily ratings"
  ON daily_ratings FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own daily ratings"
  ON daily_ratings FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Create optimized user preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
