import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Camera, Image as ImageIcon, FolderPlus, X, Check, RotateCcw } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Album } from '@/types/database';
import { getMonsterForAlbum, getColorForAlbum } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import AnimatedButton from '@/components/AnimatedButton';
import AlbumCard from '@/components/AlbumCard';
import MonsterIcon from '@/components/MonsterIcon';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const cameraRef = useRef<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    initializeApp();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadAlbums();
      }
    }, [loading])
  );

  const initializeApp = async () => {
    try {
      await ensureDefaultAlbum();
      await loadAlbums();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureDefaultAlbum = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('name', 'Galerie')
        .maybeSingle();

      if (!existingAlbum) {
        await supabase.from('albums').insert({
          name: 'Galerie', icon: '📸', color: '#FF6B6B',
          user_id: userData.user.id, sort_order: 0,
        });
      }
    } catch (error) {
      console.error('Error ensuring default album:', error);
    }
  };
  
  const loadPhotos = async (albumId: number) => {
    try {
      const { data: remotePhotos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(remotePhotos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    }
  };

  const loadAlbums = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data) {
        setAlbums(data);
        let activeAlbum = selectedAlbum ? data.find(album => album.id === selectedAlbum.id) : data[0];
        if (!activeAlbum && data.length > 0) activeAlbum = data[0];
        
        if (activeAlbum) {
          if (!selectedAlbum || selectedAlbum.id !== activeAlbum.id) {
            setSelectedAlbum(activeAlbum);
          }
          await loadPhotos(activeAlbum.id);
        } else {
          setSelectedAlbum(null);
          setPhotos([]);
        }
      }
    } catch (error: any) {
      console.error('Error loading albums:', error);
      Alert.alert('Erreur', `Impossible de charger les albums: ${error?.message || 'erreur inconnue'}`);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') return Alert.alert('Non disponible', 'La caméra n\'est pas disponible sur le web');
    const permission = await requestCameraPermission();
    if (!permission.granted) return Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire.');
    setShowCamera(true);
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedPhoto(photo.uri);
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Erreur', 'Impossible de capturer la photo');
    }
  };

  const handleConfirmPhoto = async () => {
    if (!capturedPhoto || !selectedAlbum) return;

    const newPhoto = {
      id: Date.now(), album_id: selectedAlbum.id, image_uri: capturedPhoto,
      thumbnail_uri: capturedPhoto, created_at: new Date().toISOString(), sort_order: photos.length,
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);

    setCapturedPhoto(null);
    setShowCamera(false);
    
    Alert.alert('Succès', 'Photo ajoutée ! Envoi vers votre album...');

    try {
      const { error } = await supabase.from('photos').insert({
        album_id: newPhoto.album_id, image_uri: newPhoto.image_uri,
        thumbnail_uri: newPhoto.thumbnail_uri, sort_order: newPhoto.sort_order,
      });

      if (error) {
        console.error('Error saving photo to Supabase:', error);
        Alert.alert('Erreur réseau', "La photo n'a pas pu être envoyée. Elle reste visible pour l'instant.");
      } else {
        console.log('Photo saved to Supabase successfully');
        await loadPhotos(selectedAlbum.id);
      }
    } catch (e) {
      console.error('Error in background photo save:', e);
    }
  };
  
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
  };

  const handleImportPhoto = async () => {
    if (!selectedAlbum) return Alert.alert('Erreur', 'Sélectionne d\'abord un album!');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission refusée', 'L\'accès à la galerie est nécessaire.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages(uris);
      setShowImportPreview(true);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedAlbum || selectedImages.length === 0) return;
    setImporting(true);
    try {
      const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('album_id', selectedAlbum.id);
      const photosToInsert = selectedImages.map((uri, index) => ({
        album_id: selectedAlbum.id, image_uri: uri, thumbnail_uri: uri, sort_order: (count || 0) + index + 1,
      }));
      const { data, error } = await supabase.from('photos').insert(photosToInsert).select();
      if (error) throw error;
      if (data) {
        Alert.alert('Succès', `${selectedImages.length} photo(s) importée(s)! 🎉`);
        setShowImportPreview(false);
        setSelectedImages([]);
        await loadPhotos(selectedAlbum.id);
      }
    } catch (error: any) {
      console.error('Error importing photos:', error);
      Alert.alert('Erreur', `Impossible d'importer les photos: ${error?.message || 'erreur inconnue'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleOpenCreateAlbumModal = () => {
    setNewAlbumName('');
    setNewAlbumDescription('');
    setShowCreateAlbumModal(true);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return Alert.alert('Erreur', 'Entre un nom pour ton album!');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return Alert.alert('Erreur', 'Utilisateur non trouvé');
      const monster = getMonsterForAlbum(albums.length);
      const color = getColorForAlbum(albums.length);
      const { data, error } = await supabase.from('albums').insert({
        name: newAlbumName.trim(), icon: monster, color: color,
        user_id: userData.user.id, sort_order: albums.length,
      }).select().single();
      if (error) throw error;
      if (data) {
        setAlbums([...albums, data]);
        setSelectedAlbum(data);
        setShowCreateAlbumModal(false);
        Alert.alert('Bravo!', `Album "${data.name}" créé! 🎉`);
      }
    } catch (error: any) {
      console.error('Error creating album:', error);
      Alert.alert('Erreur', `Impossible de créer l'album: ${error?.message || 'erreur inconnue'}`);
    }
  };

  if (showCamera) {
    if (capturedPhoto) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.previewButton} onPress={handleRetakePhoto}>
              <RotateCcw size={32} color="white" />
              <Text style={styles.previewButtonText}>Reprendre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewButton, { backgroundColor: '#4ECDC4' }]}
              onPress={handleConfirmPhoto}>
              <Check size={32} color="white" />
              <Text style={styles.previewButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={() => {
              setCapturedPhoto(null);
              setShowCamera(false);
            }}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MonsterIcon colors={['violet', 'rose']} size={80} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MonsterIcon colors={['violet', 'sky']} size={120} />
        <Text style={styles.title}>Minigalerie</Text>
        <Text style={styles.subtitle}>Prêt a embellir tes albums ?</Text>
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedButton
          onPress={handleTakePhoto}
          title="Prendre une photo"
          icon={<Camera size={28} color={theme.colors.neutral.white} />}
          backgroundColor={theme.colors.primary.main}
        />
        <AnimatedButton
          onPress={handleImportPhoto}
          title="Importer des images"
          icon={<ImageIcon size={28} color={theme.colors.neutral.white} />}
          backgroundColor={theme.colors.secondary.main}
        />
        <AnimatedButton
          onPress={handleOpenCreateAlbumModal}
          title="Créer un album"
          icon={<FolderPlus size={28} color={theme.colors.neutral.white} />}
          backgroundColor={theme.colors.accent.mint}
        />
      </View>

      {albums.length > 0 && (
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Tes Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumsScroll}>
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                name={album.name}
                icon={album.icon}
                color={album.color}
                onPress={() => {
                  if(selectedAlbum?.id !== album.id) {
                    setSelectedAlbum(album);
                    loadPhotos(album.id);
                  }
                }}
                isSelected={selectedAlbum?.id === album.id}
                photoCount={album.id === selectedAlbum?.id ? photos.length : 0}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {selectedAlbum && (
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Photos de "{selectedAlbum.name}"</Text>
          {photos.length === 0 ? (
            <Text style={styles.subtitle}>Cet album est vide. Prenez une photo !</Text>
          ) : (
            <View style={styles.previewImagesGrid}>
              {photos.map((photo) => (
                <View key={photo.id || photo.image_uri} style={styles.previewImageItem}>
                  <Image source={{ uri: photo.image_uri }} style={styles.previewThumbnail} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Modal visible={showCreateAlbumModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Créer un album</Text>
              <TouchableOpacity onPress={() => setShowCreateAlbumModal(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'album"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
              maxLength={30}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description (optionnel)"
              value={newAlbumDescription}
              onChangeText={setNewAlbumDescription}
              multiline
              maxLength={100}
            />
            <TouchableOpacity style={styles.createButton} onPress={handleCreateAlbum}>
              <Text style={styles.createButtonText}>Créer l'album</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showImportPreview} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedImages.length} image(s) sélectionnée(s)
              </Text>
              <TouchableOpacity onPress={() => setShowImportPreview(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.previewGrid}>
              <View style={styles.previewImagesGrid}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.previewImageItem}>
                    <Image source={{ uri }} style={styles.previewThumbnail} />
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleConfirmImport}
              disabled={importing}>
              {importing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.createButtonText}>Importer dans {selectedAlbum?.name}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium as any,
    color: theme.colors.neutral.text.secondary,
  },
  header: {
    padding: theme.spacing.xxxl,
    paddingTop: 60,
    backgroundColor: theme.colors.primary.main,
    borderBottomLeftRadius: theme.borderRadius.xxxl,
    borderBottomRightRadius: theme.borderRadius.xxxl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.neutral.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary.pastel,
    textAlign: 'center',
    lineHeight: theme.typography.fontSizes.md * theme.typography.lineHeights.normal,
  },
  buttonContainer: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  albumsSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.neutral.text.primary,
    marginBottom: theme.spacing.lg,
  },
  albumsScroll: {
    flexGrow: 0,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as any,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.neutral.white,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  previewButton: {
    flex: 1,
    backgroundColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  previewButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as any,
  },
  closePreviewButton: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(75, 64, 99, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.neutral.white,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xxl,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.neutral.text.primary,
  },
  input: {
    backgroundColor: theme.colors.neutral.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: theme.typography.fontSizes.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.neutral.border,
    color: theme.colors.neutral.text.primary,
  },
  createButton: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  createButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold as any,
  },
  previewGrid: {
    maxHeight: 400,
  },
  previewImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  previewImageItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral.border,
  },
  previewThumbnail: {
    width: '100%',
    height: '100%',
  },
});