import React, {createContext, useContext, useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Profile} from '../types';
import {Storage} from '../utils/storage';

const ACTIVE_PROFILE_KEY = '@active_profile_id';

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  loadProfiles: () => Promise<void>;
  addProfile: (name: string) => Promise<Profile>;
  updateProfile: (id: string, name: string) => Promise<void>;
  selectProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children}: {children: React.ReactNode}) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Storage.getProfiles();
      const parsedProfiles: Profile[] = JSON.parse(data);
      setProfiles(parsedProfiles);

      // Restore active profile
      const activeId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
      if (activeId) {
        const found = parsedProfiles.find(p => p.id === activeId);
        if (found) {
          setActiveProfile(found);
        } else if (parsedProfiles.length > 0) {
          setActiveProfile(parsedProfiles[0]);
        }
      } else if (parsedProfiles.length > 0) {
        setActiveProfile(parsedProfiles[0]);
      }
    } catch {
      setProfiles([]);
    }
    setLoading(false);
  }, []);

  const addProfile = useCallback(
    async (name: string): Promise<Profile> => {
      const newProfile: Profile = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
      };
      const updated = [...profiles, newProfile];
      setProfiles(updated);
      await Storage.setProfiles(JSON.stringify(updated));
      return newProfile;
    },
    [profiles],
  );

  const updateProfile = useCallback(
    async (id: string, name: string) => {
      const updated = profiles.map(p => (p.id === id ? {...p, name} : p));
      setProfiles(updated);
      await Storage.setProfiles(JSON.stringify(updated));
      if (activeProfile?.id === id) {
        setActiveProfile(prev => (prev ? {...prev, name} : null));
      }
    },
    [profiles, activeProfile],
  );

  const selectProfile = useCallback(async (profile: Profile) => {
    setActiveProfile(profile);
    try {
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    } catch {
      // Ignore
    }
  }, []);

  const deleteProfile = useCallback(
    async (id: string) => {
      await Storage.clearProfile(id);
      const updated = profiles.filter(p => p.id !== id);
      setProfiles(updated);
      await Storage.setProfiles(JSON.stringify(updated));
      if (activeProfile?.id === id) {
        const nextProfile = updated.length > 0 ? updated[0] : null;
        setActiveProfile(nextProfile);
        if (nextProfile) {
          await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, nextProfile.id);
        } else {
          await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
      }
    },
    [profiles, activeProfile],
  );

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        loadProfiles,
        addProfile,
        updateProfile,
        selectProfile,
        deleteProfile,
      }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
