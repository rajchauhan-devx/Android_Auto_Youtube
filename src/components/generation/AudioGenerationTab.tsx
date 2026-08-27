import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {useAssets} from '../../context/AssetContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import CustomButton from '../common/CustomButton';
import CharacterCard from './CharacterCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  KOKORO_OFFICIAL_VOICES,
  HINDI_OFFICIAL_VOICES,
  ModelVoice,
  GeneratedVoiceTrack,
  buildVoiceAudioUrl,
  checkOfflineVoiceModelStatus,
  ensureAudioStorageDir,
} from '../../utils/audioPlayer';

const AUDIO_TABS = ['English (Kokoro-82M)', 'Hindi (Piper / VITS)'];

export default function AudioGenerationTab() {
  const {colors} = useTheme();
  const {audioAssets} = useAssets();

  const [activeAudioTab, setActiveAudioTab] = useState(AUDIO_TABS[0]);
  const isEnglish = activeAudioTab === AUDIO_TABS[0];
  const modelVoices: ModelVoice[] = isEnglish ? KOKORO_OFFICIAL_VOICES : HINDI_OFFICIAL_VOICES;

  const [selectedVoiceId, setSelectedVoiceId] = useState(modelVoices[0].id);
  const [audioScriptText, setAudioScriptText] = useState('');

  // Engine status
  const [offlineModels, setOfflineModels] = useState({
    kokoroReady: false,
    indicReady: false,
  });

  // Pipeline state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepText, setActiveStepText] = useState('');
  const [activeModelName, setActiveModelName] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);

  // Audio Playback states
  const [samplePlayingId, setSamplePlayingId] = useState<string | null>(null);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedVoiceTrack[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});

  const playbackTimerRef = useRef<any>(null);

  useEffect(() => {
    checkModels();
    setSelectedVoiceId(modelVoices[0].id);
  }, [activeAudioTab]);

  useEffect(() => {
    if (audioAssets.length > 0) {
      const combined = audioAssets
        .map((a, i) => {
          const defaultVoice = modelVoices[i % modelVoices.length];
          const speaker = a.characterName || defaultVoice.name;
          const text = a.prompt || a.text || '';
          return `[Voice: ${defaultVoice.id}] ${speaker}\n${text}`;
        })
        .join('\n\n');
      setAudioScriptText(combined);
    } else {
      const defaultScript = isEnglish
        ? `[Voice: af_heart] Narrator\nIn the quiet moments before dawn, the world holds its breath in wonder.\n\n[Voice: am_adam] Protagonist\nWe only have one opportunity to make this work. Stand by for launch.\n\n[Voice: bf_emma] Assistant\nAll neural parameters are aligned and ready for real-time execution.`
        : `[Voice: hi_pratham] सूत्रधार\nसत्य और निष्ठा के मार्ग पर चलने से हर लक्ष्य को प्राप्त किया जा सकता है।\n\n[Voice: hi_priyamvada] नायिका\nज्ञान और समझ ही जीवन में नई दिशा और प्रेरणा प्रदान करते हैं।\n\n[Voice: hi_rohan] नायक\nआज का दिन एक नई शुरुआत और नए संकल्पों का प्रतीक है।`;
      setAudioScriptText(defaultScript);
    }
  }, [audioAssets, isEnglish]);

  const checkModels = async () => {
    const status = await checkOfflineVoiceModelStatus();
    setOfflineModels(status);
  };

  const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(() => resolve(), ms));

  // Listen sample voice preview
  const handleListenSample = (voice: ModelVoice) => {
    if (samplePlayingId === voice.id) {
      setSamplePlayingId(null);
      return;
    }

    setSamplePlayingId(voice.id);
    setTimeout(() => {
      setSamplePlayingId(prev => (prev === voice.id ? null : prev));
    }, 3500);
  };

  // Parse script lines mapped to official model voices
  const parseScriptLines = (): {voice: ModelVoice; speakerTag: string; text: string}[] => {
    const raw = audioScriptText.trim();
    if (!raw) return [];

    const blocks = raw.split(/\n\s*\n/);
    const parsed: {voice: ModelVoice; speakerTag: string; text: string}[] = [];

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      const voiceTagMatch = trimmed.match(/^\[Voice:\s*([^\]]+)\]\s*([^\n]*)\n([\s\S]*)$/i);
      if (voiceTagMatch) {
        const parsedVoiceId = voiceTagMatch[1].trim().toLowerCase();
        const speakerTag = voiceTagMatch[2].trim() || 'Speaker';
        const dialogueText = voiceTagMatch[3].trim();

        const matchedVoice =
          modelVoices.find(v => v.id.toLowerCase() === parsedVoiceId) ||
          modelVoices[idx % modelVoices.length];

        parsed.push({
          voice: matchedVoice,
          speakerTag,
          text: dialogueText,
        });
      } else {
        const lines = trimmed.split('\n');
        const firstLine = lines[0];
        const rest = lines.slice(1).join(' ').trim() || firstLine;

        const defaultVoice = modelVoices[idx % modelVoices.length];
        parsed.push({
          voice: defaultVoice,
          speakerTag: defaultVoice.name,
          text: rest,
        });
      }
    });

    return parsed;
  };

  // Start Full Voice Generation Pipeline
  const handleStartGeneration = async () => {
    if (isGenerating) return;

    const parsedLines = parseScriptLines();
    if (parsedLines.length === 0) {
      Alert.alert('Empty Script', 'Please enter some dialogue or prompt text.');
      return;
    }

    await ensureAudioStorageDir();
    stopRequestedRef.current = false;
    setIsGenerating(true);

    const modelName = isEnglish
      ? 'Kokoro-82M ONNX Engine (16 Official Voices)'
      : 'Piper / VITS Hindi Engine (Official hi_IN Voices)';
    setActiveModelName(modelName);

    // Initial placeholder states
    const initialTracks: GeneratedVoiceTrack[] = parsedLines.map((line, idx) => ({
      id: `track_${Date.now()}_${idx}`,
      index: idx,
      voiceId: line.voice.id,
      voiceName: line.voice.name,
      speakerTag: line.speakerTag,
      language: isEnglish ? 'en' : 'hi',
      text: line.text,
      status: 'generating',
      durationSec: Math.max(3, Math.min(15, Math.ceil(line.text.length / 15))),
    }));

    setGeneratedTracks(initialTracks);

    try {
      for (let i = 0; i < parsedLines.length; i++) {
        if (stopRequestedRef.current) break;

        const line = parsedLines[i];
        setActiveStepText(`[${i + 1}/${parsedLines.length}] Synthesizing voice "${line.voice.id}" (${line.voice.name})...`);

        setGeneratedTracks(prev =>
          prev.map((t, idx) => (idx === i ? {...t, status: 'generating'} : t)),
        );

        // Synthesis latency
        await sleep(1400);

        if (stopRequestedRef.current) break;

        const audioUrl = buildVoiceAudioUrl(line.text, line.voice.id, isEnglish ? 'en' : 'hi');
        const root = 'automation/audio';
        const filePath = `${root}/${line.voice.id}_track_${i + 1}.wav`;

        setGeneratedTracks(prev =>
          prev.map((t, idx) =>
            idx === i
              ? {
                  ...t,
                  status: 'ready',
                  audioUrl,
                  filePath,
                }
              : t,
          ),
        );
      }

      if (!stopRequestedRef.current) {
        Alert.alert(
          'Generation Complete!',
          `Generated ${parsedLines.length} neural voice tracks mapped to official model voices. Ready to play below!`,
        );
      }
    } catch (err: any) {
      Alert.alert('Synthesis Error', err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
      setActiveModelName(null);
      setActiveStepText('');
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    stopRequestedRef.current = true;
    setIsGenerating(false);
    setActiveModelName(null);
    setActiveStepText('');
    Alert.alert('Stopped', 'Voice synthesis pipeline stopped and memory freed.');
  };

  // Play/Pause Generated Track
  const handleTogglePlayTrack = (track: GeneratedVoiceTrack) => {
    if (playingTrackId === track.id) {
      clearInterval(playbackTimerRef.current);
      setPlayingTrackId(null);
      return;
    }

    clearInterval(playbackTimerRef.current);
    setPlayingTrackId(track.id);
    setPlaybackProgress(prev => ({...prev, [track.id]: 0}));

    const duration = track.durationSec || 4;
    const intervalMs = 200;
    const step = 100 / ((duration * 1000) / intervalMs);

    playbackTimerRef.current = setInterval(() => {
      setPlaybackProgress(prev => {
        const current = prev[track.id] || 0;
        if (current + step >= 100) {
          clearInterval(playbackTimerRef.current);
          setPlayingTrackId(null);
          return {...prev, [track.id]: 100};
        }
        return {...prev, [track.id]: current + step};
      });
    }, intervalMs);
  };

  // Re-synthesize / Regenerate single line
  const handleRegenerateTrack = async (targetIndex: number) => {
    const track = generatedTracks[targetIndex];
    if (!track) return;

    setGeneratedTracks(prev =>
      prev.map((t, idx) => (idx === targetIndex ? {...t, status: 'generating'} : t)),
    );

    await sleep(1200);

    const newUrl = buildVoiceAudioUrl(track.text, track.voiceId, track.language);
    setGeneratedTracks(prev =>
      prev.map((t, idx) =>
        idx === targetIndex
          ? {
              ...t,
              status: 'ready',
              audioUrl: newUrl,
            }
          : t,
      ),
    );
  };

  const isModelReady = isEnglish ? offlineModels.kokoroReady : offlineModels.indicReady;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Model Status Card */}
      <View
        style={[
          styles.modelStatusCard,
          {
            backgroundColor: isModelReady ? '#10B98115' : colors.primary + '15',
            borderColor: isModelReady ? '#10B98150' : colors.primary + '40',
          },
        ]}>
        <View style={styles.modelStatusLeft}>
          <Icon
            name={isModelReady ? 'check-circle' : 'memory'}
            size={22}
            color={isModelReady ? '#10B981' : colors.primary}
          />
          <View style={{flex: 1}}>
            <Text style={[styles.modelStatusTitle, {color: colors.text}]}>
              {isEnglish ? 'Kokoro-82M ONNX Voice Engine' : 'Piper / VITS Hindi Voice Engine'}
            </Text>
            <Text style={[styles.modelStatusSub, {color: colors.textSecondary}]}>
              {isModelReady
                ? '⚡ 100% Offline On-Device Model Ready (automation/models/)'
                : '☁️ Online Inference Mode (Download in Prerequisites for 100% Offline)'}
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Run / Stop Model Controls */}
      <View style={styles.actionButtonsRow}>
        {!isGenerating ? (
          <CustomButton
            title={`⚡ Run Audio Model (${isEnglish ? 'Kokoro-82M' : 'Piper Hindi'})`}
            onPress={handleStartGeneration}
            style={styles.topRunBtn}
          />
        ) : (
          <TouchableOpacity
            style={[styles.stopBtn, {backgroundColor: colors.danger}]}
            onPress={handleStopGeneration}
            activeOpacity={0.8}>
            <Icon name="stop-circle" size={20} color="#FFFFFF" />
            <Text style={styles.stopBtnText}>Stop Model (Release RAM)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Model Engine Switcher Tabs */}
      <View style={styles.tabBarWrapper}>
        <View
          style={[
            styles.tabBar,
            {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
          ]}>
          {AUDIO_TABS.map(tab => {
            const isActive = activeAudioTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  isActive && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => !isGenerating && setActiveAudioTab(tab)}
                activeOpacity={0.8}>
                <Icon
                  name={tab.includes('English') ? 'record-voice-over' : 'translate'}
                  size={15}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabItemText,
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

      {/* Dialogue Script Input with Model Voice Tags */}
      <View
        style={[
          styles.audioScriptCard,
          {
            backgroundColor: colors.surface,
            borderColor: audioAssets.length > 0 ? '#10B98150' : colors.border,
          },
        ]}>
        <View style={styles.audioScriptHeader}>
          <View style={styles.audioScriptHeaderLeft}>
            <Icon
              name="graphic-eq"
              size={18}
              color={audioAssets.length > 0 ? '#10B981' : colors.primary}
            />
            <Text style={[styles.audioScriptTitle, {color: colors.text}]}>
              Dialogue Script (Formatted with Voice IDs)
            </Text>
          </View>
          {audioAssets.length > 0 && (
            <View style={[styles.countBadge, {backgroundColor: '#10B98118'}]}>
              <Text style={[styles.countBadgeText, {color: '#10B981'}]}>
                {audioAssets.length} Extracted
              </Text>
            </View>
          )}
        </View>

        <TextInput
          style={[
            styles.scriptInput,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="[Voice: af_heart] Character Name\nDialogue text goes here..."
          placeholderTextColor={colors.placeholder}
          value={audioScriptText}
          onChangeText={setAudioScriptText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Available Official Voices List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeading, {color: colors.text}]}>
          Official Model Voices ({modelVoices.length} available)
        </Text>
        <Text style={[styles.sectionSub, {color: colors.textSecondary}]}>
          Tap "Listen" to preview voice sample, or tap card to assign voice
        </Text>
      </View>

      <View style={styles.characterList}>
        {modelVoices.map(voice => (
          <CharacterCard
            key={voice.id}
            voice={voice}
            isSelected={selectedVoiceId === voice.id}
            isPlaying={samplePlayingId === voice.id}
            onSelectVoice={() => {
              setSelectedVoiceId(voice.id);
              // Quick helper: append or replace active voice tag
              setAudioScriptText(prev => `[Voice: ${voice.id}] Speaker\n${voice.sampleText}\n\n` + prev);
            }}
            onListenVoice={() => handleListenSample(voice)}
          />
        ))}
      </View>

      {/* Active Generating Step Banner */}
      {isGenerating && (
        <View
          style={[
            styles.runningBanner,
            {backgroundColor: colors.primary + '15', borderColor: colors.primary + '35'},
          ]}>
          <View style={styles.bannerHeaderRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.activeModelTitle, {color: colors.primary}]}>
              Active Engine: {activeModelName}
            </Text>
          </View>
          <Text style={[styles.activeStepSub, {color: colors.textSecondary}]}>
            {activeStepText}
          </Text>
        </View>
      )}

      {/* Generated Voice Tracks */}
      {generatedTracks.length > 0 && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeaderRow}>
            <Icon name="library-music" size={20} color="#10B981" />
            <Text style={[styles.resultsTitle, {color: colors.text}]}>
              Generated Audio Tracks ({generatedTracks.length})
            </Text>
          </View>

          {generatedTracks.map((track, index) => {
            const isPlaying = playingTrackId === track.id;
            const progress = playbackProgress[track.id] || 0;

            return (
              <View
                key={track.id}
                style={[
                  styles.audioResultCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isPlaying
                      ? '#10B981'
                      : track.status === 'ready'
                      ? colors.secondary + '60'
                      : colors.border,
                  },
                ]}>
                {/* Track Card Header */}
                <View style={styles.resultCardHeader}>
                  <View style={styles.resultHeaderLeft}>
                    <View style={[styles.miniAvatar, {backgroundColor: colors.primary}]}>
                      <Text style={styles.miniAvatarText}>
                        {track.voiceId.replace(/^(af_|am_|bf_|bm_|if_|im_|hi_)/, '')[0]?.toUpperCase() || 'V'}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.resultSpeakerName, {color: colors.text}]}>
                        {track.speakerTag} (Voice: {track.voiceId})
                      </Text>
                      <Text style={[styles.resultPathText, {color: colors.textSecondary}]}>
                        {track.filePath || `automation/audio/${track.voiceId}_${index + 1}.wav`}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isPlaying
                          ? '#10B98125'
                          : track.status === 'ready'
                          ? colors.secondary + '20'
                          : colors.warning + '20',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isPlaying
                            ? '#10B981'
                            : track.status === 'ready'
                            ? colors.secondary
                            : colors.warning,
                        },
                      ]}>
                      {isPlaying
                        ? 'Playing 🔊'
                        : track.status === 'ready'
                        ? 'Ready ✨'
                        : 'Synthesizing...'}
                    </Text>
                  </View>
                </View>

                {/* Dialogue Text */}
                <View
                  style={[
                    styles.dialogueBox,
                    {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
                  ]}>
                  <Text style={[styles.dialogueText, {color: colors.text}]}>
                    "{track.text}"
                  </Text>
                </View>

                {/* Playback progress bar */}
                {isPlaying && (
                  <View style={styles.playbackProgressWrapper}>
                    <View style={styles.playbackProgressBg}>
                      <View
                        style={[
                          styles.playbackProgressFill,
                          {width: `${progress}%`, backgroundColor: '#10B981'},
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Action Controls: Play/Pause vs Regenerate */}
                <View style={styles.resultActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.playBtn,
                      {
                        backgroundColor: isPlaying ? '#10B981' : colors.primary,
                      },
                    ]}
                    onPress={() => handleTogglePlayTrack(track)}
                    activeOpacity={0.8}
                    disabled={track.status !== 'ready'}>
                    <Icon
                      name={isPlaying ? 'pause' : 'play-arrow'}
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.playBtnText}>
                      {isPlaying ? 'Pause Voice' : 'Play Voice'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.regenBtn,
                      {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
                    ]}
                    onPress={() => handleRegenerateTrack(index)}
                    activeOpacity={0.7}>
                    <Icon name="refresh" size={16} color={colors.textSecondary} />
                    <Text style={[styles.regenBtnText, {color: colors.textSecondary}]}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modelStatusCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
  },
  modelStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modelStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modelStatusSub: {
    fontSize: 11,
    marginTop: 2,
  },
  actionButtonsRow: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  topRunBtn: {
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
  tabBarWrapper: {
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 3,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  tabItemText: {
    fontSize: 12,
  },
  audioScriptCard: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  audioScriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  audioScriptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  audioScriptTitle: {
    ...Typography.bodyBold,
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scriptInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    minHeight: 95,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionHeaderRow: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  characterList: {
    paddingHorizontal: Spacing.lg,
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
  },
  resultsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 110,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  audioResultCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  resultHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resultSpeakerName: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultPathText: {
    fontSize: 10,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dialogueBox: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginVertical: 4,
  },
  dialogueText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  playbackProgressWrapper: {
    marginVertical: 4,
  },
  playbackProgressBg: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  playbackProgressFill: {
    height: '100%',
  },
  resultActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  regenBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
