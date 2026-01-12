export type ThemeType = 'default' | 'neon' | 'pastel' | 'seasonal';
export type SeasonalVariant = 'christmas' | 'halloween' | 'spring' | 'summer' | 'fall' | 'winter';

export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    pastel: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    pastel: string;
  };
  accent: {
    mint: string;
    coral: string;
    yellow: string;
    sky: string;
    lavender: string;
  };
  neutral: {
    white: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  success: string;
  warning: string;
  error: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: {
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeights: {
      regular: string;
      medium: string;
      bold: string;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    full: number;
  };
  shadows: {
    sm: any;
    md: any;
    lg: any;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
  };
  monsters: {
    emojis: string[];
    colors: string[];
  };
  glow?: boolean;
}

const defaultTheme: ThemeConfig = {
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

const neonTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    primary: {
      main: '#00F0FF',
      light: '#5FF5FF',
      dark: '#00C8D4',
      pastel: '#B8FFFF',
    },
    secondary: {
      main: '#FF00FF',
      light: '#FF5CFF',
      dark: '#CC00CC',
      pastel: '#FFB8FF',
    },
    accent: {
      mint: '#00FF88',
      coral: '#FF4D00',
      yellow: '#FFFF00',
      sky: '#00A3FF',
      lavender: '#B800FF',
    },
    neutral: {
      white: '#FFFFFF',
      background: '#0A0014',
      surface: '#1A0A28',
      border: '#3D2654',
      text: {
        primary: '#FFFFFF',
        secondary: '#D4B5FF',
        tertiary: '#8B7BA8',
      },
    },
    success: '#00FF88',
    warning: '#FFFF00',
    error: '#FF0055',
  },
  shadows: {
    sm: {
      shadowColor: '#00F0FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#00F0FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 16,
      elevation: 4,
    },
    lg: {
      shadowColor: '#00F0FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  monsters: {
    emojis: ['⚡', '💥', '✨', '🌟', '💫', '🔮', '🎆', '🎇', '💎', '🌈'],
    colors: ['#00F0FF', '#FF00FF', '#00FF88', '#FF4D00', '#FFFF00', '#B800FF'],
  },
  glow: true,
};

const pastelTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    primary: {
      main: '#FFB5D8',
      light: '#FFD4E8',
      dark: '#FF8FC0',
      pastel: '#FFF0F6',
    },
    secondary: {
      main: '#B5E8FF',
      light: '#D4F3FF',
      dark: '#8FD4FF',
      pastel: '#F0FAFF',
    },
    accent: {
      mint: '#B5FFE8',
      coral: '#FFDDB5',
      yellow: '#FFF9B5',
      sky: '#D4E8FF',
      lavender: '#E8D4FF',
    },
    neutral: {
      white: '#FFFFFF',
      background: '#FFF9FC',
      surface: '#FFFFFF',
      border: '#FFE8F5',
      text: {
        primary: '#7A5968',
        secondary: '#A88899',
        tertiary: '#C4AAB5',
      },
    },
    success: '#B5FFE8',
    warning: '#FFF9B5',
    error: '#FFB5B5',
  },
  shadows: {
    sm: {
      shadowColor: '#FFB5D8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#FFB5D8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#FFB5D8',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  monsters: {
    emojis: ['🌸', '🦋', '🌺', '🐰', '🦄', '🌼', '🐣', '🌷', '🦢', '🌻'],
    colors: ['#FFB5D8', '#B5E8FF', '#B5FFE8', '#FFDDB5', '#FFF9B5', '#E8D4FF'],
  },
};

const seasonalThemes: Record<SeasonalVariant, ThemeConfig> = {
  christmas: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#D42426',
        light: '#FF5757',
        dark: '#A01C1E',
        pastel: '#FFE5E5',
      },
      secondary: {
        main: '#1B7B3F',
        light: '#2DA65D',
        dark: '#145C2F',
        pastel: '#E5F5EC',
      },
      accent: {
        mint: '#7FDBCA',
        coral: '#FFB494',
        yellow: '#FFD700',
        sky: '#A8D8FF',
        lavender: '#D4B5FF',
      },
      neutral: {
        white: '#FFFFFF',
        background: '#FFF9F5',
        surface: '#FFFFFF',
        border: '#FFE5E5',
        text: {
          primary: '#4A2020',
          secondary: '#8B5A5A',
          tertiary: '#B59090',
        },
      },
      success: '#1B7B3F',
      warning: '#FFD700',
      error: '#D42426',
    },
    monsters: {
      emojis: ['🎅', '🎄', '⛄', '🎁', '⭐', '🔔', '🦌', '❄️', '🕯️', '🤶'],
      colors: ['#D42426', '#1B7B3F', '#FFD700', '#FFFFFF', '#A8D8FF', '#FFB494'],
    },
  },
  halloween: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#FF6B35',
        light: '#FF9B6B',
        dark: '#D4541C',
        pastel: '#FFE5DC',
      },
      secondary: {
        main: '#5D3FD3',
        light: '#8B7BE8',
        dark: '#3D2687',
        pastel: '#E8E3FF',
      },
      accent: {
        mint: '#7FDBCA',
        coral: '#FF6B35',
        yellow: '#FFD700',
        sky: '#A8D8FF',
        lavender: '#5D3FD3',
      },
      neutral: {
        white: '#FFFFFF',
        background: '#1A0A14',
        surface: '#2D1B28',
        border: '#4A2F47',
        text: {
          primary: '#FFE5DC',
          secondary: '#D4AAB5',
          tertiary: '#B59090',
        },
      },
      success: '#7FDBCA',
      warning: '#FFD700',
      error: '#FF6B35',
    },
    monsters: {
      emojis: ['🎃', '👻', '🦇', '🕷️', '🕸️', '🧙', '🧛', '🧟', '💀', '🌙'],
      colors: ['#FF6B35', '#5D3FD3', '#000000', '#FFD700', '#8B7BE8', '#FF9494'],
    },
  },
  spring: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#FF69B4',
        light: '#FF9ED4',
        dark: '#D44A8F',
        pastel: '#FFE8F5',
      },
      secondary: {
        main: '#7FDB8E',
        light: '#A8E8B4',
        dark: '#5CB569',
        pastel: '#E5F5E8',
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
        background: '#F9FFF5',
        surface: '#FFFFFF',
        border: '#E5F5E8',
        text: {
          primary: '#2D4A2F',
          secondary: '#5C8B5F',
          tertiary: '#90B593',
        },
      },
      success: '#7FDB8E',
      warning: '#FFE66D',
      error: '#FF9494',
    },
    monsters: {
      emojis: ['🌸', '🌺', '🌻', '🌷', '🦋', '🐝', '🌼', '🌱', '🐣', '🐞'],
      colors: ['#FF69B4', '#7FDB8E', '#FFE66D', '#A8D8FF', '#D4B5FF', '#FFB494'],
    },
  },
  summer: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#FFD700',
        light: '#FFE84D',
        dark: '#D4B300',
        pastel: '#FFF9E5',
      },
      secondary: {
        main: '#00B8D4',
        light: '#5CD4E8',
        dark: '#0095B0',
        pastel: '#E5F8FF',
      },
      accent: {
        mint: '#7FDBCA',
        coral: '#FF6B35',
        yellow: '#FFD700',
        sky: '#00B8D4',
        lavender: '#D4B5FF',
      },
      neutral: {
        white: '#FFFFFF',
        background: '#FFFEF5',
        surface: '#FFFFFF',
        border: '#FFF9E5',
        text: {
          primary: '#4A3D20',
          secondary: '#8B7B5A',
          tertiary: '#B5A790',
        },
      },
      success: '#7FDBCA',
      warning: '#FFD700',
      error: '#FF6B35',
    },
    monsters: {
      emojis: ['☀️', '🏖️', '🌊', '🏄', '🍉', '🍦', '🌴', '🐚', '🦀', '🐠'],
      colors: ['#FFD700', '#00B8D4', '#FF6B35', '#7FDBCA', '#A8D8FF', '#FFB494'],
    },
  },
  fall: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#D2691E',
        light: '#E8965C',
        dark: '#A85318',
        pastel: '#FFE8DC',
      },
      secondary: {
        main: '#8B4513',
        light: '#B56B3B',
        dark: '#6B3410',
        pastel: '#F5E5DC',
      },
      accent: {
        mint: '#7FDBCA',
        coral: '#FF6B35',
        yellow: '#FFD700',
        sky: '#A8D8FF',
        lavender: '#D4B5FF',
      },
      neutral: {
        white: '#FFFFFF',
        background: '#FFF9F0',
        surface: '#FFFFFF',
        border: '#FFE8DC',
        text: {
          primary: '#4A3020',
          secondary: '#8B6A5A',
          tertiary: '#B59A90',
        },
      },
      success: '#7FDB8E',
      warning: '#FFD700',
      error: '#D2691E',
    },
    monsters: {
      emojis: ['🍂', '🍁', '🌰', '🦊', '🍄', '🎃', '🦔', '🐿️', '🍃', '🦃'],
      colors: ['#D2691E', '#8B4513', '#FFD700', '#FF6B35', '#7FDB8E', '#B56B3B'],
    },
  },
  winter: {
    ...defaultTheme,
    colors: {
      primary: {
        main: '#5CB8E8',
        light: '#8FD4FF',
        dark: '#3D95C4',
        pastel: '#E5F5FF',
      },
      secondary: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#E8E8E8',
        pastel: '#FFFFFF',
      },
      accent: {
        mint: '#7FDBCA',
        coral: '#FFB494',
        yellow: '#FFE66D',
        sky: '#5CB8E8',
        lavender: '#D4B5FF',
      },
      neutral: {
        white: '#FFFFFF',
        background: '#F0F8FF',
        surface: '#FFFFFF',
        border: '#E5F5FF',
        text: {
          primary: '#2D4A5C',
          secondary: '#5C7B8B',
          tertiary: '#90AAB5',
        },
      },
      success: '#7FDBCA',
      warning: '#FFE66D',
      error: '#FF9494',
    },
    monsters: {
      emojis: ['❄️', '⛄', '☃️', '🎿', '⛷️', '🏂', '🧊', '🦌', '🐧', '🎄'],
      colors: ['#5CB8E8', '#FFFFFF', '#7FDBCA', '#D4B5FF', '#A8D8FF', '#FFB494'],
    },
  },
};

export const themes: Record<ThemeType, ThemeConfig | Record<SeasonalVariant, ThemeConfig>> = {
  default: defaultTheme,
  neon: neonTheme,
  pastel: pastelTheme,
  seasonal: seasonalThemes,
};

export const getTheme = (
  themeType: ThemeType,
  seasonalVariant?: SeasonalVariant | null
): ThemeConfig => {
  if (themeType === 'seasonal' && seasonalVariant) {
    return seasonalThemes[seasonalVariant];
  }

  const theme = themes[themeType];
  return theme as ThemeConfig;
};

export const themeOptions = [
  { id: 'default', name: 'Par Défaut', icon: '🎨', description: 'Thème original coloré et joyeux' },
  { id: 'neon', name: 'Néon', icon: '⚡', description: 'Couleurs vives et lumières vibrantes' },
  { id: 'pastel', name: 'Pastel', icon: '🌸', description: 'Douceur et couleurs pastel' },
  { id: 'seasonal', name: 'Saisonnier', icon: '🎄', description: 'Thèmes festifs et saisonniers' },
];

export const seasonalOptions = [
  { id: 'christmas', name: 'Noël', icon: '🎄', description: 'Rouge et vert festif' },
  { id: 'halloween', name: 'Halloween', icon: '🎃', description: 'Orange et violet effrayant' },
  { id: 'spring', name: 'Printemps', icon: '🌸', description: 'Rose et vert frais' },
  { id: 'summer', name: 'Été', icon: '☀️', description: 'Jaune et bleu ensoleillé' },
  { id: 'fall', name: 'Automne', icon: '🍂', description: 'Brun et orange chaleureux' },
  { id: 'winter', name: 'Hiver', icon: '❄️', description: 'Bleu et blanc glacé' },
];
