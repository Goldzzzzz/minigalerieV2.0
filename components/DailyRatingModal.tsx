import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Star } from 'lucide-react-native';
import { Theme } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import ParentalAuthModal from './ParentalAuthModal';

interface DailyRatingModalProps {
  visible: boolean;
  date: Date;
  existingRating?: { rating_value: number; notes: string; id: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DailyRatingModal({
  visible,
  date,
  existingRating,
  onClose,
  onSuccess,
}: DailyRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(existingRating?.rating_value || 0);
  const [notes, setNotes] = useState(existingRating?.notes || '');
  const [saving, setSaving] = useState(false);
  const [showParentalAuth, setShowParentalAuth] = useState(false);

  const handleRatingPress = (rating: number) => {
    setSelectedRating(rating);
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5:
        return '#4ECDC4';
      case 4:
        return '#95E1D3';
      case 3:
        return '#FFD93D';
      case 2:
        return '#FFB347';
      case 1:
        return '#FF6B6B';
      default:
        return Theme.colors.neutral.border;
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Très bien';
      case 3:
        return 'Bien';
      case 2:
        return 'Moyen';
      case 1:
        return 'À améliorer';
      default:
        return 'Sélectionne une note';
    }
  };

  const handleSave = () => {
    if (selectedRating === 0) {
      Alert.alert('Attention', 'Sélectionne une note avant de sauvegarder');
      return;
    }
    setShowParentalAuth(true);
  };

  const handleParentalAuthSuccess = async () => {
    setShowParentalAuth(false);
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Erreur', 'Utilisateur non trouvé');
        setSaving(false);
        return;
      }

      const dateString = date.toISOString().split('T')[0];

      if (existingRating) {
        const { error } = await supabase
          .from('daily_ratings')
          .update({
            rating_value: selectedRating,
            notes: notes.trim(),
          })
          .eq('id', existingRating.id);

        if (error) {
          console.error('Error updating rating:', error);
          Alert.alert('Erreur', `Impossible de mettre à jour la note: ${error.message}`);
          return;
        }
      } else {
        const { error } = await supabase.from('daily_ratings').insert({
          user_id: session.user.id,
          rating_date: dateString,
          rating_value: selectedRating,
          notes: notes.trim(),
        });

        if (error) {
          console.error('Error creating rating:', error);
          Alert.alert('Erreur', `Impossible de créer la note: ${error.message}`);
          return;
        }
      }

      Alert.alert('Succès', 'Note sauvegardée!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving rating:', error);
      Alert.alert('Erreur', `Impossible de sauvegarder: ${error?.message || 'erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingRating) return;
    setShowParentalAuth(true);
  };

  const handleParentalAuthSuccessForDelete = async () => {
    setShowParentalAuth(false);
    setSaving(true);

    try {
      if (!existingRating) return;

      const { error } = await supabase.from('daily_ratings').delete().eq('id', existingRating.id);

      if (error) {
        console.error('Error deleting rating:', error);
        Alert.alert('Erreur', `Impossible de supprimer la note: ${error.message}`);
        return;
      }

      Alert.alert('Succès', 'Note supprimée!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      Alert.alert('Erreur', `Impossible de supprimer: ${error?.message || 'erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedRating(existingRating?.rating_value || 0);
    setNotes(existingRating?.notes || '');
    onClose();
  };

  const formatDate = (date: Date) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Noter la journée</Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={Theme.colors.neutral.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.dateText}>{formatDate(date)}</Text>

            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Comment s'est passée cette journée?</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => handleRatingPress(rating)}
                    style={styles.starButton}>
                    <Star
                      size={48}
                      color={
                        selectedRating >= rating
                          ? getRatingColor(selectedRating)
                          : Theme.colors.neutral.border
                      }
                      fill={
                        selectedRating >= rating
                          ? getRatingColor(selectedRating)
                          : Theme.colors.neutral.white
                      }
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {selectedRating > 0 && (
                <Text style={[styles.ratingLabel, { color: getRatingColor(selectedRating) }]}>
                  {getRatingLabel(selectedRating)}
                </Text>
              )}
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.sectionLabel}>Notes (optionnel)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ajoute un commentaire sur cette journée..."
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonsContainer}>
              {existingRating && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={saving}>
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={Theme.colors.neutral.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Sauvegarder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ParentalAuthModal
        visible={showParentalAuth}
        onClose={() => setShowParentalAuth(false)}
        onAuthenticated={existingRating && selectedRating === 0 ? handleParentalAuthSuccessForDelete : handleParentalAuthSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 64, 99, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.neutral.white,
    borderTopLeftRadius: Theme.borderRadius.xxl,
    borderTopRightRadius: Theme.borderRadius.xxl,
    padding: Theme.spacing.xxl,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
  },
  dateText: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.neutral.text.secondary,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.neutral.text.primary,
    marginBottom: Theme.spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginVertical: Theme.spacing.md,
  },
  starButton: {
    padding: Theme.spacing.xs,
  },
  ratingLabel: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.bold as any,
    marginTop: Theme.spacing.sm,
  },
  notesSection: {
    marginBottom: Theme.spacing.xl,
  },
  notesInput: {
    backgroundColor: Theme.colors.neutral.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.md,
    borderWidth: 2,
    borderColor: Theme.colors.neutral.border,
    color: Theme.colors.neutral.text.primary,
    minHeight: 80,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  button: {
    flex: 1,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary.main,
  },
  saveButtonText: {
    color: Theme.colors.neutral.white,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
  deleteButton: {
    backgroundColor: Theme.colors.neutral.background,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.bold as any,
  },
});
