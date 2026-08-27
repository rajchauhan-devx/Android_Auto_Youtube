import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ImageAsset, AudioAsset} from '../types';
import {FileManager} from '../utils/fileManager';
import {useProfile} from './ProfileContext';

interface AssetContextType {
  imageAssets: ImageAsset[];
  audioAssets: AudioAsset[];
  loading: boolean;
  loadAssets: () => Promise<void>;
  saveExtractedAssetsFromTags: (
    imagePrompts: string[],
    audioPrompts: string[],
    replace?: boolean,
  ) => Promise<{imageCount: number; audioCount: number}>;
  deleteImageAsset: (id: string) => Promise<void>;
  deleteAudioAsset: (id: string) => Promise<void>;
  clearAllAssets: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({children}: {children: React.ReactNode}) {
  const {activeProfile} = useProfile();
  const [imageAssets, setImageAssets] = useState<ImageAsset[]>([]);
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssets = useCallback(async () => {
    if (!activeProfile) {
      setImageAssets([]);
      setAudioAssets([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Load from phone storage
      const {imageAssets: fileImages, audioAssets: fileAudios} =
        await FileManager.loadExtractedAssets(activeProfile.name);

      if (fileImages.length > 0 || fileAudios.length > 0) {
        setImageAssets(fileImages);
        setAudioAssets(fileAudios);
        await AsyncStorage.setItem(
          `@profile_${activeProfile.id}_images`,
          JSON.stringify(fileImages),
        );
        await AsyncStorage.setItem(
          `@profile_${activeProfile.id}_audios`,
          JSON.stringify(fileAudios),
        );
      } else {
        // Fallback to AsyncStorage cache
        const cachedImgs = await AsyncStorage.getItem(
          `@profile_${activeProfile.id}_images`,
        );
        const cachedAuds = await AsyncStorage.getItem(
          `@profile_${activeProfile.id}_audios`,
        );
        setImageAssets(cachedImgs ? JSON.parse(cachedImgs) : []);
        setAudioAssets(cachedAuds ? JSON.parse(cachedAuds) : []);
      }
    } catch (err) {
      console.warn('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const saveExtractedAssetsFromTags = useCallback(
    async (
      imagePrompts: string[],
      audioPrompts: string[],
      replace: boolean = true,
    ): Promise<{imageCount: number; audioCount: number}> => {
      const profileName = activeProfile?.name || 'My Profile';
      const profileId = activeProfile?.id || '1';

      // Build new image assets
      const newImages: ImageAsset[] = imagePrompts.map((prompt, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        profileId,
        prompt: prompt.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      // Build new audio assets
      const newAudios: AudioAsset[] = audioPrompts.map((prompt, idx) => ({
        id: `aud_${Date.now()}_${idx}`,
        profileId,
        prompt: prompt.trim(),
        text: prompt.trim(),
        characterName: `Voice ${idx + 1}`,
        language: 'hindi',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      // If replace is true, fresh extraction replaces previous assets completely
      const finalImages = replace
        ? newImages
        : [...newImages, ...imageAssets.filter(img => !imagePrompts.includes(img.prompt))];

      const finalAudios = replace
        ? newAudios
        : [...newAudios, ...audioAssets.filter(aud => !audioPrompts.includes(aud.prompt || ''))];

      setImageAssets(finalImages);
      setAudioAssets(finalAudios);

      // Save to phone storage: /automation/<profile_name>/assets/
      try {
        await FileManager.saveExtractedAssets(
          profileName,
          finalImages,
          finalAudios,
        );
      } catch (err) {
        console.warn('Failed to save assets to phone storage:', err);
      }

      // Save to AsyncStorage cache
      try {
        await AsyncStorage.setItem(
          `@profile_${profileId}_images`,
          JSON.stringify(finalImages),
        );
        await AsyncStorage.setItem(
          `@profile_${profileId}_audios`,
          JSON.stringify(finalAudios),
        );
      } catch (err) {
        console.warn('Failed to cache assets:', err);
      }

      return {
        imageCount: newImages.length,
        audioCount: newAudios.length,
      };
    },
    [activeProfile, imageAssets, audioAssets],
  );

  const deleteImageAsset = useCallback(
    async (id: string) => {
      const nextImages = imageAssets.filter(a => a.id !== id);
      setImageAssets(nextImages);
      if (activeProfile) {
        await FileManager.saveExtractedAssets(
          activeProfile.name,
          nextImages,
          audioAssets,
        );
        await AsyncStorage.setItem(
          `@profile_${activeProfile.id}_images`,
          JSON.stringify(nextImages),
        );
      }
    },
    [imageAssets, audioAssets, activeProfile],
  );

  const deleteAudioAsset = useCallback(
    async (id: string) => {
      const nextAudios = audioAssets.filter(a => a.id !== id);
      setAudioAssets(nextAudios);
      if (activeProfile) {
        await FileManager.saveExtractedAssets(
          activeProfile.name,
          imageAssets,
          nextAudios,
        );
        await AsyncStorage.setItem(
          `@profile_${activeProfile.id}_audios`,
          JSON.stringify(nextAudios),
        );
      }
    },
    [imageAssets, audioAssets, activeProfile],
  );

  const clearAllAssets = useCallback(async () => {
    setImageAssets([]);
    setAudioAssets([]);
    if (activeProfile) {
      await FileManager.saveExtractedAssets(activeProfile.name, [], []);
      await AsyncStorage.removeItem(`@profile_${activeProfile.id}_images`);
      await AsyncStorage.removeItem(`@profile_${activeProfile.id}_audios`);
    }
  }, [activeProfile]);

  return (
    <AssetContext.Provider
      value={{
        imageAssets,
        audioAssets,
        loading,
        loadAssets,
        saveExtractedAssetsFromTags,
        deleteImageAsset,
        deleteAudioAsset,
        clearAllAssets,
      }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets(): AssetContextType {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}
