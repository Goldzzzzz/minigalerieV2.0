/*
  # Ajouter l'échelle de notation aux notes de photos

  1. Modifications
    - Ajouter la colonne `rating_scale` à la table `photo_ratings`
    - Cette colonne stocke l'échelle qui était active au moment de la notation
    - Permet de conserver la note originale même si l'échelle globale change
    - Définir une valeur par défaut de 10 pour les notes existantes

  2. Notes importantes
    - Les notes existantes recevront une échelle de 10 (valeur par défaut)
    - Chaque nouvelle note stockera son échelle au moment de la création
    - L'affichage utilisera l'échelle stockée plutôt que l'échelle globale actuelle
*/

-- Add rating_scale column to photo_ratings table
ALTER TABLE photo_ratings
ADD COLUMN IF NOT EXISTS rating_scale integer DEFAULT 10 NOT NULL;