import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ModelVoice} from '../../utils/audioPlayer';

interface CharacterCardProps {
  voice: ModelVoice;
  isSelected: boolean;
  isPlaying: boolean;
  onSelectVoice: () => void;
  onListenVoice: () => void;
}

export default function CharacterCard({
  voice,
  isSelected,
  isPlaying,
  onSelectVoice,
  onListenVoice,
}: CharacterCardProps) {
  const {colors} = useTheme();

  const isFemale = voice.gender === 'female';
  const themeColor = isFemale ? '#EC4899' : '#3B82F6';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? colors.primary + '12' : colors.surface,
          borderColor: isSelected
            ? colors.primary
            : isPlaying
            ? '#10B981'
            : colors.border,
        },
      ]}
      onPress={onSelectVoice}
      activeOpacity={0.85}>
      <View style={styles.cardHeaderRow}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: themeColor}]}>
          <Text style={styles.initials}>
            {voice.id.replace(/^(af_|am_|bf_|bm_|if_|im_|hi_)/, '')[0]?.toUpperCase() || 'V'}
          </Text>
        </View>

        {/* Voice Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
              {voice.name}
            </Text>
            <View
              style={[
                styles.badge,
                {backgroundColor: themeColor + '20'},
              ]}>
              <Text style={[styles.badgeText, {color: themeColor}]}>
                {voice.gender === 'female' ? 'Female' : 'Male'}
              </Text>
            </View>
          </View>

          <View style={styles.subInfoRow}>
            <Text style={[styles.accentText, {color: colors.textSecondary}]}>
              📍 {voice.accent}
            </Text>
            <Text style={[styles.gradeText, {color: colors.secondary}]}>
              ⭐ {voice.grade}
            </Text>
          </View>
        </View>

        {/* Listen Sample Button */}
        <TouchableOpacity
          style={[
            styles.listenBtn,
            {
              backgroundColor: isPlaying
                ? '#10B981'
                : isSelected
                ? colors.primary
                : colors.surfaceAlt,
              borderColor: isPlaying ? '#10B981' : colors.border,
            },
          ]}
          onPress={onListenVoice}
          activeOpacity={0.7}>
          {isPlaying ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.listenBtnText, {color: '#FFFFFF'}]}>Playing</Text>
            </>
          ) : (
            <>
              <Icon
                name="volume-up"
                size={16}
                color={isSelected ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  styles.listenBtnText,
                  {color: isSelected ? '#FFFFFF' : colors.text},
                ]}>
                Listen
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Traits Description & Sample Text */}
      <View
        style={[
          styles.sampleBox,
          {backgroundColor: colors.surfaceAlt, borderColor: colors.border},
        ]}>
        <Text style={[styles.traitsText, {color: colors.textSecondary}]}>
          ✨ {voice.traits}
        </Text>
        <Text
          style={[styles.sampleQuote, {color: colors.text}]}
          numberOfLines={2}>
          🗣 "{voice.sampleText}"
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  initials: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...Typography.bodyBold,
    fontSize: 13,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  accentText: {
    fontSize: 10,
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
    minWidth: 76,
    justifyContent: 'center',
  },
  listenBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sampleBox: {
    marginTop: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  traitsText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 2,
  },
  sampleQuote: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '600',
  },
});
