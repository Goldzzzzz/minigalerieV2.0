# Guide d'Intégration des Assets IA

Ce guide explique comment intégrer les illustrations de monstres générées par IA dans l'application.

## Étape 1: Générer les Assets avec IA

### Outils Recommandés

1. **DALL-E 3** (via ChatGPT Plus ou API)
   - Meilleure qualité pour les mascottes
   - Excellent suivi des prompts
   - Fond transparent natif

2. **Midjourney** (via Discord)
   - Style artistique cohérent
   - Nécessite post-traitement pour fond transparent

3. **Leonardo.ai**
   - Interface conviviale
   - Bonne qualité, rapide
   - Option fond transparent intégrée

### Utiliser les Prompts

1. Ouvrez le fichier `AI_PROMPTS.md`
2. Copiez le prompt pour le monstre souhaité
3. Collez dans votre outil IA
4. Générez l'image
5. Téléchargez en haute résolution

## Étape 2: Préparer les Images

### Retirer le Fond (si nécessaire)

Si l'image a un fond blanc:
1. Utilisez [remove.bg](https://remove.bg)
2. Ou Photoshop (Sélection > Sujet > Supprimer l'arrière-plan)
3. Ou GIMP (gratuit): Couleur > Couleur vers alpha

### Optimiser la Taille

1. Redimensionner à 512x512px (ou garder 1024x1024 pour @2x)
2. Utiliser [TinyPNG](https://tinypng.com) pour compresser
3. Créer version WebP avec [Squoosh](https://squoosh.app)
4. Objectif: < 50KB par image

### Créer les Miniatures

Pour chaque image, créer une miniature 128x128px:
```bash
# Avec ImageMagick (si installé)
convert monster-violet-neutral.png -resize 128x128 violet-thumb.png
```

## Étape 3: Organiser les Fichiers

### Nomenclature Stricte

Les fichiers DOIVENT suivre exactement ce format:

```
{color}-{pose}.png
```

**Couleurs acceptées:**
- `violet`
- `rose`
- `mint`
- `coral`
- `yellow`
- `sky`

**Poses acceptées:**
- `neutral` (pose par défaut)
- `action` (en train de photographier)
- `celebration` (célébration)

### Exemples Valides
✅ `violet-neutral.png`
✅ `rose-action.png`
✅ `mint-celebration.png`

### Exemples Invalides
❌ `Violet-Neutral.png` (majuscules)
❌ `purple-neutral.png` (mauvaise couleur)
❌ `violet_neutral.png` (underscore)
❌ `violet-neutral.jpg` (mauvais format)

## Étape 4: Placer les Fichiers

### Structure des Dossiers

```
project/
└── assets/
    └── monsters/
        ├── static/
        │   ├── violet-neutral.png
        │   ├── violet-action.png
        │   ├── violet-celebration.png
        │   ├── rose-neutral.png
        │   ├── rose-action.png
        │   ├── rose-celebration.png
        │   ├── mint-neutral.png
        │   ├── mint-action.png
        │   ├── mint-celebration.png
        │   ├── coral-neutral.png
        │   ├── coral-action.png
        │   ├── coral-celebration.png
        │   ├── yellow-neutral.png
        │   ├── yellow-action.png
        │   ├── yellow-celebration.png
        │   ├── sky-neutral.png
        │   ├── sky-action.png
        │   └── sky-celebration.png
        └── thumbnails/
            ├── violet-thumb.png
            ├── rose-thumb.png
            ├── mint-thumb.png
            ├── coral-thumb.png
            ├── yellow-thumb.png
            └── sky-thumb.png
```

### Copier les Fichiers

```bash
# Depuis votre dossier de téléchargements
cp ~/Downloads/violet-neutral.png assets/monsters/static/
cp ~/Downloads/violet-action.png assets/monsters/static/
# etc.
```

## Étape 5: Tester l'Intégration

### Démarrer l'Application

```bash
npm run dev
```

### Vérifier l'Affichage

1. **Écran d'accueil**: Les albums doivent afficher les monstres au lieu des emojis
2. **Écran Albums**: Les cartes doivent montrer les monstres
3. **Albums sélectionnés**: Le monstre doit s'animer légèrement

### Comportement Attendu

- Si l'image existe → Affiche l'illustration IA
- Si l'image n'existe pas → Affiche l'emoji correspondant
- Aucune erreur ne doit apparaître

### Déboguer les Problèmes

#### L'image ne s'affiche pas
1. Vérifiez le nom du fichier (respecter exactement la casse)
2. Vérifiez le format (doit être .png)
3. Vérifiez le chemin (doit être dans `assets/monsters/static/`)
4. Vérifiez que l'image a un fond transparent
5. Redémarrez l'application

#### L'image est mal dimensionnée
1. Vérifiez la résolution (minimum 512x512px)
2. L'image doit avoir un ratio 1:1 (carré)

#### L'image a un fond blanc
1. Repassez l'image dans remove.bg
2. Ou modifiez manuellement avec un éditeur

## Étape 6: Optimisation Finale

### Performance

Vérifiez que les images chargent rapidement:
```bash
# Lister les tailles de fichiers
ls -lh assets/monsters/static/
```

Toutes les images doivent être < 50KB.

### Créer des Versions WebP (Web uniquement)

```bash
# Avec cwebp (Google WebP)
for file in assets/monsters/static/*.png; do
  cwebp -q 80 "$file" -o "${file%.png}.webp"
done
```

## Étape 7: Animations Avancées (Optionnel)

### Créer des Animations Lottie

1. Utilisez [Lottie Creator](https://lottiefiles.com/create)
2. Ou Adobe After Effects + Bodymovin
3. Exportez en JSON
4. Placez dans `assets/monsters/animated/`

Format: `{color}-bounce.json`

### Intégrer Lottie (si utilisé)

Installer la dépendance:
```bash
npm install lottie-react-native
```

L'application détectera automatiquement les fichiers JSON.

## Checklist Finale

Avant de considérer l'intégration terminée:

### Assets Obligatoires
- [ ] 6 monstres × 1 pose minimum = 6 images PNG
- [ ] Toutes les images ont un fond transparent
- [ ] Toutes les images respectent la nomenclature
- [ ] Toutes les images sont < 50KB

### Assets Recommandés
- [ ] 6 monstres × 3 poses = 18 images PNG
- [ ] 6 miniatures (thumbnails)
- [ ] Versions WebP pour le web

### Assets Optionnels
- [ ] Animations Lottie
- [ ] Variantes supplémentaires
- [ ] Fonds thématiques

### Tests
- [ ] L'application démarre sans erreur
- [ ] Les monstres s'affichent sur l'écran d'accueil
- [ ] Les monstres s'affichent dans les albums
- [ ] Les animations fonctionnent quand un album est sélectionné
- [ ] Le fallback emoji fonctionne pour les assets manquants
- [ ] Les performances sont bonnes (pas de lag)

## Assistance

### Composants Créés

L'application utilise ces composants pour afficher les monstres:

1. **MonsterAvatar** (`components/MonsterAvatar.tsx`)
   - Affiche un monstre individuel
   - Gère le fallback emoji
   - Supporte l'animation

2. **MonsterScene** (`components/MonsterScene.tsx`)
   - Affiche plusieurs monstres avec animations
   - Utilisé pour les scènes décoratives

3. **AlbumCard** (`components/AlbumCard.tsx`)
   - Affiche les albums avec monstres
   - Intègre MonsterAvatar automatiquement

### Mapping des Couleurs

Le fichier `constants/MonsterMapping.ts` gère la correspondance:
- Emojis → Couleurs de monstres
- Codes hex → Couleurs de monstres
- Noms et descriptions des monstres

## Exemples d'Utilisation

### Afficher un Monstre Simple

```tsx
import MonsterAvatar from '@/components/MonsterAvatar';

<MonsterAvatar
  color="violet"
  size={80}
  animated={true}
  showCamera={true}
/>
```

### Afficher une Scène de Monstres

```tsx
import MonsterScene from '@/components/MonsterScene';

<MonsterScene
  monsters={['violet', 'rose', 'mint']}
  animated={true}
/>
```

## Ressources

- **Guide complet**: `ASSETS_GUIDE.md`
- **Prompts IA**: `AI_PROMPTS.md`
- **Spécifications techniques**: `assets/monsters/README.md`
- **Composants**: `components/MonsterAvatar.tsx`
- **Mapping**: `constants/MonsterMapping.ts`

## Support et Dépannage

### Les images ne se chargent pas sur Web

Sur le web (Expo), les assets locaux peuvent nécessiter une configuration supplémentaire. Si vous rencontrez des problèmes:

1. Vérifiez que les images sont bien dans le dossier `assets/`
2. Utilisez `require()` au lieu de chemins en string:

```tsx
// Au lieu de:
source={{ uri: '/assets/monsters/static/violet-neutral.png' }}

// Utilisez:
source={require('@/assets/monsters/static/violet-neutral.png')}
```

3. Ou hébergez les images sur un CDN et utilisez des URLs absolues

### Besoin d'Aide?

Consultez les fichiers de documentation ou ouvrez une issue sur le projet.
