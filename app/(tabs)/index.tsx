import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { CameraView } from 'expo-camera';
import {
  Camera,
  Image as ImageIcon,
  FolderPlus,
  Check,
  RotateCcw,
  X,
} from 'lucide-react-native';

import { Theme } from '@/constants/Theme';
import AnimatedButton from '@/components/AnimatedButton';
import MonsterIcon from '@/components/MonsterIcon';

import { API_URL } from '@/lib/api';
import { getUserId } from '@/lib/userId';
import AlbumCard from '@/components/AlbumCard';

const theme = Theme;
const styles = createStyles(theme);

export default function HomeScreen() {
  const cameraRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showImportPreview, setShowImportPreview] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [importing, setImporting] = useState(false);

  // -----------------------------
  // LOAD ALBUMS
  // -----------------------------
  const loadAlbums = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const res = await fetch(`${API_URL}/albums/${userId}`);
      const data = await res.json();
      setAlbums(data);
    } catch (err) {
      console.error('Error loading albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      const res = await fetch(`${API_URL}/photos/${albumId}`);
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      console.error('Error loading photos:', err);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  // -----------------------------
  // CAMERA LOGIC
  // -----------------------------
  const handleTakePhoto = () => setShowCamera(true);

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setCapturedPhoto(photo.uri);
  };

  const handleRetakePhoto = () => setCapturedPhoto(null);

  const handleConfirmPhoto = () => {
    if (!selectedAlbum) return;
    setSelectedImages([capturedPhoto]);
    setCapturedPhoto(null);
    setShowCamera(false);
    setShowImportPreview(true);
  };

  // -----------------------------
  // IMPORT LOGIC
  // -----------------------------
  const handleImportPhoto = () => {
    console.log('Import photo');
  };

  const handleConfirmImport = async () => {
    if (!selectedAlbum) return;
    setImporting(true);

    try {
      const userId = await getUserId();
      if (!userId) return;

      await fetch(`${API_URL}/photos/import/${selectedAlbum.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          images: selectedImages,
        }),
      });

      setShowImportPreview(false);
      loadPhotos(selectedAlbum.id);
    } catch (err) {
      console.error('Error importing photos:', err);
    } finally {
      setImporting(false);
    }
  };

  // -----------------------------
  // CREATE ALBUM
  // -----------------------------
  const handleOpenCreateAlbumModal = () => setShowCreateAlbumModal(true);

  const handleCreateAlbum = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      await fetch(`${API_URL}/albums/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: newAlbumName,
          description: newAlbumDescription,
        }),
      });

      setShowCreateAlbumModal(false);
      setNewAlbumName('');
      setNewAlbumDescription('');
      loadAlbums();
    } catch (err) {
      console.error('Error creating album:', err);
    }
  };

  // -----------------------------
  // CAMERA UI
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

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MonsterIcon colors={['violet', 'rose']} size={80} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MonsterIcon colors={['violet', 'sky']} size={120} />
        <Text style={styles.title}>Minigalerie</Text>
        <Text style={styles.subtitle}>Prêt à embellir tes albums ?</Text>
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

      {/* CREATE ALBUM MODAL */}
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

      {/* IMPORT PREVIEW MODAL */}
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
function createStyles(theme: any) {
  return StyleSheet.create({
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
}