import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ReviewCardProps {
  title: string;
  type: 'image' | 'audio';
  duration: number;
  onDurationChange: (value: number) => void;
}

export default function ReviewCard({
  title,
  type,
  duration,
  onDurationChange,
}: ReviewCardProps) {
  const {colors} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View
        style={[
          styles.thumbnail,
          {backgroundColor: colors.background},
        ]}>
        <Icon
          name={type === 'image' ? 'image' : 'audiotrack'}
          size={28}
          color={colors.textLight}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.type, {color: colors.textSecondary}]}>
          {type === 'image' ? 'Image' : 'Audio'}
        </Text>
      </View>
      <View style={styles.durationControl}>
        <Text style={[styles.durationLabel, {color: colors.textSecondary}]}>
          Duration
        </Text>
        <View style={styles.durationRow}>
          <TouchableOpacity
            style={[
              styles.durationBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onDurationChange(Math.max(0.5, duration - 0.5))}>
            <Icon name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.durationValue, {color: colors.text}]}>
            {duration.toFixed(1)}s
          </Text>
          <TouchableOpacity
            style={[
              styles.durationBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onDurationChange(duration + 0.5)}>
            <Icon name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.bodyBold,
  },
  type: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  durationControl: {
    alignItems: 'center',
  },
  durationLabel: {
    ...Typography.small,
    marginBottom: Spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  durationBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  durationValue: {
    ...Typography.captionBold,
    minWidth: 36,
    textAlign: 'center',
  },
});
