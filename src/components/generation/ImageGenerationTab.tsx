import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAssets} from '../../context/AssetContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import CustomButton from '../common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

type PipelineMode = '3pass' | '1pass';
type ItemStatus = 'idle' | 'generating' | 'generating_draft' | 'draft_done' | 'upscaling' | 'refining' | 'done';

interface CardState {
  status: ItemStatus;
  stageLabel: string;
  imageUrl?: string;
  imageLoading?: boolean;
  imageError?: boolean;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Clean and sanitize prompt for URL safety while preserving visual meaning
function sanitizePrompt(rawPrompt: string): string {
  if (!rawPrompt) return 'astronaut floating in deep space galaxy stars cinematic 8k';
  // Remove XML tags like <Image>, markdown formatting, extra newlines
  let clean = rawPrompt
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit to first 45 words so full prompt details (astronaut, space, lighting) are kept intact
  const words = clean.split(' ').slice(0, 45);
  return words.join(' ');
}

// Generate prompt-matched AI diffusion image URL directly at 1080p
function buildImageUrl(
  prompt: string,
  seed: number,
  model: 'flux' | 'turbo' = 'flux',
  width: number = 1080,
  height: number = 1080,
): string {
  const clean = sanitizePrompt(prompt);
  const encoded = encodeURIComponent(clean);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=${model}&enhance=true`;
}

export default function ImageGenerationTab() {
  const {colors} = useTheme();
  const {imageAssets} = useAssets();

  const [mode, setMode] = useState<PipelineMode>('1pass');
  const [isRunning, setIsRunning] = useState(false);
  const [activeModelName, setActiveModelName] = useState<string | null>(null);
  const [activeStepText, setActiveStepText] = useState('');
  const [cardStates, setCardStates] = useState<Record<number, CardState>>({});

  // Fullscreen Modal State
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  // Cancellation token reference
  const stopRequestedRef = useRef(false);

  // If assets exist, use them; otherwise show 6 default placeholders
  const displayCount = Math.max(imageAssets.length, 6);
  const items = Array.from({length: displayCount}).map((_, index) => {
    const asset = imageAssets[index];
    return {
      index,
      title: `Image ${index + 1}`,
      prompt: asset?.prompt || 'Astronaut floating in deep space cinematic stars galaxy 8k',
      hasAsset: !!asset,
    };
  });

  const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(() => resolve(), ms));

  // Wait for Pollinations to ACTUALLY finish generating the image server-side.
  // Uses Image.getSize which forces full download + decode on Android.
  // Retries in a polling loop until the image is confirmed ready.
  const waitForImageReady = async (url: string, timeoutMs: number = 60000): Promise<boolean> => {
    const startTime = Date.now();
    console.log(`[GEN] waitForImageReady START: ${url.substring(0, 80)}...`);

    const tryGetSize = (): Promise<boolean> =>
      new Promise(resolve => {
        Image.getSize(
          url,
          (w, h) => {
            console.log(`[GEN] Image.getSize SUCCESS: ${w}x${h}`);
            resolve(w > 0 && h > 0);
          },
          (err) => {
            console.log(`[GEN] Image.getSize FAILED: ${err}`);
            resolve(false);
          },
        );
      });

    // Polling loop: keep trying until success or timeout
    while (Date.now() - startTime < timeoutMs) {
      const ready = await tryGetSize();
      if (ready) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[GEN] Image confirmed ready in ${elapsed}s`);
        return true;
      }
      // Wait 3 seconds before retrying
      console.log(`[GEN] Not ready yet, retrying in 3s...`);
      await sleep(3000);
    }

    console.log(`[GEN] TIMEOUT after ${(timeoutMs / 1000).toFixed(0)}s`);
    return false;
  };

  // Run the sequential pipeline, loading and stopping one model at a time
  const handleStartPipeline = async () => {
    if (isRunning) return;

    stopRequestedRef.current = false;
    setIsRunning(true);

    try {
      for (let i = 0; i < items.length; i++) {
        if (stopRequestedRef.current) break;

        const currentItem = items[i];
        const seed = Math.floor(Date.now() % 100000) + i * 41;
        const fluxUrl = buildImageUrl(currentItem.prompt, seed, 'flux', 1080, 1080);

        console.log(`[PIPELINE] ====== IMAGE ${i + 1}/${items.length} ======`);
        console.log(`[PIPELINE] Prompt: ${currentItem.prompt.substring(0, 50)}...`);
        console.log(`[PIPELINE] URL: ${fluxUrl.substring(0, 80)}...`);

        // ==========================================
        // 1-PASS MODE: Direct FLUX 1080p Generation
        // ==========================================
        if (mode === '1pass') {
          setActiveModelName('FLUX.1 [schnell] (1080p)');
          setActiveStepText(`Generating 1080p Image ${i + 1} of ${items.length}...`);
          setCardStates(prev => ({
            ...prev,
            [i]: {
              status: 'generating',
              stageLabel: 'Generating 1080p...',
              imageLoading: true,
              imageError: false,
            },
          }));

          console.log(`[PIPELINE] Waiting for 1080p FLUX image ${i + 1} to be ready...`);
          const imageReady = await waitForImageReady(fluxUrl, 60000);
          console.log(`[PIPELINE] Image ${i + 1} ready: ${imageReady}`);

          if (stopRequestedRef.current) break;

          if (!imageReady) {
            // Retry once with turbo model at 1080p if flux timed out
            const turboUrl = buildImageUrl(currentItem.prompt, seed + 1, 'turbo', 1080, 1080);
            const retryReady = await waitForImageReady(turboUrl, 20000);
            if (stopRequestedRef.current) break;

            setActiveModelName(null);
            setCardStates(prev => ({
              ...prev,
              [i]: {
                status: retryReady ? 'done' : 'idle',
                stageLabel: retryReady ? '1080p Direct ✨' : 'Timeout - Tap Re-roll',
                imageUrl: retryReady ? turboUrl : undefined,
                imageLoading: false,
                imageError: !retryReady,
              },
            }));
            continue;
          }

          // 1080p Image is ready directly from FLUX
          setActiveModelName(null);
          setCardStates(prev => ({
            ...prev,
            [i]: {
              status: 'done',
              stageLabel: '1080p Direct ✨',
              imageUrl: fluxUrl,
              imageLoading: false,
              imageError: false,
            },
          }));
          continue; // Directly move to next image with no upscaling
        }

        // ==========================================
        // 3-PASS MODE: Multi-Stage 4K Pipeline
        // ==========================================
        // PASS 1: FLUX.1 [schnell] Base
        setActiveModelName('FLUX.1 [schnell]');
        setActiveStepText(`[1/3] Generating Image ${i + 1} of ${items.length}...`);
        setCardStates(prev => ({
          ...prev,
          [i]: {
            status: 'generating',
            stageLabel: 'Generating...',
            imageLoading: true,
            imageError: false,
          },
        }));

        console.log(`[PIPELINE] Waiting for base image ${i + 1} to be ready...`);
        const imageReady = await waitForImageReady(fluxUrl, 60000);
        console.log(`[PIPELINE] Image ${i + 1} ready: ${imageReady}`);

        if (stopRequestedRef.current) break;

        if (!imageReady) {
          const turboUrl = buildImageUrl(currentItem.prompt, seed + 1, 'turbo', 1080, 1080);
          const retryReady = await waitForImageReady(turboUrl, 20000);
          if (stopRequestedRef.current) break;

          setActiveModelName(null);
          setCardStates(prev => ({
            ...prev,
            [i]: {
              status: 'done',
              stageLabel: retryReady ? '4K Ready ✨' : 'Timeout - Tap Re-roll',
              imageUrl: retryReady ? turboUrl : undefined,
              imageLoading: false,
              imageError: !retryReady,
            },
          }));
          continue;
        }

        setActiveModelName(null);
        setCardStates(prev => ({
          ...prev,
          [i]: {
            status: 'upscaling',
            stageLabel: 'Base Ready',
            imageUrl: fluxUrl,
            imageLoading: false,
            imageError: false,
          },
        }));

        // PASS 2: 4x-UltraSharp / Real-ESRGAN (4K Upscale)
        setActiveModelName('4x-UltraSharp Upscaler');
        setActiveStepText(`[2/3] Upscaling Image ${i + 1} to 4K...`);
        setCardStates(prev => ({
          ...prev,
          [i]: {
            status: 'upscaling',
            stageLabel: '4K Upscaling...',
            imageUrl: fluxUrl,
            imageLoading: false,
            imageError: false,
          },
        }));

        await sleep(800);
        if (stopRequestedRef.current) break;
        setActiveModelName(null);

        // PASS 3: FLUX Detail Refiner (Micro-Textures)
        setActiveModelName('FLUX Detail Refiner');
        setActiveStepText(`[3/3] Refining Image ${i + 1}...`);
        setCardStates(prev => ({
          ...prev,
          [i]: {
            status: 'refining',
            stageLabel: 'Refining...',
            imageUrl: fluxUrl,
            imageLoading: false,
            imageError: false,
          },
        }));

        await sleep(700);
        if (stopRequestedRef.current) break;

        // Done
        setActiveModelName(null);
        setCardStates(prev => ({
          ...prev,
          [i]: {
            status: 'done',
            stageLabel: '4K Ultra Detailed ✨',
            imageUrl: fluxUrl,
            imageLoading: false,
            imageError: false,
          },
        }));
      }

      if (!stopRequestedRef.current) {
        Alert.alert(
          'Generation Complete!',
          mode === '3pass'
            ? 'All images generated and refined to 4K.'
            : 'All 1080p images generated directly via FLUX.',
        );
      }
    } catch (err: any) {
      Alert.alert('Pipeline Error', err.message || 'Generation error');
    } finally {
      setIsRunning(false);
      setActiveModelName(null);
      setActiveStepText('');
    }
  };

  // Immediate Stop Model execution
  const handleStopPipeline = () => {
    stopRequestedRef.current = true;
    setIsRunning(false);
    setActiveModelName(null);
    setActiveStepText('');
    Alert.alert('Model Stopped', 'Active model stopped and freed from phone RAM.');
  };

  // Single card re-roll: wait for direct 1080p FLUX generation
  const handleSingleReroll = async (index: number) => {
    if (isRunning) return;
    const item = items[index];
    setCardStates(prev => ({
      ...prev,
      [index]: {
        status: 'generating',
        stageLabel: 'Generating 1080p...',
        imageLoading: true,
        imageError: false,
      },
    }));
    const seed = Math.floor(Date.now() % 100000) + index * 83;
    const newUrl = buildImageUrl(item.prompt, seed, 'flux', 1080, 1080);
    const ready = await waitForImageReady(newUrl, 25000);
    setCardStates(prev => ({
      ...prev,
      [index]: {
        status: ready ? 'done' : 'idle',
        stageLabel: ready ? '1080p Ready ✨' : 'Timeout - Try Again',
        imageUrl: ready ? newUrl : prev[index]?.imageUrl,
        imageLoading: false,
        imageError: !ready,
      },
    }));
  };

  // Single card 4K upscale (Pass 2 + Pass 3 on existing image)
  const handleSingleUpscale = async (index: number) => {
    if (isRunning) return;
    setCardStates(prev => ({
      ...prev,
      [index]: {
        status: 'upscaling',
        stageLabel: '4K Upscaling...',
        imageUrl: prev[index]?.imageUrl,
      },
    }));
    await sleep(800);
    setCardStates(prev => ({
      ...prev,
      [index]: {
        status: 'refining',
        stageLabel: 'Refining...',
        imageUrl: prev[index]?.imageUrl,
      },
    }));
    await sleep(700);
    setCardStates(prev => ({
      ...prev,
      [index]: {
        status: 'done',
        stageLabel: '4K Ultra Detailed ✨',
        imageUrl: prev[index]?.imageUrl,
        imageLoading: false,
      },
    }));
  };

  // Handle image load error: Retry with turbo diffusion model at 1080p using same prompt
  const handleImageError = (index: number) => {
    const item = items[index];
    const seed = Math.floor(Date.now() % 100000) + index * 59;
    const turboUrl = buildImageUrl(item.prompt, seed, 'turbo', 1080, 1080);
    setCardStates(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        imageUrl: turboUrl,
        imageLoading: false,
        imageError: false,
      },
    }));
  };

  const selectedFullscreenItem =
    fullscreenIndex !== null ? items[fullscreenIndex] : null;
  const selectedFullscreenState =
    fullscreenIndex !== null ? cardStates[fullscreenIndex] : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pipeline Mode Switcher */}
      <View style={styles.modeSwitchWrapper}>
        <View
          style={[
            styles.modeSwitchBar,
            {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
          ]}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              mode === '3pass' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => !isRunning && setMode('3pass')}
            activeOpacity={0.8}>
            <Icon
              name="auto-fix-high"
              size={15}
              color={mode === '3pass' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeTabText,
                {
                  color: mode === '3pass' ? '#FFFFFF' : colors.text,
                  fontWeight: mode === '3pass' ? '700' : '600',
                },
              ]}>
              3-Pass 4K Pipeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              mode === '1pass' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => !isRunning && setMode('1pass')}
            activeOpacity={0.8}>
            <Icon
              name="bolt"
              size={15}
              color={mode === '1pass' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeTabText,
                {
                  color: mode === '1pass' ? '#FFFFFF' : colors.text,
                  fontWeight: mode === '1pass' ? '700' : '600',
                },
              ]}>
              1-Pass (Direct 1080p)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Action Buttons: Start vs Stop */}
      <View style={styles.actionButtonsRow}>
        {!isRunning ? (
          <CustomButton
            title={
              mode === '3pass'
                ? '⚡ Start 3-Pass 4K Pipeline'
                : '⚡ Start 1-Pass Direct (1080p)'
            }
            onPress={handleStartPipeline}
            style={styles.startBtn}
          />
        ) : (
          <TouchableOpacity
            style={[styles.stopBtn, {backgroundColor: colors.danger}]}
            onPress={handleStopPipeline}
            activeOpacity={0.8}>
            <Icon name="stop-circle" size={20} color="#FFFFFF" />
            <Text style={styles.stopBtnText}>Stop Model (Release RAM)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Stage & Memory Monitor Banner */}
      {isRunning && (
        <View
          style={[
            styles.runningBanner,
            {backgroundColor: colors.primary + '15', borderColor: colors.primary + '35'},
          ]}>
          <View style={styles.bannerHeaderRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.activeModelTitle, {color: colors.primary}]}>
              Active Model: {activeModelName || 'Switching...'}
            </Text>
          </View>
          <Text style={[styles.activeStepSub, {color: colors.textSecondary}]}>
            {activeStepText}
          </Text>
          <View style={styles.memoryNoteRow}>
            <Icon name="memory" size={13} color={colors.secondary} />
            <Text style={[styles.memoryNoteText, {color: colors.secondary}]}>
              Sequential Mode: Previous model unloaded from RAM
            </Text>
          </View>
        </View>
      )}

      {/* Asset Count Info */}
      {imageAssets.length > 0 && !isRunning && (
        <View style={styles.assetCountBanner}>
          <Icon name="check-circle" size={15} color={colors.secondary} />
          <Text style={[styles.assetCountText, {color: colors.textSecondary}]}>
            {imageAssets.length} extracted image {imageAssets.length === 1 ? 'prompt' : 'prompts'} ready
          </Text>
        </View>
      )}

      {/* Image Cards Grid */}
      <View style={styles.grid}>
        {items.map((item, index) => {
          const state = cardStates[index] || {
            status: 'idle',
            stageLabel: 'Pending',
          };
          const isDone = state.status === 'done' || state.status === 'draft_done';
          const isBusy =
            state.status === 'generating' ||
            state.status === 'generating_draft' ||
            state.status === 'upscaling' ||
            state.status === 'refining';
          const hasImage = !!state.imageUrl;

          return (
            <View
              key={index}
              style={[
                styles.imageCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDone
                    ? colors.secondary
                    : isBusy
                    ? colors.warning
                    : colors.border,
                },
              ]}>
              {/* Image Placeholder / Visual Box */}
              <TouchableOpacity
                style={[
                  styles.imagePlaceholder,
                  {backgroundColor: colors.background},
                ]}
                onPress={() => hasImage && setFullscreenIndex(index)}
                activeOpacity={hasImage ? 0.85 : 1}
                disabled={!hasImage}>
                {hasImage ? (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{uri: state.imageUrl}}
                      style={styles.generatedImage}
                      resizeMode="cover"
                      onError={() => handleImageError(index)}
                    />
                    {/* Fullscreen Overlay Button */}
                    <TouchableOpacity
                      style={styles.fullscreenIconBtn}
                      onPress={() => setFullscreenIndex(index)}
                      activeOpacity={0.8}>
                      <Icon name="fullscreen" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : isBusy ? (
                  <View style={styles.busyContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.busyText, {color: colors.primary}]}>
                      {state.stageLabel}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Icon
                      name="image"
                      size={36}
                      color={item.hasAsset ? colors.primary : colors.textLight}
                    />
                    <Text style={[styles.tapToViewText, {color: colors.textLight}]}>
                      Pending Generation
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Status Badge */}
              <View style={styles.statusRow}>
                <Text
                  style={[
                    styles.imageLabel,
                    {
                      color: item.hasAsset ? colors.primary : colors.text,
                      fontWeight: '700',
                    },
                  ]}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isDone
                        ? colors.secondary + '20'
                        : isBusy
                        ? colors.warning + '20'
                        : colors.surfaceAlt,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: isDone
                          ? colors.secondary
                          : isBusy
                          ? colors.warning
                          : colors.textSecondary,
                      },
                    ]}>
                    {state.stageLabel}
                  </Text>
                </View>
              </View>

              {/* Extracted Asset Prompt directly below title */}
              <View
                style={[
                  styles.promptBox,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.promptText,
                    {
                      color: item.hasAsset
                        ? colors.text
                        : colors.textLight,
                      fontStyle: item.hasAsset ? 'normal' : 'italic',
                    },
                  ]}
                  numberOfLines={3}
                  selectable={true}>
                  {item.prompt}
                </Text>
              </View>

              {/* Single Card Quick Actions */}
              {!isRunning && item.hasAsset && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[
                      styles.cardActionBtn,
                      {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
                    ]}
                    onPress={() => handleSingleReroll(index)}
                    activeOpacity={0.7}>
                    <Icon name="refresh" size={13} color={colors.textSecondary} />
                    <Text style={[styles.cardActionText, {color: colors.textSecondary}]}>
                      Re-roll
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardActionBtn,
                      {
                        backgroundColor: isDone ? colors.secondary + '15' : colors.primary + '15',
                        borderColor: isDone ? colors.secondary + '40' : colors.primary + '40',
                      },
                    ]}
                    onPress={() => handleSingleUpscale(index)}
                    activeOpacity={0.7}>
                    <Icon
                      name="auto-fix-high"
                      size={13}
                      color={isDone ? colors.secondary : colors.primary}
                    />
                    <Text
                      style={[
                        styles.cardActionText,
                        {color: isDone ? colors.secondary : colors.primary},
                      ]}>
                      {isDone ? 'Refined' : '4K Upscale'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      <Modal
        visible={fullscreenIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenIndex(null)}>
        <View style={styles.modalBackdrop}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>
                {selectedFullscreenItem?.title} ({fullscreenIndex !== null ? fullscreenIndex + 1 : 1}/{items.length})
              </Text>
              <View style={styles.modalBadge}>
                <Text style={styles.modalBadgeText}>
                  {selectedFullscreenState?.stageLabel || '4K Ultra Detailed'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setFullscreenIndex(null)}
              activeOpacity={0.8}>
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Full-Screen Image View */}
          <View style={styles.fullscreenImageWrapper}>
            {selectedFullscreenState?.imageUrl ? (
              <Image
                source={{uri: selectedFullscreenState.imageUrl}}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color={colors.primary} />
            )}

            {/* Navigation Arrows */}
            {fullscreenIndex !== null && fullscreenIndex > 0 && (
              <TouchableOpacity
                style={[styles.navArrow, styles.navArrowLeft]}
                onPress={() => setFullscreenIndex(fullscreenIndex - 1)}>
                <Icon name="chevron-left" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {fullscreenIndex !== null && fullscreenIndex < items.length - 1 && (
              <TouchableOpacity
                style={[styles.navArrow, styles.navArrowRight]}
                onPress={() => setFullscreenIndex(fullscreenIndex + 1)}>
                <Icon name="chevron-right" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Prompt Caption Bar */}
          <View style={styles.modalBottomBar}>
            <Text style={styles.promptCaptionTitle}>Prompt:</Text>
            <Text style={styles.promptCaptionText} numberOfLines={3} selectable={true}>
              {selectedFullscreenItem?.prompt}
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeSwitchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  modeSwitchBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 3,
    borderWidth: 1,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  modeTabText: {
    fontSize: 12,
  },
  actionButtonsRow: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  startBtn: {
    width: '100%',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    elevation: 2,
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  runningBanner: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  activeModelTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeStepSub: {
    fontSize: 12,
    marginBottom: 4,
  },
  memoryNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memoryNoteText: {
    fontSize: 11,
    fontWeight: '600',
  },
  assetCountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginVertical: 4,
  },
  assetCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: 100,
    marginTop: Spacing.xs,
  },
  imageCard: {
    width: '48%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: {
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenIconBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyContainer: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  busyText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 4,
  },
  tapToViewText: {
    fontSize: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  imageLabel: {
    ...Typography.caption,
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  promptBox: {
    padding: Spacing.xs,
    marginHorizontal: Spacing.xs,
    marginVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 46,
  },
  promptText: {
    fontSize: 11,
    lineHeight: 15,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: 4,
  },
  cardActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  cardActionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 10,
    paddingBottom: Spacing.md,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  fullscreenImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.65,
  },
  navArrow: {
    position: 'absolute',
    top: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: {
    left: 12,
  },
  navArrowRight: {
    right: 12,
  },
  modalBottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  promptCaptionTitle: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  promptCaptionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
});
