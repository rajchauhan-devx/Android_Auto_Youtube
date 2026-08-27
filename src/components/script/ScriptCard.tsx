import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {Script} from '../../types';
import CustomButton from '../common/CustomButton';

interface ScriptCardProps {
  script: Script;
  onStart: () => void;
  onReset: () => void;
}

export default function ScriptCard({script, onStart, onReset}: ScriptCardProps) {
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
          styles.rectanglePlaceholder,
          {backgroundColor: colors.background},
        ]}>
        <Text style={styles.placeholderIcon}>📄</Text>
      </View>
      <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
        {script.title}
      </Text>
      {script.description ? (
        <Text
          style={[styles.description, {color: colors.textSecondary}]}
          numberOfLines={2}>
          {script.description}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <CustomButton
          title="Reset"
          variant="outline"
          size="sm"
          onPress={onReset}
          style={styles.resetBtn}
        />
        <CustomButton
          title="Start"
          variant="primary"
          size="sm"
          onPress={onStart}
          style={styles.startBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  rectanglePlaceholder: {
    height: 120,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  placeholderIcon: {
    fontSize: 36,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resetBtn: {
    flex: 1,
  },
  startBtn: {
    flex: 1,
  },
});
