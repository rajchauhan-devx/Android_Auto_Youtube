import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {ChatMessage as ChatMessageType} from '../types';
import {useTheme} from '../context/ThemeContext';
import {useApiConfig, DEFAULT_OPENCODE_MODELS} from '../context/ApiConfigContext';
import {useAssets} from '../context/AssetContext';
import {Typography} from '../theme/typography';
import {Spacing, BorderRadius} from '../theme/spacing';
import ChatBubble from '../components/preview/ChatBubble';
import ChatInput from '../components/preview/ChatInput';
import Header from '../components/common/Header';
import AppModal from '../components/common/AppModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

function cleanTagContent(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^[\s*_`"':\-–]+|[\s*_`"']+$/g, '')
    .replace(/<\/?(image|audio)[^>]*>/gi, '')
    .trim();
}

export function parseAssetsFromText(text: string): {images: string[]; audios: string[]} {
  const images: string[] = [];
  const audios: string[] = [];

  if (!text) return {images, audios};

  // Normalize HTML entities
  const normalized = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&');

  // Strategy 1: Standard <Image>...</Image> (with any markdown wrapping or attributes)
  const imgRegex1 = /<[\s*_]*image[^>]*[\s*_]*>([\s\S]*?)<[\s*_]*\/[\s*_]*image[\s*_]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgRegex1.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !images.includes(clean)) images.push(clean);
  }

  // Strategy 2: Bracket tags [Image]...[/Image]
  const imgRegex2 = /\[[\s*_]*image[^\]]*[\s*_]*\]([\s\S]*?)\[[\s*_]*\/[\s*_]*image[\s*_]*\]/gi;
  while ((match = imgRegex2.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !images.includes(clean)) images.push(clean);
  }

  // Strategy 3: Self-contained tags <Image: ...> or <Image - ...>
  const imgRegex3 = /<[\s*_]*image\s*[:\-–]\s*([^>]+)>/gi;
  while ((match = imgRegex3.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !images.includes(clean)) images.push(clean);
  }

  // Strategy 4: Markdown bold bullet tags: **Image 1:** ... or **<Image>** ...
  const imgRegex4 = /(?:\*\*|\*|__)?<image>(?:\*\*|\*|__)?\s*([^\n<]+)/gi;
  while ((match = imgRegex4.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !images.includes(clean)) images.push(clean);
  }

  // Audio Strategy 1: Standard <Audio>...</Audio>
  const audRegex1 = /<[\s*_]*audio[^>]*[\s*_]*>([\s\S]*?)<[\s*_]*\/[\s*_]*audio[\s*_]*>/gi;
  while ((match = audRegex1.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !audios.includes(clean)) audios.push(clean);
  }

  // Audio Strategy 2: Bracket tags [Audio]...[/Audio]
  const audRegex2 = /\[[\s*_]*audio[^\]]*[\s*_]*\]([\s\S]*?)\[[\s*_]*\/[\s*_]*audio[\s*_]*\]/gi;
  while ((match = audRegex2.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !audios.includes(clean)) audios.push(clean);
  }

  // Audio Strategy 3: Self-contained tags <Audio: ...> or <Audio - ...>
  const audRegex3 = /<[\s*_]*audio\s*[:\-–]\s*([^>]+)>/gi;
  while ((match = audRegex3.exec(normalized)) !== null) {
    const clean = cleanTagContent(match[1]);
    if (clean && !audios.includes(clean)) audios.push(clean);
  }

  return {images, audios};
}

export default function PreviewScreen({navigation}: Props) {
  const route = useRoute<any>();
  const {colors} = useTheme();
  const {
    apiKey,
    geminiApiKey,
    hasApiKey,
    hasGeminiApiKey,
    model,
    baseUrl,
    availableModels,
    saveApiConfig,
    sendMessageToAI,
  } = useApiConfig();
  const {saveExtractedAssetsFromTags} = useAssets();

  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm ready to help you generate and refine your video scripts and assets. What would you like to create?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const processedPromptRef = useRef<string | null>(null);

  const isGeminiModel = model.toLowerCase().startsWith('gemini');
  const isConfigured = isGeminiModel ? hasGeminiApiKey : hasApiKey;

  const executeSend = async (content: string, currentHistory: ChatMessageType[]) => {
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...currentHistory, userMsg];
    setMessages(updatedMessages);

    if (!isConfigured) {
      setTimeout(() => {
        const warningMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: isGeminiModel
            ? '⚠️ Google Gemini API Key is not configured. Please go to Profile > Prerequisites to add your free Gemini API key from Google AI Studio (aistudio.google.com).'
            : '⚠️ OpenCode API Key is not configured. Please go to Profile > Prerequisites to add your OpenCode API key and select your preferred model.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, warningMsg]);
      }, 500);
      return;
    }

    setIsAiTyping(true);
    try {
      const historyForAI = currentHistory
        .filter(m => m.id !== '1')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const reply = await sendMessageToAI(historyForAI, content);

      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      let customErr = err.message || 'Failed to get response from AI.';
      if (err.message === 'MISSING_GEMINI_KEY') {
        customErr = 'Google Gemini API key missing. Please enter your key in Profile > Prerequisites.';
      } else if (err.message === 'MISSING_API_KEY') {
        customErr = 'OpenCode API key missing. Please enter your key in Profile > Prerequisites.';
      }

      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${customErr}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSend = (content: string) => {
    executeSend(content, messages);
  };

  // Auto-start generation when routed from ScriptScreen
  useEffect(() => {
    const initialPrompt = route.params?.initialPrompt;
    if (
      initialPrompt &&
      initialPrompt.trim() &&
      processedPromptRef.current !== initialPrompt
    ) {
      processedPromptRef.current = initialPrompt;
      executeSend(initialPrompt.trim(), messages);
    }
  }, [route.params?.initialPrompt]);

  // Robust tag-based asset extraction
  const handleExtractAssets = async () => {
    setExtracting(true);
    try {
      let allExtractedImages: string[] = [];
      let allExtractedAudios: string[] = [];

      // 1. First priority: Extract from AI responses
      const aiResponses = messages.filter(
        msg => msg.role === 'assistant' && msg.id !== '1',
      );

      for (const msg of aiResponses) {
        const {images, audios} = parseAssetsFromText(msg.content);
        for (const img of images) {
          if (!allExtractedImages.includes(img)) allExtractedImages.push(img);
        }
        for (const aud of audios) {
          if (!allExtractedAudios.includes(aud)) allExtractedAudios.push(aud);
        }
      }

      // 2. Fallback: If AI assistant had no tags, scan full conversation so user is never blocked
      if (allExtractedImages.length === 0 && allExtractedAudios.length === 0) {
        for (const msg of messages) {
          if (msg.id === '1') continue;
          const {images, audios} = parseAssetsFromText(msg.content);
          for (const img of images) {
            if (!allExtractedImages.includes(img)) allExtractedImages.push(img);
          }
          for (const aud of audios) {
            if (!allExtractedAudios.includes(aud)) allExtractedAudios.push(aud);
          }
        }
      }

      if (allExtractedImages.length === 0 && allExtractedAudios.length === 0) {
        Alert.alert(
          'No Tags Found',
          'Could not find <Image>...</Image> or <Audio>...</Audio> tags in the chat.\n\nPlease ask the AI: "Please format each image prompt as <Image>description</Image> and each voice line as <Audio>line</Audio>".',
        );
        return;
      }

      // Save to context & phone storage, replacing previous stale extractions
      await saveExtractedAssetsFromTags(
        allExtractedImages,
        allExtractedAudios,
        true,
      );

      Alert.alert(
        'Assets Extracted!',
        `Found ${allExtractedImages.length} Image Prompts and ${allExtractedAudios.length} Audio Prompts.\n\nOpening Assets page...`,
        [
          {
            text: 'View Assets',
            onPress: () => navigation.navigate('Assets'),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Extraction Error', err.message || 'Failed to extract assets');
    } finally {
      setExtracting(false);
    }
  };

  const handleSelectQuickModel = async (newModelId: string) => {
    await saveApiConfig(apiKey, newModelId, baseUrl, geminiApiKey);
    setShowModelPicker(false);
  };

  const modelsList =
    availableModels.length > 0 ? availableModels : DEFAULT_OPENCODE_MODELS;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Preview"
        subtitle={`Model: ${model}`}
        rightAction={{
          icon: 'download',
          onPress: () => {},
        }}
      />

      {/* Model & Config Bar */}
      <View
        style={[
          styles.configBar,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <TouchableOpacity
          style={styles.configInfo}
          onPress={() => setShowModelPicker(true)}
          activeOpacity={0.7}>
          <Icon
            name={isGeminiModel ? 'auto-awesome' : 'smart-toy'}
            size={16}
            color={isConfigured ? (isGeminiModel ? '#4285F4' : colors.secondary) : colors.warning}
          />
          <Text
            style={[styles.configModelText, {color: colors.text}]}
            numberOfLines={1}>
            {model}
          </Text>
          <Icon name="arrow-drop-down" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.rightBarActions}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isConfigured
                  ? (isGeminiModel ? '#4285F420' : colors.secondary + '20')
                  : colors.warning + '20',
              },
            ]}>
            <Text
              style={[
                styles.statusPillText,
                {color: isConfigured ? (isGeminiModel ? '#4285F4' : colors.secondary) : colors.warning},
              ]}>
              {isConfigured ? 'Ready' : 'No Key'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.setupBtn, {backgroundColor: colors.primary + '15'}]}
            onPress={() => navigation.navigate('Prerequisites')}
            activeOpacity={0.7}>
            <Icon name="tune" size={14} color={colors.primary} />
            <Text style={[styles.setupBtnText, {color: colors.primary}]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Extract assets button */}
      <TouchableOpacity
        style={[
          styles.extractBtn,
          {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
        ]}
        onPress={handleExtractAssets}
        disabled={extracting}
        activeOpacity={0.8}>
        {extracting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="perm-media" size={18} color="#FFFFFF" />
            <Text style={styles.extractBtnText}>Extract Assets</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Chat messages */}
      <FlatList
        data={messages}
        renderItem={({item}) => <ChatBubble message={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      {/* Typing indicator */}
      {isAiTyping && (
        <View
          style={[
            styles.typingContainer,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.typingText, {color: colors.textSecondary}]}>
            {model} is generating...
          </Text>
        </View>
      )}

      <ChatInput onSend={handleSend} />

      {/* Quick Model Selector Modal */}
      <AppModal
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        contentStyle={styles.pickerModalContent}>
        <Text style={[styles.pickerTitle, {color: colors.text}]}>
          Switch AI Model
        </Text>
        <Text
          style={[styles.pickerSubtitle, {color: colors.textSecondary}]}>
          Choose between Google Gemini Free Tier or OpenCode Zen Free Models.
        </Text>

        <ScrollView
          style={styles.pickerScrollView}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}>
          {modelsList.map(m => {
            const isSelected =
              model === m.id || model === m.apiModelId || model === m.name;
            const isGemini = m.provider === 'Google Gemini';
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.pickerRow,
                  {
                    backgroundColor: isSelected
                      ? colors.primary + '18'
                      : colors.surfaceAlt,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectQuickModel(m.apiModelId || m.id)}
                activeOpacity={0.7}>
                <View style={styles.pickerRowLeft}>
                  <Icon
                    name={
                      isSelected
                        ? 'radio-button-checked'
                        : 'radio-button-unchecked'
                    }
                    size={18}
                    color={isSelected ? colors.primary : colors.textLight}
                  />
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.pickerModelName,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}>
                      {m.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: isGemini ? '#4285F4' : colors.textSecondary,
                      }}>
                      {m.provider}
                    </Text>
                  </View>
                </View>

                {m.badge ? (
                  <View
                    style={[
                      styles.pickerBadge,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : (isGemini ? '#4285F420' : colors.border),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.pickerBadgeText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : (isGemini ? '#4285F4' : colors.textSecondary),
                        },
                      ]}>
                      {m.badge}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  configBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
  },
  configInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  configModelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rightBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  setupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  setupBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  extractBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageList: {
    paddingVertical: Spacing.xs,
    flexGrow: 1,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  typingText: {
    fontSize: 12,
  },
  pickerModalContent: {
    maxHeight: '75%',
  },
  pickerTitle: {
    ...Typography.h2,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  pickerSubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  pickerScrollView: {
    maxHeight: 380,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  pickerModelName: {
    fontSize: 13,
  },
  pickerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pickerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
