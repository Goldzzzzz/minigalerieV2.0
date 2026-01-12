import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Trash2, Share2, RefreshCw, Star } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Album, Photo, ParentalControlSettings, PhotoRating } from '@/types/database';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import ParentalAuthModal from '@/components/ParentalAuthModal';
import RatingModal from '@/components/RatingModal';
import { Theme } from '@/constants/Theme';
import AlbumCard from '@/components/AlbumCard';
import PhotoCard from '@/components/PhotoCard';
import MonsterIcon from '@/components/MonsterIcon';

export default function AlbumsScreen() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings | null>(null);
  const [ratings, setRatings] = useState<Map<string, PhotoRating>>(new Map());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPhotoForRating, setSelectedPhotoForRating] = useState<Photo | null>(null);
  const [authAction, setAuthAction] = useState<'rating' | 'delete_album'>('rating');
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);

  useEffect(() => {
    loadData();
    loadParentalSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadParentalSettings();
      if (selectedAlbum) {
        loadPhotos(selectedAlbum.id);
      }
    }, [selectedAlbum])
  );

  useEffect(() => {
    if (selectedAlbum) {
      loadPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const loadParentalSettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('parental_control_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (data) {
        setParentalSettings(data);
      }
    } catch (error) {
      console.error('Error loading parental settings:', error);
    }
  };

  const loadRatings = async () => {
    if (photos.length === 0) return;

    try {
      const photoIds = photos.map((p) => p.id);
      const { data, error } = await supabase
        .from('photo_ratings')
        .select('*')
        .in('photo_id', photoIds);

      if (data) {
        const ratingsMap = new Map<string, PhotoRating>();
        data.forEach((rating) => {
          ratingsMap.set(rating.photo_id, rating);
        });
        setRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: albumsData, error: albumsError } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('sort_order', { ascending: true });

      if (albumsError) {
        console.error('Error loading albums:', albumsError);
        Alert.alert('Erreur', 'Impossible de charger les albums: ' + albumsError.message);
        return;
      }

      if (albumsData) {
        setAlbums(albumsData);
        if (albumsData.length > 0 && !selectedAlbum) {
          setSelectedAlbum(albumsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading albums:', error);
      Alert.alert('Erreur', 'Impossible de charger les albums');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (selectedAlbum) {
      await loadPhotos(selectedAlbum.id);
    }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('sort_order', { ascending: false });

      if (error) {
        console.error('Error loading photos:', error);
        return;
      }

      if (data) {
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  useEffect(() => {
    if (photos.length > 0) {
      loadRatings();
    }
  }, [photos]);

  const handleRatePhoto = (photo: Photo) => {
    if (!parentalSettings) {
      Alert.alert('Non disponible', 'Le contrôle parental doit être configuré pour attribuer des points');
      return;
    }

    if (!parentalSettings.is_active) {
      Alert.alert('Non activé', 'Le contrôle parental doit être activé pour attribuer des points');
      return;
    }

    setAuthAction('rating');
    setSelectedPhotoForRating(photo);
    setShowAuthModal(true);
  };

  const handleRequestDeleteAlbum = () => {
    if (!selectedAlbum) return;

    if (!parentalSettings) {
      Alert.alert('Configuration requise', 'Le contrôle parental doit être configuré pour supprimer un album. Configure-le dans les Paramètres.');
      return;
    }

    if (!parentalSettings.is_active) {
      Alert.alert('Activation requise', 'Le contrôle parental doit être activé pour supprimer un album. Active-le dans les Paramètres.');
      return;
    }

    setAuthAction('delete_album');
    setAlbumToDelete(selectedAlbum);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);

    if (authAction === 'rating') {
      setShowRatingModal(true);
    } else if (authAction === 'delete_album' && albumToDelete) {
      handleDeleteAlbum(albumToDelete.id);
      setAlbumToDelete(null);
    }
  };

  const handleRatingUpdated = async () => {
    await loadRatings();
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const albumName = albums.find(a => a.id === albumId)?.name || 'cet album';

      const { error: deleteError } = await supabase.from('albums').delete().eq('id', albumId);

      if (deleteError) {
        console.error('Error deleting album:', deleteError);
        Alert.alert('Erreur', `Impossible de supprimer l'album: ${deleteError.message}`);
        return;
      }

      const updatedAlbums = albums.filter((a) => a.id !== albumId);
      setAlbums(updatedAlbums);
      setSelectedAlbum(updatedAlbums[0] || null);
      setPhotos([]);
      Alert.alert('Supprimé', `L'album "${albumName}" a été supprimé avec succès.`);
    } catch (error: any) {
      console.error('Error deleting album:', error);
      Alert.alert('Erreur', `Impossible de supprimer l'album: ${error?.message || 'erreur inconnue'}`);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Supprimer la photo?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('photos').delete().eq('id', photoId);
            setPhotos(photos.filter((p) => p.id !== photoId));
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer la photo.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MonsterIcon colors={['violet', 'rose']} size={80} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (albums.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MonsterIcon colors={['mint', 'coral']} size={100} />
        <Text style={styles.emptyTitle}>Aucun album</Text>
        <Text style={styles.emptySubtitle}>
          Va à l'onglet Photos pour créer ton premier album monstre!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MonsterIcon colors={['rose']} size={40} />
        </View>
        <Text style={styles.title}>Albums Monstres</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
          <RefreshCw size={20} color={Theme.colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.albumsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumsScroll}>
          {albums.map((album, index) => (
            <AlbumCard
              key={album.id}
              name={album.name}
              icon={album.icon}
              color={album.color}
              onPress={() => setSelectedAlbum(album)}
              isSelected={selectedAlbum?.id === album.id}
              photoCount={photos.filter(p => p.album_id === album.id).length}
            />
          ))}
        </ScrollView>
      </View>

      {selectedAlbum && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#FF6B6B' }]}
            onPress={handleRequestDeleteAlbum}>
            <Trash2 size={20} color="white" />
            <Text style={styles.controlButtonText}>Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#4ECDC4' }]}>
            <Share2 size={20} color="white" />
            <Text style={styles.controlButtonText}>Partager</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.photosContainer}>
        {photos.length === 0 ? (
          <View style={styles.emptyPhotos}>
            <MonsterIcon colors={['yellow', 'sky']} size={80} />
            <Text style={styles.emptyPhotosText}>Aucune photo dans cet album</Text>
            <Text style={styles.emptyPhotosSubtext}>Ajoute des photos depuis l'onglet Photos!</Text>
          </View>
        ) : (
          <View style={styles.photosGrid}>
            {photos.map((photo) => {
              const rating = ratings.get(photo.id);
              return (
                <PhotoCard
                  key={photo.id}
                  uri={photo.image_uri}
                  onDelete={() => handleDeletePhoto(photo.id)}
                  onRate={parentalSettings?.is_active ? () => handleRatePhoto(photo) : undefined}
                  rating={rating}
                  showRating={parentalSettings?.is_active || false}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <ParentalAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthSuccess}
      />

      {selectedPhotoForRating && (
        <RatingModal
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedPhotoForRating(null);
          }}
          photoId={selectedPhotoForRating.id}
          maxRating={parentalSettings?.rating_scale || 10}
          existingRating={ratings.get(selectedPhotoForRating.id)}
          onRatingUpdated={handleRatingUpdated}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.lg,
  },
  loadingText: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.medium as any,
    color: Theme.colors.neutral.text.secondary,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.neutral.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.xxxl,
    lineHeight: Theme.typography.fontSizes.md * Theme.typography.lineHeights.relaxed,
  },
  header: {
    padding: Theme.spacing.xxxl,
    paddingTop: 60,
    backgroundColor: Theme.colors.secondary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: Theme.borderRadius.xxl,
    borderBottomRightRadius: Theme.borderRadius.xxl,
    ...Theme.shadows.lg,
  },
  headerIcon: {
    position: 'absolute',
    left: Theme.spacing.xl,
    top: 60,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxxl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.white,
    textAlign: 'center',
  },
  refreshButton: {
    position: 'absolute',
    right: Theme.spacing.xl,
    top: 60,
    padding: Theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: Theme.borderRadius.sm,
  },
  albumsSection: {
    paddingVertical: Theme.spacing.lg,
    paddingLeft: Theme.spacing.lg,
  },
  albumsScroll: {
    flexGrow: 0,
  },
  controls: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.neutral.white,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  controlButtonText: {
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.white,
  },
  photosContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  emptyPhotos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    paddingHorizontal: Theme.spacing.xxxl,
    gap: Theme.spacing.lg,
  },
  emptyPhotosText: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  emptyPhotosSubtext: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.neutral.text.secondary,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
