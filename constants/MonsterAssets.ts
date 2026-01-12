import { MonsterColor } from '@/components/MonsterAvatar';

const MONSTER_IMAGES: Record<MonsterColor, any> = {
  violet: require('@/assets/monsters/static/snapix.png'),
  rose: require('@/assets/monsters/static/photini.png'),
  mint: require('@/assets/monsters/static/clicky.png'),
  coral: require('@/assets/monsters/static/flashy.png'),
  yellow: require('@/assets/monsters/static/dotty.png'),
  sky: require('@/assets/monsters/static/pixelbot.png'),
};

export function getMonsterImage(color: MonsterColor): any {
  return MONSTER_IMAGES[color];
}

export function hasMonsterImage(color: MonsterColor): boolean {
  return color in MONSTER_IMAGES;
}
