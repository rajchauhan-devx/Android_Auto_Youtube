import React, {createContext, useContext, useState, useCallback} from 'react';
import {Profile} from '../types';
import {Storage} from '../utils/storage';

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  loading: boolean;
  loadProfiles: () => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  selectProfile: (profile: Profile) => void;
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
      setProfiles(JSON.parse(data));
    } catch {
      setProfiles([]);
    }
    setLoading(false);
  }, []);

  const addProfile = useCallback(
    async (name: string) => {
      const newProfile: Profile = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
      };
      const updated = [...profiles, newProfile];
      setProfiles(updated);
      await Storage.setProfiles(JSON.stringify(updated));
    },
    [profiles],
  );

  const selectProfile = useCallback((profile: Profile) => {
    setActiveProfile(profile);
  }, []);

  const deleteProfile = useCallback(
    async (id: string) => {
      await Storage.clearProfile(id);
      const updated = profiles.filter(p => p.id !== id);
      setProfiles(updated);
      await Storage.setProfiles(JSON.stringify(updated));
      if (activeProfile?.id === id) {
        setActiveProfile(null);
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
