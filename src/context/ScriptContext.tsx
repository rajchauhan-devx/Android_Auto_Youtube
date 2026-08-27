import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {Script} from '../types';
import {Storage} from '../utils/storage';
import {FileManager} from '../utils/fileManager';
import {useProfile} from './ProfileContext';

interface ScriptContextType {
  scripts: Script[];
  loading: boolean;
  scriptsFolderPath: string;
  loadScripts: () => Promise<void>;
  addScript: (
    title: string,
    description: string,
    fileName?: string,
    fileContent?: string,
  ) => Promise<Script>;
  updateScript: (
    id: string,
    title: string,
    description: string,
    fileContent?: string,
  ) => Promise<Script | null>;
  deleteScript: (id: string) => Promise<void>;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export function ScriptProvider({children}: {children: React.ReactNode}) {
  const {activeProfile} = useProfile();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptsFolderPath, setScriptsFolderPath] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadScripts = useCallback(async () => {
    if (!activeProfile) {
      setScripts([]);
      setScriptsFolderPath('');
      return;
    }

    setLoading(true);
    try {
      // 1. Request Android storage permissions
      await FileManager.requestStoragePermission();

      // 2. Get folder path
      const folder = await FileManager.getScriptsFolder(activeProfile.name);
      setScriptsFolderPath(folder);

      // 3. Load from phone storage files
      const fileScripts = await FileManager.loadScripts(activeProfile.name);

      if (fileScripts.length > 0) {
        setScripts(fileScripts);
        await Storage.setProfileData(
          activeProfile.id,
          'scripts',
          JSON.stringify(fileScripts),
        );
      } else {
        // Fallback to AsyncStorage cache
        const cached = await Storage.getProfileData(activeProfile.id, 'scripts');
        let parsed: Script[] = [];
        try {
          parsed = JSON.parse(cached);
        } catch {
          parsed = [];
        }
        setScripts(parsed);

        // Sync any cached scripts into phone storage files
        for (const s of parsed) {
          try {
            await FileManager.saveScript(activeProfile.name, s);
          } catch {
            // Ignore
          }
        }
      }
    } catch (err) {
      console.warn('Error loading scripts:', err);
      try {
        const cached = await Storage.getProfileData(activeProfile.id, 'scripts');
        setScripts(JSON.parse(cached));
      } catch {
        setScripts([]);
      }
    }
    setLoading(false);
  }, [activeProfile]);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const addScript = useCallback(
    async (
      title: string,
      description: string,
      fileName?: string,
      fileContent?: string,
    ): Promise<Script> => {
      const profileName = activeProfile?.name || 'My Profile';
      const profileId = activeProfile?.id || '1';

      const newScript: Script = {
        id: Date.now().toString(),
        profileId,
        title,
        description,
        fileName,
        fileContent,
        createdAt: new Date().toISOString(),
      };

      // 1. Save to phone storage: /automation/<profile_name>/scripts/
      try {
        await FileManager.saveScript(profileName, newScript);
      } catch (err) {
        console.warn('Failed to write script to phone storage:', err);
      }

      // 2. Immediately update state so it appears on screen without delay
      setScripts(prev => [
        newScript,
        ...prev.filter(s => s.id !== newScript.id),
      ]);

      // 3. Update AsyncStorage cache
      try {
        const cached = await Storage.getProfileData(profileId, 'scripts');
        let currentList: Script[] = [];
        try {
          currentList = JSON.parse(cached);
        } catch {
          currentList = [];
        }
        const updated = [
          newScript,
          ...currentList.filter(s => s.id !== newScript.id),
        ];
        await Storage.setProfileData(
          profileId,
          'scripts',
          JSON.stringify(updated),
        );
      } catch {
        // Ignore cache save error
      }

      return newScript;
    },
    [activeProfile],
  );

  const updateScript = useCallback(
    async (
      id: string,
      title: string,
      description: string,
      fileContent?: string,
    ): Promise<Script | null> => {
      const existing = scripts.find(s => s.id === id);
      if (!existing) return null;

      const profileName = activeProfile?.name || 'My Profile';
      const profileId = activeProfile?.id || '1';

      const updated: Script = {
        ...existing,
        title: title.trim() || existing.title,
        description: description.trim(),
        fileContent:
          fileContent !== undefined ? fileContent : existing.fileContent,
      };

      // 1. Update on phone storage files
      try {
        await FileManager.updateScript(profileName, existing, updated);
      } catch (err) {
        console.warn('Failed to update script file on disk:', err);
      }

      // 2. Update state
      setScripts(prev => prev.map(s => (s.id === id ? updated : s)));

      // 3. Update cache
      try {
        const cached = await Storage.getProfileData(profileId, 'scripts');
        let currentList: Script[] = [];
        try {
          currentList = JSON.parse(cached);
        } catch {
          currentList = [];
        }
        const nextList = currentList.map(s => (s.id === id ? updated : s));
        await Storage.setProfileData(
          profileId,
          'scripts',
          JSON.stringify(nextList),
        );
      } catch {
        // Ignore
      }

      return updated;
    },
    [scripts, activeProfile],
  );

  const deleteScript = useCallback(
    async (id: string) => {
      const profileName = activeProfile?.name || 'My Profile';
      const profileId = activeProfile?.id || '1';

      // 1. Delete physical files from phone storage
      try {
        await FileManager.deleteScript(profileName, id);
      } catch (err) {
        console.warn('Failed to delete script file:', err);
      }

      // 2. Immediately update state
      setScripts(prev => prev.filter(s => s.id !== id));

      // 3. Update cache
      try {
        const cached = await Storage.getProfileData(profileId, 'scripts');
        let currentList: Script[] = [];
        try {
          currentList = JSON.parse(cached);
        } catch {
          currentList = [];
        }
        const updated = currentList.filter(s => s.id !== id);
        await Storage.setProfileData(
          profileId,
          'scripts',
          JSON.stringify(updated),
        );
      } catch {
        // Ignore
      }
    },
    [activeProfile],
  );

  return (
    <ScriptContext.Provider
      value={{
        scripts,
        loading,
        scriptsFolderPath,
        loadScripts,
        addScript,
        updateScript,
        deleteScript,
      }}>
      {children}
    </ScriptContext.Provider>
  );
}

export function useScripts(): ScriptContextType {
  const context = useContext(ScriptContext);
  if (!context) {
    throw new Error('useScripts must be used within a ScriptProvider');
  }
  return context;
}
