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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, Image as ImageIcon, FolderPlus, X, Check, RotateCcw } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { getMonsterForAlbum, getColorForAlbum } from '@/constants/Theme';
import { useTheme } from '@/hooks/useTheme';
import AnimatedButton from '@/components/AnimatedButton';
import AlbumCard from '@/components/AlbumCard';
import MonsterIcon from '@/components/MonsterIcon';

const API_URL = 'https://minigaleriev2.onrender.com';

// -----------------------------
// 🔥 USER ID PERMANENT
// -----------------------------
async function getOrCreateUserId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem('user_id');
    if (existing) return existing;

    // ID simple, lisible, permanent
    const newId = 'user-' + Math.floor(Math.random() * 1_000_000_000);
    await AsyncStorage.setItem('user_id', newId);
    return newId;
  } catch (err) {
    console.error('Erreur stockage user_id:', err);
    return 'user-fallback';
  }
}

// -----------------------------
// 🔥 API HELPERS
// -----------------------------
async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Erreur API GET ${path}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Erreur API POST ${path}`);
  }

  return res.json();
}export default function HomeScreen() {
  const { theme } = useTheme();

  // -----------------------------
  // 🔥 STATES
  // -----------------------------
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);

  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importing, setImporting] = useState(false);

  const cameraRef = useRef<any>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // -----------------------------
  // 🔥 USER ID PERMANENT
  // -----------------------------
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const id = await getOrCreateUserId();
      setUserId(id);
    })();
  }, []);

  // -----------------------------
  // 🔥 INITIALISATION
  // -----------------------------
  useEffect(() => {
    if (userId) {
      initializeApp();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && userId) {
        loadAlbums();
      }
    }, [loading, userId])
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

  // -----------------------------
  // 🔥 DEFAULT ALBUM
  // -----------------------------
  const ensureDefaultAlbum = async () => {
    try {
      if (!userId) return;

      const userAlbums = await apiGet<any[]>(`/albums/${userId}`);
      const existing = userAlbums.find((a) => a.name === 'Galerie');

      if (!existing) {
        await apiPost('/albums', {
          name: 'Galerie',
          icon: '📸',
          color: '#FF6B6B',
          user_id: userId,
          sort_order: userAlbums.length,
        });
      }
    } catch (error) {
      console.error('Error ensuring default album:', error);
    }
  };

  // -----------------------------
  // 🔥 LOAD ALBUMS
  // -----------------------------
  const loadAlbums = async () => {
    try {
      if (!userId) return;

      const data = await apiGet<any[]>(`/albums/${userId}`);
      setAlbums(data);

      let active = selectedAlbum
        ? data.find((a) => a.id === selectedAlbum.id)
        : data[0];

      if (!active && data.length > 0) active = data[0];

      if (active) {
        setSelectedAlbum(active);
        await loadPhotos(active.id);
      } else {
        setSelectedAlbum(null);
        setPhotos([]);
      }
    } catch (error: any) {
      console.error('Error loading albums:', error);
      Alert.alert('Erreur', error?.message || 'Impossible de charger les albums');
    }
  };

  // -----------------------------
  // 🔥 LOAD PHOTOS
  // -----------------------------
  const loadPhotos = async (albumId: number) => {
    try {
      const data = await apiGet<any[]>(`/photos/${albumId}`);
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    }
  };

  // -----------------------------
  // 🔥 CAMERA
  // -----------------------------
  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      return Alert.alert('Non disponible', "La caméra n'est pas disponible sur le web");
    }

    const permission = await requestCameraPermission();
    if (!permission?.granted) {
      return Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire.");
    }

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
      id: Date.now(),
      album_id: selectedAlbum.id,
      image_uri: capturedPhoto,
      thumbnail_uri: capturedPhoto,
      created_at: new Date().toISOString(),
      sort_order: photos.length,
    };

    setPhotos([newPhoto, ...photos]);
    setCapturedPhoto(null);
    setShowCamera(false);

    try {
      await apiPost('/photos', {
        album_id: newPhoto.album_id,
        image_uri: newPhoto.image_uri,
        thumbnail_uri: newPhoto.thumbnail_uri,
        sort_order: newPhoto.sort_order,
      });

      await loadPhotos(selectedAlbum.id);
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Erreur', "Impossible d'envoyer la photo au serveur.");
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
  };

  // -----------------------------
  // 🔥 IMPORT IMAGES
  // -----------------------------
  const handleImportPhoto = async () => {
    if (!selectedAlbum) {
      return Alert.alert('Erreur', "Sélectionne d'abord un album!");
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((a) => a.uri);
      setSelectedImages(uris);
      setShowImportPreview(true);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedAlbum || selectedImages.length === 0) return;

    setImporting(true);

    try {
      const baseOrder = photos.length;

      await Promise.all(
        selectedImages.map((uri, index) =>
          apiPost('/photos', {
            album_id: selectedAlbum.id,
            image_uri: uri,
            thumbnail_uri: uri,
            sort_order: baseOrder + index,
          })
        )
      );

      setShowImportPreview(false);
      setSelectedImages([]);
      await loadPhotos(selectedAlbum.id);

      Alert.alert('Succès', `${selectedImages.length} photo(s) importée(s)!`);
    } catch (error) {
      console.error('Error importing photos:', error);
      Alert.alert('Erreur', "Impossible d'importer les photos.");
    } finally {
      setImporting(false);
    }
  };

  // -----------------------------
  // 🔥 CREATE ALBUM
  // -----------------------------
  const handleOpenCreateAlbumModal = () => {
    setNewAlbumName('');
    setNewAlbumDescription('');
    setShowCreateAlbumModal(true);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      return Alert.alert('Erreur', 'Entre un nom pour ton album!');
    }

    try {
      const monster = getMonsterForAlbum(albums.length);
      const color = getColorForAlbum(albums.length);

      const newAlbum = await apiPost('/albums', {
        name: newAlbumName.trim(),
        icon: monster,
        color,
        user_id: userId,
        sort_order: albums.length,
      });

      setAlbums([...albums, newAlbum]);
      setSelectedAlbum(newAlbum);
      setShowCreateAlbumModal(false);

      Alert.alert('Bravo!', `Album "${newAlbum.name}" créé!`);
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Erreur', "Impossible de créer l'album.");
    }
  };  
  
  // -----------------------------
  // 🔥 UI
  // -----------------------------
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
              onPress={handleConfirmPhoto}
            >
              <Check size={32} color="white" />
              <Text style={styles.previewButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closePreviewButton}
            onPress={() => {
              setCapturedPhoto(null);
              setShowCamera(false);
            }}
          >
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
      {/* HEADER */}
      <View style={styles.header}>
        <MonsterIcon colors={['violet', 'sky']} size={120} />
        <Text style={styles.title}>Minigalerie</Text>
        <Text style={styles.subtitle}>Prêt à embellir tes albums ?</Text>
      </View>

      {/* BUTTONS */}
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

      {/* ALBUMS */}
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
                  if (selectedAlbum?.id !== album.id) {
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

      {/* PHOTOS */}
      {selectedAlbum && (
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Photos de "{selectedAlbum.name}"</Text>

          {photos.length === 0 ? (
            <Text style={styles.subtitle}>Cet album est vide. Prends une photo !</Text>
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

      {/* MODAL — CREATE ALBUM */}
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

      {/* MODAL — IMPORT PREVIEW */}
      <Modal visible={showImportPreview} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedImages.length} image(s) sélectionnée(s)</Text>
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
              disabled={importing}
            >
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

// -----------------------------
// 🎨 STYLES
// -----------------------------
const createStyles = (theme: any) =>
  StyleSheet.create({
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
      lineHeight:
        theme.typography.fontSizes.md * theme.typography.lineHeights.normal,
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

    // CAMERA
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

    // PHOTO PREVIEW
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

    // MODALS
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

    // IMPORT PREVIEW GRID
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
