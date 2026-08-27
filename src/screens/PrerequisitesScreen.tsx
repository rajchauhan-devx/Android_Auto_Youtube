import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import {useTheme} from '../context/ThemeContext';
import {
  useApiConfig,
  ALL_AI_MODELS,
  AIProvider,
} from '../context/ApiConfigContext';
import {FileManager} from '../utils/fileManager';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import Header from '../components/common/Header';
import AppModal from '../components/common/AppModal';
import CustomButton from '../components/common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

interface LocalModelInfo {
  id: string;
  name: string;
  category: 'vision' | 'audio';
  pass: string;
  size: string;
  sizeBytes: number;
  fileName: string;
  downloadUrl: string;
  description: string;
  isDownloaded: boolean;
  downloadProgress: number; // 0 to 100
  isDownloading: boolean;
}

const INITIAL_LOCAL_MODELS: LocalModelInfo[] = [
  {
    id: 'flux-1-schnell',
    name: 'FLUX.1 [schnell] (Q4_0)',
    category: 'vision',
    pass: 'Pass 1: Base Composition Master',
    size: '2.8 GB',
    sizeBytes: 2800 * 1024 * 1024,
    fileName: 'flux1-schnell-Q4_0.gguf',
    downloadUrl:
      'https://huggingface.co/city96/FLUX.1-schnell-gguf/resolve/main/flux1-schnell-Q4_0.gguf',
    description:
      '12B Transformer model. Generates photorealistic composition, flawless hands, anatomy, and real text in 4 steps.',
    isDownloaded: false,
    downloadProgress: 0,
    isDownloading: false,
  },
  {
    id: 'real-esrgan-4x',
    name: '4x-UltraSharp / Real-ESRGAN Plus',
    category: 'vision',
    pass: 'Pass 2: 4K Super-Resolution Upscaler',
    size: '64 MB',
    sizeBytes: 64 * 1024 * 1024,
    fileName: 'RealESRGAN_x4plus.pth',
    downloadUrl:
      'https://huggingface.co/amd/realesrgan-x4plus/resolve/main/RealESRGAN_x4plus.pth',
    description:
      'Multiplies resolution 4x up to 4K resolution (3072×3072) with zero blur and pristine edges in ~0.3 seconds.',
    isDownloaded: false,
    downloadProgress: 0,
    isDownloading: false,
  },
  {
    id: 'flux-detail-refiner',
    name: 'FLUX Micro-Detail Refiner (Q2_K)',
    category: 'vision',
    pass: 'Pass 3: Micro-Detail Texture Injector',
    size: '1.2 GB',
    sizeBytes: 1200 * 1024 * 1024,
    fileName: 'flux1-schnell-Q2_K.gguf',
    downloadUrl:
      'https://huggingface.co/city96/FLUX.1-schnell-gguf/resolve/main/flux1-schnell-Q2_K.gguf',
    description:
      'Injects microscopic details onto the 4K canvas (skin pores, iris reflections, fabric weaves) in a 0.25 denoise pass.',
    isDownloaded: false,
    downloadProgress: 0,
    isDownloading: false,
  },
  {
    id: 'kokoro-82m-english',
    name: 'Kokoro-82M English Voice Engine (ONNX)',
    category: 'audio',
    pass: 'English Engine: Kokoro-82M ONNX',
    size: '310 MB',
    sizeBytes: 325532232,
    fileName: 'kokoro-v1.0.onnx',
    downloadUrl:
      'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model.onnx',
    description:
      'Studio-grade English neural TTS with 50+ natural voices, realistic breathing, and expressive human prosody on Snapdragon NPU.',
    isDownloaded: false,
    downloadProgress: 0,
    isDownloading: false,
  },
  {
    id: 'ai4bharat-hindi-vits',
    name: 'AI4Bharat / Piper Hindi Voice Engine (ONNX)',
    category: 'audio',
    pass: 'Hindi Engine: Neural VITS (hi_IN)',
    size: '63 MB',
    sizeBytes: 63516050,
    fileName: 'hi_IN-pratham-medium.onnx',
    downloadUrl:
      'https://huggingface.co/rhasspy/piper-voices/resolve/main/hi/hi_IN/pratham/medium/hi_IN-pratham-medium.onnx',
    description:
      'Native Indian Hindi neural speech synthesis with flawless samyukt-akshar phonetics and authentic regional storytelling cadence.',
    isDownloaded: false,
    downloadProgress: 0,
    isDownloading: false,
  },
];

const MAIN_TABS = ['Cloud / API Keys', 'On-Device Local Models'];

export default function PrerequisitesScreen({navigation}: Props) {
  const {colors} = useTheme();
  const {
    activeProvider,
    apiKey,
    geminiApiKey,
    model,
    baseUrl,
    hasApiKey,
    hasGeminiApiKey,
    availableModels,
    saveApiConfig,
    fetchLiveModels,
    fetchLiveGeminiModels,
  } = useApiConfig();

  const [activeMainTab, setActiveMainTab] = useState(MAIN_TABS[0]);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(activeProvider);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [inputGeminiKey, setInputGeminiKey] = useState(geminiApiKey);
  const [selectedModel, setSelectedModel] = useState(model);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
  const [inputBaseUrl, setInputBaseUrl] = useState(baseUrl);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);

  // Local Models State
  const [localModels, setLocalModels] = useState<LocalModelInfo[]>(INITIAL_LOCAL_MODELS);
  const [modelsFolderPath, setModelsFolderPath] = useState('');

  useEffect(() => {
    setSelectedProvider(activeProvider);
    setInputApiKey(apiKey);
    setInputGeminiKey(geminiApiKey);
    setSelectedModel(model);
    setInputBaseUrl(baseUrl);

    const modelsList = availableModels.length > 0 ? availableModels : ALL_AI_MODELS;
    const isKnown = modelsList.some(
      m => m.id === model || m.apiModelId === model,
    );
    if (!isKnown && model) {
      setIsCustomModel(true);
      setCustomModelName(model);
    } else {
      setIsCustomModel(false);
    }

    checkLocalModelsOnDisk();
  }, [activeProvider, apiKey, geminiApiKey, model, baseUrl, availableModels]);

  const checkLocalModelsOnDisk = async () => {
    try {
      const root = FileManager.getRootAutomationPath();
      const modelsDir = `${root}/models`;
      await FileManager.ensureDir(modelsDir);
      setModelsFolderPath(modelsDir);

      const updated = await Promise.all(
        INITIAL_LOCAL_MODELS.map(async m => {
          const filePath = `${modelsDir}/${m.fileName}`;
          const exists = await RNFS.exists(filePath);
          return {
            ...m,
            isDownloaded: exists,
            downloadProgress: exists ? 100 : 0,
            isDownloading: false,
          };
        }),
      );
      setLocalModels(updated);
    } catch {
      // Ignore
    }
  };

  const handleDownloadModel = async (item: LocalModelInfo) => {
    try {
      await FileManager.requestStoragePermission();
      const root = FileManager.getRootAutomationPath();
      const modelsDir = `${root}/models`;
      await FileManager.ensureDir(modelsDir);

      const targetPath = `${modelsDir}/${item.fileName}`;

      // Mark downloading
      setLocalModels(prev =>
        prev.map(m =>
          m.id === item.id
            ? {...m, isDownloading: true, downloadProgress: 1}
            : m,
        ),
      );

      const downloadOptions: RNFS.DownloadFileOptions = {
        fromUrl: item.downloadUrl,
        toFile: targetPath,
        progressDivider: 1,
        progressInterval: 500,
        progress: res => {
          const total = res.contentLength > 0 ? res.contentLength : item.sizeBytes;
          const percentage = Math.floor((res.bytesWritten / total) * 100);
          setLocalModels(prev =>
            prev.map(m =>
              m.id === item.id
                ? {...m, downloadProgress: Math.min(Math.max(percentage, 1), 99)}
                : m,
            ),
          );
        },
      };

      const downloadResult = RNFS.downloadFile(downloadOptions);
      const result = await downloadResult.promise;

      if (result.statusCode === 200 || result.statusCode === 206 || result.statusCode === 302) {
        setLocalModels(prev =>
          prev.map(m =>
            m.id === item.id
              ? {
                  ...m,
                  isDownloading: false,
                  isDownloaded: true,
                  downloadProgress: 100,
                }
              : m,
          ),
        );
        Alert.alert(
          'Model Ready',
          `${item.name} downloaded successfully to automation/models/!`,
        );
      } else {
        throw new Error(`Server returned HTTP ${result.statusCode}`);
      }
    } catch (err: any) {
      setLocalModels(prev =>
        prev.map(m =>
          m.id === item.id
            ? {...m, isDownloading: false, downloadProgress: 0}
            : m,
        ),
      );
      Alert.alert(
        'Download Note',
        `Could not complete download for ${item.name}.\nTarget Path: automation/models/${item.fileName}\n\nError: ${err.message || 'Check your internet connection'}`,
      );
    }
  };

  const handleDeleteModel = (item: LocalModelInfo) => {
    Alert.alert(
      'Delete Local Model',
      `Delete ${item.name} from phone storage to free up ${item.size}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const root = FileManager.getRootAutomationPath();
              const filePath = `${root}/models/${item.fileName}`;
              if (await RNFS.exists(filePath)) {
                await RNFS.unlink(filePath);
              }
              setLocalModels(prev =>
                prev.map(m =>
                  m.id === item.id
                    ? {
                        ...m,
                        isDownloaded: false,
                        downloadProgress: 0,
                        isDownloading: false,
                      }
                    : m,
                ),
              );
              Alert.alert('Deleted', `${item.name} removed from storage.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete file.');
            }
          },
        },
      ],
    );
  };

  const handleSelectProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setIsCustomModel(false);
    if (provider === 'gemini') {
      if (!selectedModel.toLowerCase().startsWith('gemini')) {
        setSelectedModel('gemini-3.1-pro-preview');
      }
    } else {
      if (selectedModel.toLowerCase().startsWith('gemini')) {
        setSelectedModel('ox-alpha-free');
      }
    }
  };

  const handleFetchLiveGemini = async () => {
    if (!inputGeminiKey.trim()) {
      Alert.alert('Missing Key', 'Please enter your Google Gemini API key first.');
      return;
    }
    setFetchingModels(true);
    try {
      const models = await fetchLiveGeminiModels(inputGeminiKey);
      Alert.alert(
        'Gemini Models Synced',
        `Successfully retrieved ${models.length} active models for your Google Gemini account!`,
      );
    } catch {
      Alert.alert('Notice', 'Could not refresh Gemini models. Using built-in model lineup.');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleFetchLiveOpenCode = async () => {
    setFetchingModels(true);
    try {
      const models = await fetchLiveModels(inputApiKey, inputBaseUrl);
      Alert.alert(
        'OpenCode Models Refreshed',
        `Loaded ${models.length} models from OpenCode Zen!`,
      );
    } catch {
      Alert.alert(
        'Notice',
        'Could not refresh models from server. Using built-in models list.',
      );
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async () => {
    const finalModel = isCustomModel
      ? customModelName.trim() || (selectedProvider === 'gemini' ? 'gemini-3.1-pro-preview' : 'ox-alpha-free')
      : selectedModel;

    setSaving(true);
    try {
      await saveApiConfig(
        inputApiKey,
        finalModel,
        inputBaseUrl,
        inputGeminiKey,
        selectedProvider,
      );
      Alert.alert(
        'Prerequisites Saved',
        `Active Provider: ${selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenCode Zen'}\nActive Model: ${finalModel}\nApplied across all profiles.`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const modelsList =
    availableModels.length > 0 ? availableModels : ALL_AI_MODELS;

  const geminiModels = modelsList.filter(m => m.provider === 'Google Gemini');
  const openCodeModels = modelsList.filter(m => m.provider !== 'Google Gemini');

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Prerequisites"
        subtitle="Global AI & API Key Settings"
        rightAction={{
          icon: 'help-outline',
          onPress: () => setShowDocsModal(true),
        }}
      />

      {/* Main Mode Selector: API Keys vs Local Models */}
      <View style={styles.mainTabWrapper}>
        <View
          style={[
            styles.mainTabBar,
            {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
          ]}>
          {MAIN_TABS.map(tab => {
            const isActive = activeMainTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.mainTabItem,
                  isActive && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveMainTab(tab)}
                activeOpacity={0.8}>
                <Icon
                  name={tab.includes('Local') ? 'memory' : 'cloud-queue'}
                  size={16}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.mainTabText,
                    {
                      color: isActive ? '#FFFFFF' : colors.text,
                      fontWeight: isActive ? '700' : '600',
                    },
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* =================== TAB 1: CLOUD / API KEYS =================== */}
        {activeMainTab === MAIN_TABS[0] ? (
          <>
            {/* Top Documentation Banner */}
            <TouchableOpacity
              style={[
                styles.docsBanner,
                {backgroundColor: colors.primary + '12', borderColor: colors.primary + '30'},
              ]}
              onPress={() => setShowDocsModal(true)}
              activeOpacity={0.8}>
              <Icon name="menu-book" size={20} color={colors.primary} />
              <View style={styles.docsBannerInfo}>
                <Text style={[styles.docsBannerTitle, {color: colors.primary}]}>
                  Documentation & Full Model Guide
                </Text>
                <Text style={[styles.docsBannerSub, {color: colors.textSecondary}]}>
                  Gemini 3.7 / 3.1, Claude 4.6, OpenCode, and Prompt Instructions
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>

            {/* ACTIVE PROVIDER TOGGLE (ONE MODEL AT A TIME) */}
            <View
              style={[
                styles.sectionCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <Text style={[styles.cardTitle, {color: colors.text, marginBottom: 4}]}>
                Active AI Provider
              </Text>
              <Text style={[styles.cardSubtitle, {color: colors.textSecondary, marginBottom: Spacing.sm}]}>
                Select which AI provider is actively used for chat and extraction.
              </Text>

              <View style={[styles.providerTabContainer, {backgroundColor: colors.surfaceAlt, borderColor: colors.border}]}>
                {/* Google Gemini Tab */}
                <TouchableOpacity
                  style={[
                    styles.providerTab,
                    selectedProvider === 'gemini' && {
                      backgroundColor: '#4285F4',
                    },
                  ]}
                  onPress={() => handleSelectProvider('gemini')}
                  activeOpacity={0.8}>
                  <Icon
                    name="auto-awesome"
                    size={18}
                    color={selectedProvider === 'gemini' ? '#FFFFFF' : '#4285F4'}
                  />
                  <Text
                    style={[
                      styles.providerTabText,
                      {
                        color: selectedProvider === 'gemini' ? '#FFFFFF' : colors.text,
                        fontWeight: selectedProvider === 'gemini' ? '700' : '600',
                      },
                    ]}>
                    Google Gemini
                  </Text>
                  {(inputGeminiKey || hasGeminiApiKey) && (
                    <View
                      style={[
                        styles.miniBadge,
                        {backgroundColor: selectedProvider === 'gemini' ? '#FFFFFF30' : '#4285F420'},
                      ]}>
                      <Text
                        style={[
                          styles.miniBadgeText,
                          {color: selectedProvider === 'gemini' ? '#FFFFFF' : '#4285F4'},
                        ]}>
                        Ready
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* OpenCode Zen Tab */}
                <TouchableOpacity
                  style={[
                    styles.providerTab,
                    selectedProvider === 'opencode' && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleSelectProvider('opencode')}
                  activeOpacity={0.8}>
                  <Icon
                    name="code"
                    size={18}
                    color={selectedProvider === 'opencode' ? '#FFFFFF' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.providerTabText,
                      {
                        color: selectedProvider === 'opencode' ? '#FFFFFF' : colors.text,
                        fontWeight: selectedProvider === 'opencode' ? '700' : '600',
                      },
                    ]}>
                    OpenCode Zen
                  </Text>
                  {(inputApiKey || hasApiKey) && (
                    <View
                      style={[
                        styles.miniBadge,
                        {backgroundColor: selectedProvider === 'opencode' ? '#FFFFFF30' : colors.primary + '20'},
                      ]}>
                      <Text
                        style={[
                          styles.miniBadgeText,
                          {color: selectedProvider === 'opencode' ? '#FFFFFF' : colors.primary},
                        ]}>
                        Ready
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 1. GOOGLE GEMINI SETTINGS */}
            {selectedProvider === 'gemini' ? (
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: '#4285F4',
                    borderWidth: 1.5,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Icon name="auto-awesome" size={20} color="#4285F4" />
                    <Text style={[styles.cardTitle, {color: colors.text}]}>
                      Google Gemini API Key (Paid & Studio)
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: (inputGeminiKey || hasGeminiApiKey)
                          ? '#4285F420'
                          : colors.warning + '20',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: (inputGeminiKey || hasGeminiApiKey)
                            ? '#4285F4'
                            : colors.warning,
                        },
                      ]}>
                      {(inputGeminiKey || hasGeminiApiKey) ? 'Active Provider' : 'Required'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]}>
                  Supports latest Gemini 3.7 Flash, 3.6, 3.5, and 3.1 Pro Low / Preview.
                </Text>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: colors.text}]}
                    placeholder="AIzaSy..."
                    placeholderTextColor={colors.placeholder}
                    value={inputGeminiKey}
                    onChangeText={setInputGeminiKey}
                    secureTextEntry={!showGeminiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowGeminiKey(!showGeminiKey)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name={showGeminiKey ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>

                {/* Sync Gemini Models */}
                <TouchableOpacity
                  style={[
                    styles.syncBtn,
                    {backgroundColor: '#4285F415', borderColor: '#4285F430'},
                  ]}
                  onPress={handleFetchLiveGemini}
                  disabled={fetchingModels}
                  activeOpacity={0.7}>
                  {fetchingModels ? (
                    <ActivityIndicator size="small" color="#4285F4" />
                  ) : (
                    <>
                      <Icon name="sync" size={16} color="#4285F4" />
                      <Text style={[styles.syncBtnText, {color: '#4285F4'}]}>
                        Sync Live Models for My Gemini Key
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Model list for Google Gemini */}
                <Text style={[styles.groupLabel, {color: '#4285F4', marginTop: Spacing.md}]}>
                  SELECT GEMINI MODEL (LATEST 3.x & 2.x)
                </Text>
                {geminiModels.map(m => {
                  const isSelected = !isCustomModel && selectedModel === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.modelRow,
                        {
                          backgroundColor: isSelected
                            ? '#4285F418'
                            : colors.surfaceAlt,
                          borderColor: isSelected ? '#4285F4' : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedModel(m.id);
                        setIsCustomModel(false);
                      }}
                      activeOpacity={0.7}>
                      <View style={styles.modelRowLeft}>
                        <Icon
                          name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                          size={20}
                          color={isSelected ? '#4285F4' : colors.textLight}
                        />
                        <View style={styles.modelInfo}>
                          <Text
                            style={[
                              styles.modelName,
                              {
                                color: isSelected ? '#4285F4' : colors.text,
                                fontWeight: isSelected ? '700' : '600',
                              },
                            ]}>
                            {m.name}
                          </Text>
                          <Text style={[styles.modelSub, {color: colors.textSecondary}]}>
                            ID: {m.apiModelId}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.modelBadge,
                          {
                            backgroundColor: isSelected ? '#4285F4' : '#4285F420',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.modelBadgeText,
                            {color: isSelected ? '#FFFFFF' : '#4285F4'},
                          ]}>
                          {m.badge}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* 2. OPENCODE ZEN SETTINGS */
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primary,
                    borderWidth: 1.5,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Icon name="code" size={20} color={colors.primary} />
                    <Text style={[styles.cardTitle, {color: colors.text}]}>
                      OpenCode Zen API Key
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: (inputApiKey || hasApiKey)
                          ? colors.secondary + '20'
                          : colors.warning + '20',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: (inputApiKey || hasApiKey)
                            ? colors.secondary
                            : colors.warning,
                        },
                      ]}>
                      {(inputApiKey || hasApiKey) ? 'Active Provider' : 'Required'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]}>
                  Access OpenCode Zen free models, Claude Thinking, and GPT-OSS.
                </Text>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: colors.text}]}
                    placeholder="opencode-api-key"
                    placeholderTextColor={colors.placeholder}
                    value={inputApiKey}
                    onChangeText={setInputApiKey}
                    secureTextEntry={!showApiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowApiKey(!showApiKey)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon
                      name={showApiKey ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={colors.textLight}
                    />
                  </TouchableOpacity>
                </View>

                {/* Sync OpenCode Models button */}
                <TouchableOpacity
                  style={[
                    styles.syncBtn,
                    {backgroundColor: colors.primary + '10', borderColor: colors.primary + '30'},
                  ]}
                  onPress={handleFetchLiveOpenCode}
                  disabled={fetchingModels}
                  activeOpacity={0.7}>
                  {fetchingModels ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon name="sync" size={16} color={colors.primary} />
                      <Text style={[styles.syncBtnText, {color: colors.primary}]}>
                        Sync Live Models from OpenCode Zen
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* OpenCode Models List */}
                <Text style={[styles.groupLabel, {color: colors.primary, marginTop: Spacing.md}]}>
                  SELECT OPENCODE / CLAUDE / GPT-OSS MODEL
                </Text>
                {openCodeModels.map(m => {
                  const isSelected = !isCustomModel && selectedModel === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.modelRow,
                        {
                          backgroundColor: isSelected
                            ? colors.primary + '18'
                            : colors.surfaceAlt,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedModel(m.id);
                        setIsCustomModel(false);
                      }}
                      activeOpacity={0.7}>
                      <View style={styles.modelRowLeft}>
                        <Icon
                          name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                          size={20}
                          color={isSelected ? colors.primary : colors.textLight}
                        />
                        <View style={styles.modelInfo}>
                          <Text
                            style={[
                              styles.modelName,
                              {
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? '700' : '600',
                              },
                            ]}>
                            {m.name}
                          </Text>
                          <Text style={[styles.modelSub, {color: colors.textSecondary}]}>
                            ID: {m.apiModelId}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.modelBadge,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.secondary + '20',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.modelBadgeText,
                            {color: isSelected ? '#FFFFFF' : colors.secondary},
                          ]}>
                          {m.badge}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Custom Model ID Option */}
            <View
              style={[
                styles.sectionCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={[
                  styles.modelRow,
                  {
                    backgroundColor: isCustomModel
                      ? colors.primary + '18'
                      : colors.surfaceAlt,
                    borderColor: isCustomModel ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setIsCustomModel(true)}
                activeOpacity={0.7}>
                <View style={styles.modelRowLeft}>
                  <Icon
                    name={isCustomModel ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={isCustomModel ? colors.primary : colors.textLight}
                  />
                  <View style={styles.modelInfo}>
                    <Text
                      style={[
                        styles.modelName,
                        {
                          color: isCustomModel ? colors.primary : colors.text,
                          fontWeight: isCustomModel ? '700' : '600',
                        },
                      ]}>
                      Custom Model Identifier
                    </Text>
                    <Text style={[styles.modelSub, {color: colors.textSecondary}]}>
                      Manually type any model identifier for {selectedProvider === 'gemini' ? 'Gemini' : 'OpenCode'}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.modelBadge,
                    {
                      backgroundColor: isCustomModel ? colors.primary : colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.modelBadgeText,
                      {color: isCustomModel ? '#FFFFFF' : colors.textSecondary},
                    ]}>
                    Custom
                  </Text>
                </View>
              </TouchableOpacity>

              {isCustomModel && (
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      marginTop: Spacing.sm,
                    },
                  ]}>
                  <TextInput
                    style={[styles.input, {color: colors.text}]}
                    placeholder={selectedProvider === 'gemini' ? 'gemini-3.1-pro-preview' : 'ox-alpha-free'}
                    placeholderTextColor={colors.placeholder}
                    value={customModelName}
                    onChangeText={setCustomModelName}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            </View>

            {/* Advanced OpenCode Base URL */}
            {selectedProvider === 'opencode' && (
              <>
                <TouchableOpacity
                  style={styles.advancedToggle}
                  onPress={() => setShowAdvancedUrl(!showAdvancedUrl)}>
                  <Text style={[styles.advancedToggleText, {color: colors.primary}]}>
                    {showAdvancedUrl ? '▲ Hide Advanced URL' : '▼ Advanced: Custom Base URL'}
                  </Text>
                </TouchableOpacity>

                {showAdvancedUrl && (
                  <View
                    style={[
                      styles.sectionCard,
                      {backgroundColor: colors.surface, borderColor: colors.border},
                    ]}>
                    <Text style={[styles.cardTitle, {color: colors.text}]}>
                      OpenCode Base URL
                    </Text>
                    <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]}>
                      Default: https://opencode.ai/zen/v1
                    </Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}>
                      <TextInput
                        style={[styles.input, {color: colors.text}]}
                        placeholder="https://opencode.ai/zen/v1"
                        placeholderTextColor={colors.placeholder}
                        value={inputBaseUrl}
                        onChangeText={setInputBaseUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Save Button */}
            <View style={styles.actionSection}>
              <CustomButton
                title={saving ? 'Saving...' : 'Save Prerequisites'}
                onPress={handleSave}
                loading={saving}
              />
            </View>
          </>
        ) : (
          /* =================== TAB 2: ON-DEVICE LOCAL MODELS =================== */
          <>
            <View
              style={[
                styles.infoCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <Icon name="folder-special" size={22} color={colors.primary} />
              <View style={{flex: 1}}>
                <Text style={[styles.infoHeading, {color: colors.text}]}>
                  Direct Phone Storage
                </Text>
                <Text style={[styles.infoText, {color: colors.textSecondary}]}>
                  Models are downloaded directly to{' '}
                  <Text style={{fontWeight: '700', color: colors.primary}}>
                  automation/models/
                  </Text>{' '}
                  so the app APK remains fast, lightweight, and easily updatable.
                </Text>
              </View>
            </View>

            {/* 1. VISION & DIFFUSION MODELS */}
            <Text
              style={[
                styles.groupLabel,
                {color: colors.primary, marginBottom: Spacing.sm, marginTop: Spacing.xs},
              ]}>
              OFFLINE DIFFUSION & 4K UPSCALING (VISION)
            </Text>

            {localModels
              .filter(m => m.category === 'vision')
              .map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.localModelCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: item.isDownloaded
                        ? colors.secondary + '60'
                        : colors.border,
                    },
                  ]}>
                  <View style={styles.localCardHeader}>
                    <View style={styles.localCardLeft}>
                      <View
                        style={[
                          styles.passBadge,
                          {
                            backgroundColor:
                              idx === 0
                                ? '#8B5CF620'
                                : idx === 1
                                ? '#10B98120'
                                : '#F59E0B20',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.passBadgeText,
                            {
                              color:
                                idx === 0
                                  ? '#8B5CF6'
                                  : idx === 1
                                  ? '#10B981'
                                  : '#F59E0B',
                            },
                          ]}>
                          {item.pass}
                        </Text>
                      </View>
                      <Text style={[styles.localModelName, {color: colors.text}]}>
                        {item.name}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.sizeBadge,
                        {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
                      ]}>
                      <Text style={[styles.sizeBadgeText, {color: colors.textSecondary}]}>
                        {item.size}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.localModelDesc, {color: colors.textSecondary}]}>
                    {item.description}
                  </Text>

                  {/* Progress bar if downloading */}
                  {item.isDownloading && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${item.downloadProgress}%`,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, {color: colors.primary}]}>
                        Downloading: {item.downloadProgress}%
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.localCardActions}>
                    {item.isDownloaded ? (
                      <View style={styles.downloadedRow}>
                        <View style={styles.readyBadge}>
                          <Icon name="check-circle" size={16} color={colors.secondary} />
                          <Text style={[styles.readyText, {color: colors.secondary}]}>
                            Downloaded (Ready on Device)
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.deleteBtn, {borderColor: colors.danger + '40'}]}
                          onPress={() => handleDeleteModel(item)}
                          activeOpacity={0.7}>
                          <Icon name="delete-outline" size={16} color={colors.danger} />
                          <Text style={[styles.deleteBtnText, {color: colors.danger}]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.downloadBtn,
                          {
                            backgroundColor: item.isDownloading
                              ? colors.surfaceAlt
                              : colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                        onPress={() => handleDownloadModel(item)}
                        disabled={item.isDownloading}
                        activeOpacity={0.8}>
                        {item.isDownloading ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <>
                            <Icon name="file-download" size={18} color="#FFFFFF" />
                            <Text style={styles.downloadBtnText}>
                              Download Model ({item.size})
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

            {/* 2. NEURAL VOICE & AUDIO MODELS */}
            <Text
              style={[
                styles.groupLabel,
                {color: '#10B981', marginBottom: Spacing.sm, marginTop: Spacing.lg},
              ]}>
              OFFLINE NEURAL VOICE & AUDIO ENGINES (KOKORO & AI4BHARAT)
            </Text>

            {localModels
              .filter(m => m.category === 'audio')
              .map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.localModelCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: item.isDownloaded
                        ? colors.secondary + '60'
                        : '#10B98140',
                    },
                  ]}>
                  <View style={styles.localCardHeader}>
                    <View style={styles.localCardLeft}>
                      <View
                        style={[
                          styles.passBadge,
                          {
                            backgroundColor: idx === 0 ? '#3B82F620' : '#10B98120',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.passBadgeText,
                            {
                              color: idx === 0 ? '#3B82F6' : '#10B981',
                            },
                          ]}>
                          {item.pass}
                        </Text>
                      </View>
                      <Text style={[styles.localModelName, {color: colors.text}]}>
                        {item.name}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.sizeBadge,
                        {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
                      ]}>
                      <Text style={[styles.sizeBadgeText, {color: colors.textSecondary}]}>
                        {item.size}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.localModelDesc, {color: colors.textSecondary}]}>
                    {item.description}
                  </Text>

                  {/* Progress bar if downloading */}
                  {item.isDownloading && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${item.downloadProgress}%`,
                              backgroundColor: '#10B981',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, {color: '#10B981'}]}>
                        Downloading: {item.downloadProgress}%
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.localCardActions}>
                    {item.isDownloaded ? (
                      <View style={styles.downloadedRow}>
                        <View style={styles.readyBadge}>
                          <Icon name="check-circle" size={16} color={colors.secondary} />
                          <Text style={[styles.readyText, {color: colors.secondary}]}>
                            Downloaded (Ready on Device)
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.deleteBtn, {borderColor: colors.danger + '40'}]}
                          onPress={() => handleDeleteModel(item)}
                          activeOpacity={0.7}>
                          <Icon name="delete-outline" size={16} color={colors.danger} />
                          <Text style={[styles.deleteBtnText, {color: colors.danger}]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.downloadBtn,
                          {
                            backgroundColor: item.isDownloading
                              ? colors.surfaceAlt
                              : '#10B981',
                            borderColor: '#10B981',
                          },
                        ]}
                        onPress={() => handleDownloadModel(item)}
                        disabled={item.isDownloading}
                        activeOpacity={0.8}>
                        {item.isDownloading ? (
                          <ActivityIndicator size="small" color="#10B981" />
                        ) : (
                          <>
                            <Icon name="file-download" size={18} color="#FFFFFF" />
                            <Text style={styles.downloadBtnText}>
                              Download Voice Model ({item.size})
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>

      {/* Documentation & Model Guide Modal */}
      <AppModal
        visible={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        contentStyle={styles.docsModalContent}>
        <View style={styles.docsModalHeader}>
          <Icon name="menu-book" size={24} color={colors.primary} />
          <Text style={[styles.docsModalTitle, {color: colors.text}]}>
            AI Documentation & Model Reference
          </Text>
        </View>

        <ScrollView
          style={styles.docsScrollView}
          contentContainerStyle={styles.docsScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}>
          {/* Gemini Full List */}
          <View style={styles.docBlock}>
            <Text style={[styles.docHeading, {color: '#4285F4'}]}>
              1. Google Gemini Models (Paid & Studio)
            </Text>
            <Text style={[styles.docText, {color: colors.text}]}>
              • <Text style={{fontWeight: '700'}}>gemini-3.7-flash</Text>: Gemini 3.7 Flash Medium (Fast Flagship){'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-3.6-flash</Text>: Gemini 3.6 Flash Medium{'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-3.5-flash</Text>: Gemini 3.5 Flash Medium{'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-3.1-pro-preview</Text>: Gemini 3.1 Pro Low / Preview (Latest Pro){'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-2.5-pro</Text>: Gemini 2.5 Pro Flagship Reasoning{'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-2.5-flash</Text>: Gemini 2.5 Flash Next-Gen{'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-2.0-flash</Text>: Ultra-fast, multimodal{'\n'}
              • <Text style={{fontWeight: '700'}}>gemini-1.5-pro</Text>: 2M token context for massive scripts.
            </Text>
          </View>

          {/* Local Diffusion Models */}
          <View style={styles.docBlock}>
            <Text style={[styles.docHeading, {color: '#8B5CF6'}]}>
              2. On-Device Local Models (FLUX & Real-ESRGAN)
            </Text>
            <Text style={[styles.docText, {color: colors.text}]}>
              • <Text style={{fontWeight: '700'}}>FLUX.1 [schnell] (Q4_0)</Text>: State-of-the-art 12B transformer base image generator (Pass 1).{'\n'}
              • <Text style={{fontWeight: '700'}}>4x-UltraSharp</Text>: Multiplies resolution up to 4K without blur (Pass 2).{'\n'}
              • <Text style={{fontWeight: '700'}}>FLUX Micro-Detail Refiner</Text>: Injects micro-textures & skin details in low-denoise pass (Pass 3).
            </Text>
          </View>

          {/* Claude & GPT Models */}
          <View style={styles.docBlock}>
            <Text style={[styles.docHeading, {color: '#D97706'}]}>
              3. Anthropic Claude & GPT-OSS
            </Text>
            <Text style={[styles.docText, {color: colors.text}]}>
              • <Text style={{fontWeight: '700'}}>claude-sonnet-4.6</Text>: Claude Sonnet 4.6 (Thinking){'\n'}
              • <Text style={{fontWeight: '700'}}>claude-opus-4.6</Text>: Claude Opus 4.6 (Thinking){'\n'}
              • <Text style={{fontWeight: '700'}}>gpt-oss-120b</Text>: GPT-OSS 120B (Medium)
            </Text>
          </View>

          {/* OpenCode Zen Full List */}
          <View style={styles.docBlock}>
            <Text style={[styles.docHeading, {color: colors.primary}]}>
              4. OpenCode Zen Free Models
            </Text>
            <Text style={[styles.docText, {color: colors.text}]}>
              • <Text style={{fontWeight: '700'}}>ox-alpha-free</Text>: Unlimited quota free model.{'\n'}
              • <Text style={{fontWeight: '700'}}>mimo-v2.5-free</Text>: MiMo v2.5 free model.{'\n'}
              • <Text style={{fontWeight: '700'}}>nemotron-3.5-lightning-free</Text>: Nemotron 3.5 Lightning.{'\n'}
              • <Text style={{fontWeight: '700'}}>muse-spark-1.2-free</Text>: Muse Spark 1.2.{'\n'}
              • <Text style={{fontWeight: '700'}}>big-pickle</Text>: Fast community free model.
            </Text>
          </View>

          {/* Tag Extraction Guide */}
          <View style={styles.docBlock}>
            <Text style={[styles.docHeading, {color: '#10B981'}]}>
              5. Automatic Asset Tag Extraction
            </Text>
            <Text style={[styles.docText, {color: colors.text}]}>
              Prompts will automatically format outputs using XML tags:{'\n'}
              • <Text style={{fontWeight: '700', color: colors.primary}}>&lt;Image&gt;visual scene description&lt;/Image&gt;</Text>{'\n'}
              • <Text style={{fontWeight: '700', color: '#10B981'}}>&lt;Audio&gt;dialogue or voiceover line&lt;/Audio&gt;</Text>{'\n'}
              Tapping <Text style={{fontWeight: '700'}}>"Extract Assets"</Text> pulls them directly into the Assets page.
            </Text>
          </View>
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainTabWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  mainTabBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 3,
    borderWidth: 1,
  },
  mainTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  mainTabText: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  docsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  docsBannerInfo: {
    flex: 1,
  },
  docsBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  docsBannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  providerTabContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    gap: 6,
  },
  providerTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  providerTabText: {
    fontSize: 13,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  cardTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
  },
  cardSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  modelRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 13,
  },
  modelSub: {
    fontSize: 11,
    marginTop: 1,
  },
  modelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  advancedToggle: {
    alignSelf: 'center',
    marginVertical: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  advancedToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: Spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
  localModelCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  localCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  localCardLeft: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  passBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  passBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  localModelName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  localModelDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#88888830',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  localCardActions: {
    marginTop: Spacing.xs,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  downloadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docsModalContent: {
    height: '85%',
    maxHeight: '88%',
  },
  docsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  docsModalTitle: {
    ...Typography.h2,
    fontSize: 17,
    fontWeight: '700',
  },
  docsScrollView: {
    flex: 1,
  },
  docsScrollContent: {
    paddingBottom: Spacing.xl,
  },
  docBlock: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#88888820',
  },
  docHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  docText: {
    fontSize: 13,
    lineHeight: 21,
  },
});
