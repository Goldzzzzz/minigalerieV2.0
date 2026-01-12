export const Theme = {
  colors: {
    primary: {
      main: '#8B7BE8',
      light: '#B5A7F5',
      dark: '#6B5BC2',
      pastel: '#E8E3FF',
    },
    secondary: {
      main: '#FF9ECD',
      light: '#FFB8DC',
      dark: '#E87AB3',
      pastel: '#FFE8F5',
    },
    accent: {
      mint: '#7FDBCA',
      coral: '#FFB494',
      yellow: '#FFE66D',
      sky: '#A8D8FF',
      lavender: '#D4B5FF',
    },
    neutral: {
      white: '#FFFFFF',
      background: '#F8F6FF',
      surface: '#FFFFFF',
      border: '#E8E3FF',
      text: {
        primary: '#4A4063',
        secondary: '#8B7BA8',
        tertiary: '#B5A7C4',
      },
    },
    success: '#7FDBCA',
    warning: '#FFE66D',
    error: '#FF9494',
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    fontWeights: {
      regular: '400',
      medium: '600',
      bold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#8B7BE8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#8B7BE8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#8B7BE8',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
  },
  monsters: {
    emojis: ['👾', '👹', '👺', '🤖', '👻', '🐙', '🦄', '🦖', '🐲', '🦕'],
    colors: ['#8B7BE8', '#FF9ECD', '#7FDBCA', '#FFB494', '#FFE66D', '#A8D8FF'],
  },
};

export const getMonsterForAlbum = (index: number) => {
  const monsters = Theme.monsters.emojis;
  return monsters[index % monsters.length];
};

export const getColorForAlbum = (index: number) => {
  const colors = Theme.monsters.colors;
  return colors[index % colors.length];
};
