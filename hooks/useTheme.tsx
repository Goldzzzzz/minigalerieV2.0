import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ThemeType, SeasonalVariant, ThemeConfig, getTheme } from '@/constants/Themes';

interface ThemeContextType {
  theme: ThemeConfig;
  themeType: ThemeType;
  seasonalVariant: SeasonalVariant | null;
  setTheme: (type: ThemeType, seasonal?: SeasonalVariant | null) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>('default');
  const [seasonalVariant, setSeasonalVariant] = useState<SeasonalVariant | null>(null);
  const [theme, setThemeConfig] = useState<ThemeConfig>(getTheme('default'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreferences();
  }, []);

  useEffect(() => {
    const newTheme = getTheme(themeType, seasonalVariant);
    setThemeConfig(newTheme);
  }, [themeType, seasonalVariant]);

  const loadThemePreferences = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('theme, seasonal_variant')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading theme preferences:', error);
      } else if (preferences) {
        setThemeType(preferences.theme as ThemeType);
        setSeasonalVariant(preferences.seasonal_variant as SeasonalVariant | null);
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (type: ThemeType, seasonal: SeasonalVariant | null = null) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setThemeType(type);
        setSeasonalVariant(seasonal);
        return;
      }

      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingPrefs) {
        const { error } = await supabase
          .from('user_preferences')
          .update({
            theme: type,
            seasonal_variant: seasonal,
          })
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating theme:', error);
          throw error;
        }
      } else {
        const { error } = await supabase.from('user_preferences').insert({
          user_id: session.user.id,
          theme: type,
          seasonal_variant: seasonal,
        });

        if (error) {
          console.error('Error inserting theme:', error);
          throw error;
        }
      }

      setThemeType(type);
      setSeasonalVariant(seasonal);
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, seasonalVariant, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
