# Dossier des Assets Monstres

Ce dossier contient les illustrations de monstres photographes générées par IA.

## Structure

```
monsters/
├── static/          # Images statiques PNG
├── animated/        # Animations Lottie JSON
└── thumbnails/      # Miniatures optimisées
```

## Convention de Nommage

### Images Statiques (PNG)
- Format: `{color}-{pose}.png`
- Exemples:
  - `violet-neutral.png`
  - `rose-action.png`
  - `mint-celebration.png`

### Animations (JSON Lottie)
- Format: `{color}-{animation}.json`
- Exemples:
  - `violet-bounce.json`
  - `rose-celebrate.json`

### Miniatures (PNG)
- Format: `{color}-thumb.png`
- Taille: 128x128px
- Exemples:
  - `violet-thumb.png`
  - `rose-thumb.png`

## Couleurs des Monstres

| Couleur | Code Hex  | Nom du Monstre | Emoji Temporaire |
|---------|-----------|----------------|------------------|
| Violet  | #8B7BE8   | Snapix         | 👾               |
| Rose    | #FF9ECD   | Photini        | 🦄               |
| Menthe  | #7FDBCA   | Clicky         | 🐙               |
| Corail  | #FFB494   | Flashy         | 🦖               |
| Jaune   | #FFE66D   | Sparkle        | 🌟               |
| Ciel    | #A8D8FF   | Pixelbot       | 🤖               |

## Génération avec IA

Consultez le fichier `/ASSETS_GUIDE.md` à la racine du projet pour:
- Prompts détaillés pour chaque monstre
- Outils de génération recommandés
- Spécifications techniques
- Guide de validation

## Installation des Assets

1. Placez les fichiers PNG dans le dossier `static/`
2. Placez les fichiers JSON Lottie dans `animated/`
3. Créez des miniatures 128x128px dans `thumbnails/`
4. Redémarrez l'application

Les composants détecteront automatiquement les nouveaux assets et les utiliseront à la place des emojis.

## Fallback

Si un asset n'est pas trouvé, l'application affichera automatiquement un emoji correspondant à la couleur du monstre.
