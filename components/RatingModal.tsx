import { useState, useEffect } from 'react';
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
import { X, Star } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { PhotoRating } from '@/types/database';
import { Theme } from '@/constants/Theme';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  photoId: string;
  maxRating: number;
  existingRating?: PhotoRating | null;
  onRatingUpdated: () => void;
}

export default function RatingModal({
  visible,
  onClose,
  photoId,
  maxRating,
  existingRating,
  onRatingUpdated,
}: RatingModalProps) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating.toString());
      setComment(existingRating.comment || '');
    } else {
      setRating('');
      setComment('');
    }
  }, [existingRating, visible]);

  const handleSave = async () => {
    const ratingNumber = parseInt(rating);

    if (isNaN(ratingNumber) || ratingNumber < 0 || ratingNumber > maxRating) {
      Alert.alert('Erreur', `La note doit être entre 0 et ${maxRating}`);
      return;
    }

    setLoading(true);
    try {
      if (existingRating) {
        const { error } = await supabase
          .from('photo_ratings')
          .update({
            rating: ratingNumber,
            rating_scale: maxRating,
            comment: comment.trim(),
          })
          .eq('id', existingRating.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('photo_ratings')
          .insert({
            photo_id: photoId,
            rating: ratingNumber,
            rating_scale: maxRating,
            comment: comment.trim(),
          });

        if (error) throw error;
      }

      Alert.alert('Succès', 'Note enregistrée avec succès');
      onRatingUpdated();
      handleClose();
    } catch (error: any) {
      console.error('Error saving rating:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder la note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRating) return;

    Alert.alert(
      'Supprimer la note',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('photo_ratings')
                .delete()
                .eq('id', existingRating.id);

              if (error) throw error;

              Alert.alert('Succès', 'Note supprimée');
              onRatingUpdated();
              handleClose();
            } catch (error: any) {
              console.error('Error deleting rating:', error);
              Alert.alert('Erreur', error.message || 'Impossible de supprimer');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setRating('');
    setComment('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Star size={48} color="#FFD700" fill="#FFD700" />
          </View>

          <Text style={styles.title}>Attribuer des points</Text>
          <Text style={styles.subtitle}>Note sur {maxRating}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Points</Text>
            <TextInput
              style={styles.input}
              value={rating}
              onChangeText={setRating}
              placeholder={`0-${maxRating}`}
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commentaire (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="Bravo pour cette belle photo !"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {existingRating ? 'Modifier' : 'Enregistrer'}
              </Text>
            )}
          </TouchableOpacity>

          {existingRating && (
            <TouchableOpacity
              style={[styles.deleteButton, loading && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={loading}>
              <Text style={styles.deleteButtonText}>Supprimer la note</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 64, 99, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Theme.colors.neutral.white,
    borderTopLeftRadius: Theme.borderRadius.xxl,
    borderTopRightRadius: Theme.borderRadius.xxl,
    padding: Theme.spacing.xxxl,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    padding: Theme.spacing.xs,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  inputGroup: {
    marginBottom: Theme.spacing.xl,
  },
  label: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.medium as any,
    color: Theme.colors.neutral.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: Theme.colors.neutral.background,
    borderWidth: 2,
    borderColor: Theme.colors.neutral.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.neutral.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Theme.colors.accent.yellow,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Theme.colors.neutral.text.primary,
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
  deleteButton: {
    backgroundColor: Theme.colors.neutral.white,
    borderWidth: 2,
    borderColor: Theme.colors.error,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  deleteButtonText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.medium as any,
  },
});
