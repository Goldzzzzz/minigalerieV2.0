# Guide de Création des Assets Monstres

Ce document détaille les spécifications pour créer les illustrations de monstres photographes avec IA.

## Direction Artistique

### Style Général
- **Forme**: Mascottes arrondies, traits doux et amicaux
- **Palette**: Couleurs premium cohérentes avec le thème (violet #8B7BE8, rose #FF9ECD, menthe #7FDBCA, corail #FFB494)
- **Expressions**: Chaleureuses, joyeuses, engageantes
- **Posture**: Monstres tenant clairement un appareil photo vintage ou moderne
- **Taille**: Entre 200-400px pour une qualité optimale

## Assets Requis

### 1. Monstres Principaux (6 variantes minimum)

#### Monster 1 - Photographe Violet 👾
- **Couleur dominante**: Violet (#8B7BE8)
- **Caractéristique**: Un œil cyclope, antennes
- **Appareil**: Appareil photo instantané rose
- **Pose**: Prenant une photo, souriant
- **Expression**: Enthousiaste

#### Monster 2 - Photographe Rose 🦄
- **Couleur dominante**: Rose (#FF9ECD)
- **Caractéristique**: Petites cornes, queue ondulée
- **Appareil**: Appareil photo reflex vintage
- **Pose**: Regardant dans le viseur
- **Expression**: Concentré et heureux

#### Monster 3 - Photographe Menthe 🐙
- **Couleur dominante**: Menthe (#7FDBCA)
- **Caractéristique**: Tentacules, multiples yeux
- **Appareil**: Appareil photo moderne compact
- **Pose**: Tentacule tenant l'appareil
- **Expression**: Curieux

#### Monster 4 - Photographe Corail 🦖
- **Couleur dominante**: Corail (#FFB494)
- **Caractéristique**: Petites ailes, queue de dinosaure
- **Appareil**: Caméra polaroid
- **Pose**: Sautant de joie avec appareil
- **Expression**: Excité

#### Monster 5 - Photographe Jaune 🌟
- **Couleur dominante**: Jaune (#FFE66D)
- **Caractéristique**: Forme d'étoile, brillant
- **Appareil**: Appareil photo avec flash
- **Pose**: Flash qui éclate
- **Expression**: Ébloui et joyeux

#### Monster 6 - Photographe Ciel 🤖
- **Couleur dominante**: Bleu ciel (#A8D8FF)
- **Caractéristique**: Aspect robotique, antennes
- **Appareil**: Appareil photo futuriste
- **Pose**: Analyse technique de la photo
- **Expression**: Intelligent et amical

### 2. Poses Supplémentaires (par monstre)

Pour chaque monstre, créer 3 variations:

1. **Pose Neutre**: Tenant l'appareil, souriant
2. **Pose Action**: En train de prendre une photo
3. **Pose Célébration**: Fier de sa photo, pouce levé

### 3. États d'Animation

Pour chaque pose principale, fournir:

#### Version Statique (PNG/WebP)
- Résolution: 512x512px
- Format: PNG avec transparence
- Optimisation: WebP pour web
- Nom: `monster-{color}-static.png`

#### Version Animée (Lottie/JSON)
- Durée: 1-2 secondes en boucle
- Animation: Léger rebond, clignement d'œil, mouvement d'appareil photo
- Format: Lottie JSON ou GIF optimisé
- Nom: `monster-{color}-animated.json`

## Structure des Fichiers

```
assets/
├── monsters/
│   ├── static/
│   │   ├── violet-neutral.png (512x512)
│   │   ├── violet-action.png
│   │   ├── violet-celebration.png
│   │   ├── rose-neutral.png
│   │   ├── rose-action.png
│   │   ├── rose-celebration.png
│   │   └── ... (autres monstres)
│   ├── animated/
│   │   ├── violet-bounce.json
│   │   ├── rose-bounce.json
│   │   └── ... (autres animations)
│   └── thumbnails/
│       ├── violet-thumb.png (128x128)
│       ├── rose-thumb.png
│       └── ... (miniatures optimisées)
├── icons/
│   ├── camera-icon.svg
│   ├── album-icon.svg
│   └── gallery-icon.svg
└── backgrounds/
    ├── gradient-primary.png
    └── pattern-monsters.png
```

## Outils de Génération IA Recommandés

### Pour les Illustrations
1. **DALL-E 3** (OpenAI)
   - Prompt exemple: "Cute round purple monster mascot with one eye and antennae, holding a vintage pink instant camera, kawaii style, soft edges, friendly expression, transparent background, children's book illustration style"

2. **Midjourney**
   - Prompt exemple: "/imagine cute monster photographer mascot, round body, pastel purple color, holding camera, kawaii style, vector art, clean lines, transparent background --v 6 --style cute"

3. **Adobe Firefly**
   - Bon pour générer des variations cohérentes
   - Style vectoriel propre

4. **Leonardo.ai**
   - Excellent pour les styles cartoon
   - Bon contrôle de la cohérence entre variantes

### Pour les Animations
1. **Lottie Creator**
   - Convertir SVG en animations Lottie

2. **Rive**
   - Créer des animations interactives

3. **After Effects + Bodymovin**
   - Pour animations complexes exportées en Lottie

## Prompts IA Détaillés

### Prompt Base (à adapter par monstre)
```
Create a cute, friendly monster mascot character for a children's photo app.

Character details:
- Body: Round, soft, pudgy shape with smooth edges
- Color: [Violet/Pink/Mint/Coral/Yellow/Sky blue]
- Features: [One big eye/Two eyes/Multiple small eyes], [antennae/horns/tentacles]
- Expression: Happy, warm, inviting smile
- Pose: Holding a [vintage/modern/instant] camera in front, ready to take a photo
- Style: Kawaii, children's book illustration, premium quality
- Background: Transparent
- Lighting: Soft, even lighting with subtle highlights
- Art style: Vector-like, clean lines, flat colors with subtle gradients
- Size: High resolution, suitable for mobile app (2048x2048px)

Additional requirements:
- Simple enough to be recognizable at small sizes
- Distinct silhouette
- Professional and premium feel
- Suitable for children aged 3-12
```

### Variations de Prompts par État

#### Pour la Pose Neutre
"...standing confidently with camera, friendly smile..."

#### Pour la Pose Action
"...actively taking a photo, camera raised, excited expression, slight motion blur on camera..."

#### Pour la Pose Célébration
"...jumping with joy, holding camera up, thumbs up with other hand, sparkles around..."

## Spécifications Techniques

### Formats et Résolutions

#### Assets Mobiles
- **@1x**: 128x128px (thumbnails)
- **@2x**: 256x256px (standard)
- **@3x**: 512x512px (haute résolution)

#### Assets Tablettes
- **Standard**: 512x512px
- **Haute résolution**: 1024x1024px

#### Web
- **WebP**: Compression optimale pour web
- **Fallback PNG**: Pour compatibilité

### Optimisation

#### Images Statiques
- Format primaire: WebP (qualité 80)
- Format fallback: PNG-8 avec transparence
- Compression: TinyPNG ou similar
- Taille cible: < 50KB par image

#### Animations
- Format: Lottie JSON (préféré) ou GIF optimisé
- Durée: 1-2 secondes
- FPS: 30 pour Lottie, 15 pour GIF
- Taille cible: < 100KB par animation

### Couleurs (Correspondance Exacte)

```json
{
  "violet": "#8B7BE8",
  "rose": "#FF9ECD",
  "menthe": "#7FDBCA",
  "corail": "#FFB494",
  "jaune": "#FFE66D",
  "ciel": "#A8D8FF"
}
```

## Checklist de Validation

Avant d'intégrer un asset, vérifier:

- [ ] La couleur correspond exactement à la palette
- [ ] L'expression est chaleureuse et appropriée pour enfants
- [ ] L'appareil photo est clairement visible et reconnaissable
- [ ] Le fond est transparent (PNG)
- [ ] La résolution est suffisante (minimum 512x512px)
- [ ] Le fichier est optimisé (< 50KB pour static, < 100KB pour animé)
- [ ] Le style est cohérent avec les autres monstres
- [ ] Le monstre est reconnaissable à petite taille (64x64px)
- [ ] Pas de texte ou éléments trop détaillés
- [ ] Les animations sont fluides et bouclent parfaitement

## Prochaines Étapes

1. Générer les 6 monstres principaux en pose neutre
2. Valider le style et les couleurs
3. Créer les variations de poses
4. Ajouter les animations légères
5. Optimiser tous les assets
6. Intégrer dans l'application
7. Tester sur différentes tailles d'écran

## Support Temporaire

En attendant les assets IA, l'application utilise des emojis comme placeholders:
- 👾 (Violet - Alien)
- 👹 (Rose - Ogre)
- 👺 (Menthe - Goblin)
- 🤖 (Ciel - Robot)
- 👻 (Blanc - Fantôme)
- 🐙 (Bleu - Pieuvre)
