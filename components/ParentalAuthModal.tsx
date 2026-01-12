import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Lock } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/Theme';

interface ParentalAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function ParentalAuthModal({
  visible,
  onClose,
  onAuthenticated,
}: ParentalAuthModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const hashPassword = async (password: string): Promise<string> => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  };

  const handleAuthenticate = async () => {
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer le mot de passe');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        setLoading(false);
        return;
      }

      const { data: settings, error } = await supabase
        .from('parental_control_settings')
        .select('password_hash')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !settings) {
        Alert.alert('Erreur', 'Contrôle parental non configuré');
        return;
      }

      const hashedPassword = await hashPassword(password);

      if (hashedPassword === settings.password_hash) {
        setPassword('');
        onAuthenticated();
      } else {
        Alert.alert('Erreur', 'Mot de passe incorrect');
      }
    } catch (error: any) {
      console.error('Error authenticating:', error);
      Alert.alert('Erreur', error.message || 'Erreur d\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Lock size={48} color="#FF6B6B" />
          </View>

          <Text style={styles.title}>Authentification Parentale</Text>
          <Text style={styles.subtitle}>
            Entrez le mot de passe pour continuer
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
            autoFocus
            onSubmitEditing={handleAuthenticate}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuthenticate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Valider</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 64, 99, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  container: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xxxl,
    width: '100%',
    maxWidth: 400,
    ...Theme.shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    padding: Theme.spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
    lineHeight: Theme.typography.fontSizes.md * Theme.typography.lineHeights.relaxed,
  },
  input: {
    backgroundColor: Theme.colors.neutral.background,
    borderWidth: 2,
    borderColor: Theme.colors.neutral.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    fontSize: Theme.typography.fontSizes.md,
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.neutral.text.primary,
  },
  button: {
    backgroundColor: Theme.colors.primary.main,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Theme.colors.neutral.white,
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
});
