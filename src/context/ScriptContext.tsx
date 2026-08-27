import React, {createContext, useContext, useState, useCallback} from 'react';
import {Script} from '../types';
import {Storage} from '../utils/storage';
import {useProfile} from './ProfileContext';

interface ScriptContextType {
  scripts: Script[];
  loading: boolean;
  loadScripts: () => Promise<void>;
  addScript: (title: string, description: string, fileName?: string, fileContent?: string) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export function ScriptProvider({children}: {children: React.ReactNode}) {
  const {activeProfile} = useProfile();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);

  const loadScripts = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const data = await Storage.getProfileData(activeProfile.id, 'scripts');
      setScripts(JSON.parse(data));
    } catch {
      setScripts([]);
    }
    setLoading(false);
  }, [activeProfile]);

  const addScript = useCallback(
    async (
      title: string,
      description: string,
      fileName?: string,
      fileContent?: string,
    ) => {
      if (!activeProfile) return;
      const newScript: Script = {
        id: Date.now().toString(),
        profileId: activeProfile.id,
        title,
        description,
        fileName,
        fileContent,
        createdAt: new Date().toISOString(),
      };
      const updated = [...scripts, newScript];
      setScripts(updated);
      await Storage.setProfileData(
        activeProfile.id,
        'scripts',
        JSON.stringify(updated),
      );
    },
    [scripts, activeProfile],
  );

  const deleteScript = useCallback(
    async (id: string) => {
      if (!activeProfile) return;
      const updated = scripts.filter(s => s.id !== id);
      setScripts(updated);
      await Storage.setProfileData(
        activeProfile.id,
        'scripts',
        JSON.stringify(updated),
      );
    },
    [scripts, activeProfile],
  );

  return (
    <ScriptContext.Provider
      value={{
        scripts,
        loading,
        loadScripts,
        addScript,
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
