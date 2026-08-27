import {Platform, PermissionsAndroid} from 'react-native';
import RNFS from 'react-native-fs';
import {Script, ImageAsset, AudioAsset} from '../types';

export class FileManager {
  /**
   * Explicitly request Android storage permissions
   */
  static async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        // Android 13+ handles scoped media permissions
        return true;
      }

      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const isWriteGranted =
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return isWriteGranted;
    } catch (err) {
      console.warn('Storage permission request error:', err);
      return false;
    }
  }

  /**
   * Clean folder/file name for safe filesystem usage while keeping typed title readable
   */
  static sanitizeName(name: string): string {
    if (!name) return 'untitled';
    return name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, '_');
  }

  /**
   * Get root automation directory path.
   * Uses DownloadDirectoryPath so files appear directly in phone's File Manager (Downloads/automation)
   */
  static getRootAutomationPath(): string {
    if (Platform.OS === 'android') {
      const base =
        RNFS.DownloadDirectoryPath ||
        RNFS.ExternalDirectoryPath ||
        RNFS.DocumentDirectoryPath;
      return `${base}/automation`;
    }
    return `${RNFS.DocumentDirectoryPath}/automation`;
  }

  /**
   * Ensure a directory path exists
   */
  static async ensureDir(dirPath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        await RNFS.mkdir(dirPath);
      }
    } catch (err) {
      console.warn(`Failed to create dir: ${dirPath}`, err);
    }
  }

  /**
   * Get and initialize profile root folder: /automation/<profile_name>/
   */
  static async getProfileFolder(profileName: string): Promise<string> {
    const root = this.getRootAutomationPath();
    await this.ensureDir(root);

    const safeName = this.sanitizeName(profileName);
    const profileDir = `${root}/${safeName}`;
    await this.ensureDir(profileDir);

    // Create profile subfolders cleanly
    await this.ensureDir(`${profileDir}/scripts`);
    await this.ensureDir(`${profileDir}/assets`);
    await this.ensureDir(`${profileDir}/assets/images`);
    await this.ensureDir(`${profileDir}/assets/audio`);
    await this.ensureDir(`${profileDir}/exports`);

    return profileDir;
  }

  /**
   * Get scripts folder for a profile: /automation/<profile_name>/scripts/
   */
  static async getScriptsFolder(profileName: string): Promise<string> {
    const profileDir = await this.getProfileFolder(profileName);
    const scriptsDir = `${profileDir}/scripts`;
    await this.ensureDir(scriptsDir);
    return scriptsDir;
  }

  /**
   * Get assets folder for a profile: /automation/<profile_name>/assets/
   */
  static async getAssetsFolder(profileName: string): Promise<string> {
    const profileDir = await this.getProfileFolder(profileName);
    const assetsDir = `${profileDir}/assets`;
    await this.ensureDir(assetsDir);
    return assetsDir;
  }

  /**
   * Save script to phone storage using the exact title typed by the user:
   * e.g. <title>.txt and <title>.json
   */
  static async saveScript(
    profileName: string,
    script: Script,
  ): Promise<{jsonPath: string; contentPath?: string}> {
    await this.requestStoragePermission();

    const scriptsDir = await this.getScriptsFolder(profileName);
    const safeTitle = this.sanitizeName(script.title || 'untitled');

    // 1. Save readable script text / markdown with title as file name
    const content = script.fileContent || script.description;
    let contentPath: string | undefined;
    if (content) {
      const ext = script.fileName?.endsWith('.md') ? 'md' : 'txt';
      contentPath = `${scriptsDir}/${safeTitle}.${ext}`;
      await RNFS.writeFile(contentPath, content, 'utf8');
    }

    // 2. Save JSON metadata with title as file name
    const jsonPath = `${scriptsDir}/${safeTitle}.json`;
    await RNFS.writeFile(jsonPath, JSON.stringify(script, null, 2), 'utf8');

    return {jsonPath, contentPath};
  }

  /**
   * Update script in phone storage: removes old file if title renamed, then saves updated script
   */
  static async updateScript(
    profileName: string,
    oldScript: Script,
    updatedScript: Script,
  ): Promise<void> {
    await this.requestStoragePermission();
    if (oldScript.title !== updatedScript.title) {
      await this.deleteScript(profileName, oldScript.id);
    }
    await this.saveScript(profileName, updatedScript);
  }

  /**
   * Load all scripts from phone storage for a profile (both .json and raw .txt/.md files)
   */
  static async loadScripts(profileName: string): Promise<Script[]> {
    try {
      const scriptsDir = await this.getScriptsFolder(profileName);
      const exists = await RNFS.exists(scriptsDir);
      if (!exists) {
        return [];
      }

      const files = await RNFS.readDir(scriptsDir);
      const jsonFiles = files.filter(
        f => f.isFile() && f.name.endsWith('.json'),
      );
      const textFiles = files.filter(
        f =>
          f.isFile() &&
          (f.name.endsWith('.txt') || f.name.endsWith('.md')) &&
          !f.name.endsWith('.json'),
      );

      const scripts: Script[] = [];
      const loadedTitles = new Set<string>();

      // 1. Load JSON-backed scripts
      for (const file of jsonFiles) {
        try {
          const content = await RNFS.readFile(file.path, 'utf8');
          const script: Script = JSON.parse(content);
          if (script && script.id && script.title) {
            // Also check if text file exists on disk with newer content
            const baseName = file.name.replace(/\.json$/, '');
            const txtPath = `${scriptsDir}/${baseName}.txt`;
            const mdPath = `${scriptsDir}/${baseName}.md`;

            if (await RNFS.exists(txtPath)) {
              const diskText = await RNFS.readFile(txtPath, 'utf8');
              if (diskText) script.fileContent = diskText;
            } else if (await RNFS.exists(mdPath)) {
              const diskText = await RNFS.readFile(mdPath, 'utf8');
              if (diskText) script.fileContent = diskText;
            }

            scripts.push(script);
            loadedTitles.add(this.sanitizeName(script.title));
          }
        } catch {
          // Skip corrupt file
        }
      }

      // 2. Discover any loose .txt / .md files that don't have a .json file yet
      for (const tFile of textFiles) {
        const baseName = tFile.name.replace(/\.(txt|md)$/, '');
        if (!loadedTitles.has(baseName)) {
          try {
            const rawContent = await RNFS.readFile(tFile.path, 'utf8');
            const displayTitle = baseName.replace(/_/g, ' ');
            const recoveredScript: Script = {
              id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              profileId: '1',
              title: displayTitle,
              description: rawContent.slice(0, 100),
              fileName: tFile.name,
              fileContent: rawContent,
              createdAt: new Date().toISOString(),
            };
            scripts.push(recoveredScript);
            loadedTitles.add(baseName);
            // Save .json counterpart
            await RNFS.writeFile(
              `${scriptsDir}/${baseName}.json`,
              JSON.stringify(recoveredScript, null, 2),
              'utf8',
            );
          } catch {
            // Ignore
          }
        }
      }

      // Sort by createdAt descending
      scripts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return scripts;
    } catch {
      return [];
    }
  }

  /**
   * Delete script files from phone storage
   */
  static async deleteScript(
    profileName: string,
    scriptId: string,
  ): Promise<void> {
    try {
      const scriptsDir = await this.getScriptsFolder(profileName);
      const exists = await RNFS.exists(scriptsDir);
      if (!exists) return;

      const files = await RNFS.readDir(scriptsDir);
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.json')) {
          try {
            const content = await RNFS.readFile(file.path, 'utf8');
            const script: Script = JSON.parse(content);
            if (script && script.id === scriptId) {
              // Delete JSON file
              await RNFS.unlink(file.path);

              // Delete corresponding .txt or .md file
              const baseName = file.name.replace(/\.json$/, '');
              const txtPath = `${scriptsDir}/${baseName}.txt`;
              const mdPath = `${scriptsDir}/${baseName}.md`;

              if (await RNFS.exists(txtPath)) {
                await RNFS.unlink(txtPath);
              }
              if (await RNFS.exists(mdPath)) {
                await RNFS.unlink(mdPath);
              }
            }
          } catch {
            // Ignore
          }
        }
      }
    } catch (err) {
      console.warn('Failed to delete script file:', err);
    }
  }

  /**
   * Save extracted image and audio prompt assets to /automation/<profile_name>/assets/
   */
  static async saveExtractedAssets(
    profileName: string,
    imageAssets: ImageAsset[],
    audioAssets: AudioAsset[],
  ): Promise<void> {
    await this.requestStoragePermission();
    const assetsDir = await this.getAssetsFolder(profileName);

    // 1. Save Image assets JSON and clean text list
    const imgJsonPath = `${assetsDir}/image_prompts.json`;
    await RNFS.writeFile(imgJsonPath, JSON.stringify(imageAssets, null, 2), 'utf8');

    const imgTxt = imageAssets
      .map((a, i) => `[Image ${i + 1}]\n${a.prompt}`)
      .join('\n\n---\n\n');
    await RNFS.writeFile(`${assetsDir}/image_prompts.txt`, imgTxt, 'utf8');

    // 2. Save Audio assets JSON and clean text list
    const audJsonPath = `${assetsDir}/audio_prompts.json`;
    await RNFS.writeFile(audJsonPath, JSON.stringify(audioAssets, null, 2), 'utf8');

    const audTxt = audioAssets
      .map(
        (a, i) =>
          `[Audio ${i + 1} - ${a.characterName || 'Voice'}]\n${
            a.prompt || a.text || ''
          }`,
      )
      .join('\n\n---\n\n');
    await RNFS.writeFile(`${assetsDir}/audio_prompts.txt`, audTxt, 'utf8');
  }

  /**
   * Load extracted assets from /automation/<profile_name>/assets/
   */
  static async loadExtractedAssets(
    profileName: string,
  ): Promise<{imageAssets: ImageAsset[]; audioAssets: AudioAsset[]}> {
    try {
      const assetsDir = await this.getAssetsFolder(profileName);

      let imageAssets: ImageAsset[] = [];
      let audioAssets: AudioAsset[] = [];

      const imgJsonPath = `${assetsDir}/image_prompts.json`;
      if (await RNFS.exists(imgJsonPath)) {
        const content = await RNFS.readFile(imgJsonPath, 'utf8');
        imageAssets = JSON.parse(content);
      }

      const audJsonPath = `${assetsDir}/audio_prompts.json`;
      if (await RNFS.exists(audJsonPath)) {
        const content = await RNFS.readFile(audJsonPath, 'utf8');
        audioAssets = JSON.parse(content);
      }

      return {imageAssets, audioAssets};
    } catch {
      return {imageAssets: [], audioAssets: []};
    }
  }

  /**
   * Delete complete profile directory from phone storage
   */
  static async deleteProfileFolder(profileName: string): Promise<void> {
    try {
      const root = this.getRootAutomationPath();
      const safeName = this.sanitizeName(profileName);
      const profileDir = `${root}/${safeName}`;
      const exists = await RNFS.exists(profileDir);
      if (exists) {
        await RNFS.unlink(profileDir);
      }
    } catch {
      // Ignore
    }
  }
}
