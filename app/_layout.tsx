import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    initializeAuth(); // Auth en arrière‑plan
  }, []);

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const deviceId = await getOrCreateDeviceId();
        const email = `device-${deviceId}@local.app`;
        const password = deviceId;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError?.message?.includes('Invalid login credentials')) {
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { device_id: deviceId },
            },
          });
        }
      }
    } catch (error) {
      console.error('Auth init error:', error);
    }
  };

  const getOrCreateDeviceId = async (): Promise<string> => {
    try {
      if (typeof localStorage !== 'undefined') {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
          deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
      }
    } catch (error) {
      console.error('localStorage error:', error);
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}