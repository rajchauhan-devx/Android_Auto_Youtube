import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../theme/colors';
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
  return (
    <View style={styles.card}>
      <View style={styles.thumbnail}>
        <Icon
          name={type === 'image' ? 'image' : 'audiotrack'}
          size={28}
          color={Colors.textLight}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.type}>{type === 'image' ? 'Image' : 'Audio'}</Text>
      </View>
      <View style={styles.durationControl}>
        <Text style={styles.durationLabel}>Duration</Text>
        <View style={styles.durationRow}>
          <View
            style={styles.durationBtn}
            onTouchEnd={() => onDurationChange(Math.max(0.5, duration - 0.5))}>
            <Icon name="remove" size={16} color={Colors.text} />
          </View>
          <Text style={styles.durationValue}>{duration.toFixed(1)}s</Text>
          <View
            style={styles.durationBtn}
            onTouchEnd={() => onDurationChange(duration + 0.5)}>
            <Icon name="add" size={16} color={Colors.text} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  type: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  durationControl: {
    alignItems: 'center',
  },
  durationLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationValue: {
    ...Typography.captionBold,
    color: Colors.text,
    minWidth: 36,
    textAlign: 'center',
  },
});
