import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILES: '@profiles',
};

function profileKey(profileId: string, key: string): string {
  return `@profile_${profileId}_${key}`;
}

export const Storage = {
  async getProfiles(): Promise<string> {
    const data = await AsyncStorage.getItem(KEYS.PROFILES);
    return data ?? '[]';
  },

  async setProfiles(profiles: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROFILES, profiles);
  },

  async getProfileData(profileId: string, key: string): Promise<string> {
    const data = await AsyncStorage.getItem(profileKey(profileId, key));
    return data ?? '[]';
  },

  async setProfileData(
    profileId: string,
    key: string,
    value: string,
  ): Promise<void> {
    await AsyncStorage.setItem(profileKey(profileId, key), value);
  },

  async removeProfileData(profileId: string, key: string): Promise<void> {
    await AsyncStorage.removeItem(profileKey(profileId, key));
  },

  async clearProfile(profileId: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter(k => k.startsWith(`@profile_${profileId}_`));
    if (profileKeys.length > 0) {
      for (const key of profileKeys) {
        await AsyncStorage.removeItem(key);
      }
    }
  },
};
