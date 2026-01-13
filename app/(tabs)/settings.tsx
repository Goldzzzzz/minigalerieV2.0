import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Lock, Mail, Shield, Key, Palette } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import {
  themeOptions,
  seasonalOptions,
  ThemeType,
  SeasonalVariant,
} from '@/constants/Themes';

import { API_URL } from '@/lib/api';   // ✔️ LA BONNE VERSION
// -----------------------------
// CONFIG BACKEND + USER ID
// -----------------------------
const USER_ID_KEY = '@mini-galerie/user_id';

type ParentalControlSettings = {
  id: number;
  user_id: string;
  email: string;
  is_active: boolean;
  rating_scale: number;
  created_at?: string;
  updated_at?: string;
};

async function getOrCreateUserId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(USER_ID_KEY);
    if (existing) return existing;

    const random = Math.floor(Math.random() * 1_000_000_000);
    const newId = `user-${random}`;
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error('Error with user id storage:', error);
    // fallback très simple si AsyncStorage casse
    return `user-${Date.now()}`;
  }
}

export default function SettingsScreen() {
  const { themeType, seasonalVariant, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ParentalControlSettings | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [ratingScale, setRatingScale] = useState(10);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(themeType);
  const [selectedSeasonal, setSelectedSeasonal] = useState<SeasonalVariant | null>(
    seasonalVariant
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const userId = await getOrCreateUserId();

      if (!API_URL) {
        console.error('EXPO_PUBLIC_API_URL manquant');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/parental-settings/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // pas encore de settings configurés
          setSettings(null);
        } else {
          throw new Error('Erreur lors du chargement des paramètres');
        }
        return;
      }

      const data: ParentalControlSettings = await response.json();
      setSettings(data);
      setEmail(data.email);
      setIsActive(data.is_active);
      setRatingScale(data.rating_scale);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  };

  const handleSaveSettings = async () => {
    if (!settings && !password) {
      Alert.alert('Erreur', 'Veuillez définir un mot de passe');
      return;
    }

    if (!settings && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (!settings && password.length < 4) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 4 caractères');
      return;
    }

    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer un email de récupération');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    if (!API_URL) {
      Alert.alert('Erreur', 'Configuration API manquante');
      return;
    }

    setSaving(true);
    try {
      const userId = await getOrCreateUserId();

      let passwordHash: string | undefined;
      if (password) {
        if (password !== confirmPassword) {
          Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
          setSaving(false);
          return;
        }
        passwordHash = await hashPassword(password);
      }

      const payload: any = {
        user_id: userId,
        email,
        is_active: isActive,
        rating_scale: ratingScale,
      };

      if (passwordHash) {
        payload.password_hash = passwordHash;
      }

      let url = `${API_URL}/parental-settings`;
      let method: 'POST' | 'PUT' = 'POST';

      if (settings) {
        // mise à jour
        method = 'PUT';
        url = `${API_URL}/parental-settings/${settings.id}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error('Impossible de sauvegarder les paramètres');
      }

      Alert.alert(
        'Succès',
        settings ? 'Paramètres mis à jour' : 'Contrôle parental configuré'
      );

      setPassword('');
      setConfirmPassword('');
      await loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!recoveryEmail) {
      Alert.alert('Erreur', 'Veuillez entrer votre email de récupération');
      return;
    }

    if (!API_URL) {
      Alert.alert('Erreur', 'Configuration API manquante');
      return;
    }

    setSaving(true);
    try {
      const userId = await getOrCreateUserId();

      const response = await fetch(`${API_URL}/parental-settings/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          email: recoveryEmail,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error("Impossible d'envoyer l'email de récupération");
      }

      Alert.alert(
        'Email envoyé',
        `Un code de récupération a été envoyé à ${recoveryEmail}. Le code est valide pendant 15 minutes.`
      );
      setRecoveryEmail('');
    } catch (error: any) {
      console.error('Error recovering password:', error);
      Alert.alert('Erreur', error.message || "Impossible d'envoyer l'email");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: ThemeType) => {
    try {
      setSelectedTheme(theme);
      if (theme !== 'seasonal') {
        setSelectedSeasonal(null);
        await setTheme(theme, null);
      } else if (selectedSeasonal) {
        await setTheme(theme, selectedSeasonal);
      } else {
        setSelectedSeasonal('christmas');
        await setTheme(theme, 'christmas');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le thème');
    }
  };

  const handleSeasonalChange = async (variant: SeasonalVariant) => {
    try {
      setSelectedSeasonal(variant);
      await setTheme('seasonal', variant);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le thème');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield size={48} color="#FF6B6B" />
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.subtitle}>Personnalisez votre expérience</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={24} color="#333" />
          <Text style={styles.sectionTitle}>Thème</Text>
        </View>

        <View style={styles.themeGrid}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.themeCard,
                selectedTheme === option.id && styles.themeCardActive,
              ]}
              onPress={() => handleThemeChange(option.id as ThemeType)}
            >
              <Text style={styles.themeIcon}>{option.icon}</Text>
              <Text style={styles.themeName}>{option.name}</Text>
              <Text style={styles.themeDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTheme === 'seasonal' && (
          <View style={styles.seasonalSection}>
            <Text style={styles.seasonalTitle}>Choisir une saison</Text>
            <View style={styles.seasonalGrid}>
              {seasonalOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.seasonalCard,
                    selectedSeasonal === option.id && styles.seasonalCardActive,
                  ]}
                  onPress={() => handleSeasonalChange(option.id as SeasonalVariant)}
                >
                  <Text style={styles.seasonalIcon}>{option.icon}</Text>
                  <Text style={styles.seasonalName}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lock size={24} color="#333" />
          <Text style={styles.sectionTitle}>Mot de passe</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {settings
              ? "Nouveau mot de passe (laisser vide pour garder l'actuel)"
              : 'Mot de passe'}
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Entrez un mot de passe"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez le mot de passe"
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Mail size={24} color="#333" />
          <Text style={styles.sectionTitle}>Email de récupération</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Key size={24} color="#333" />
          <Text style={styles.sectionTitle}>Paramètres</Text>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Activer le contrôle parental</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#CCC', true: '#FF6B6B' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Échelle de notation</Text>
          <View style={styles.scaleGrid}>
            {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((scale) => (
              <TouchableOpacity
                key={scale}
                style={[
                  styles.scaleButton,
                  ratingScale === scale && styles.scaleButtonActive,
                ]}
                onPress={() => setRatingScale(scale)}
              >
                <Text
                  style={[
                    styles.scaleButtonText,
                    ratingScale === scale && styles.scaleButtonTextActive,
                  ]}
                >
                  0-{scale}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSaveSettings}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.saveButtonText}>
            {settings ? 'Enregistrer les modifications' : 'Activer le contrôle parental'}
          </Text>
        )}
      </TouchableOpacity>

      {settings && (
        <View style={styles.recoverySection}>
          <Text style={styles.recoveryTitle}>Mot de passe oublié ?</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              placeholder="Email de récupération"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.recoveryButton, saving && styles.saveButtonDisabled]}
            onPress={handleRecoverPassword}
            disabled={saving}
          >
            <Text style={styles.recoveryButtonText}>Recevoir un code par email</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scaleButton: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  scaleButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  scaleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  scaleButtonTextActive: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recoverySection: {
    backgroundColor: '#FFF',
    marginTop: 20,
    marginBottom: 40,
    padding: 20,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recoveryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  recoveryButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  themeCardActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B6B',
    borderWidth: 3,
  },
  themeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  seasonalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  seasonalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  seasonalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seasonalCard: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  seasonalCardActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B6B',
    borderWidth: 3,
  },
  seasonalIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  seasonalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});
