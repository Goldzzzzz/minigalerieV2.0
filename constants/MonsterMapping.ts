import { MonsterColor } from '@/components/MonsterAvatar';

export const emojiToMonsterColor: Record<string, MonsterColor> = {
  '👾': 'violet',
  '👹': 'rose',
  '👺': 'mint',
  '🤖': 'sky',
  '👻': 'violet',
  '🐙': 'mint',
  '🦄': 'rose',
  '🦖': 'coral',
  '🐲': 'violet',
  '🦕': 'coral',
  '📸': 'violet',
  '📷': 'sky',
  '🌟': 'yellow',
};

export const colorToMonsterColor: Record<string, MonsterColor> = {
  '#8B7BE8': 'violet',
  '#FF9ECD': 'rose',
  '#7FDBCA': 'mint',
  '#FFB494': 'coral',
  '#FFE66D': 'yellow',
  '#A8D8FF': 'sky',
};

export function getMonsterColorFromEmoji(emoji: string): MonsterColor {
  return emojiToMonsterColor[emoji] || 'violet';
}

export function getMonsterColorFromHex(hex: string): MonsterColor {
  return colorToMonsterColor[hex] || 'violet';
}

export interface MonsterAssetPaths {
  static: {
    neutral: string;
    action: string;
    celebration: string;
  };
  animated: {
    bounce: string;
    celebrate: string;
  };
  thumbnail: string;
}

export function getMonsterAssetPaths(color: MonsterColor): MonsterAssetPaths {
  const basePath = '/assets/monsters';

  return {
    static: {
      neutral: `${basePath}/static/${color}-neutral.png`,
      action: `${basePath}/static/${color}-action.png`,
      celebration: `${basePath}/static/${color}-celebration.png`,
    },
    animated: {
      bounce: `${basePath}/animated/${color}-bounce.json`,
      celebrate: `${basePath}/animated/${color}-celebrate.json`,
    },
    thumbnail: `${basePath}/thumbnails/${color}-thumb.png`,
  };
}

export const MONSTER_NAMES: Record<MonsterColor, string> = {
  violet: 'Snapix',
  rose: 'Photini',
  mint: 'Clicky',
  coral: 'Flashy',
  yellow: 'Sparkle',
  sky: 'Pixelbot',
};

export const MONSTER_DESCRIPTIONS: Record<MonsterColor, string> = {
  violet: 'Le monstre violet qui adore les portraits!',
  rose: 'La photographe rose experte en paysages!',
  mint: 'Le monstre menthe qui capture les détails!',
  coral: 'L\'aventurier corail des photos d\'action!',
  yellow: 'L\'étoile jaune des photos lumineuses!',
  sky: 'Le robot bleu des photos techniques!',
};
