import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../theme/colors';
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
  return (
    <View style={styles.card}>
      <View style={styles.rectanglePlaceholder}>
        <Text style={styles.placeholderIcon}>📄</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {script.title}
      </Text>
      {script.description ? (
        <Text style={styles.description} numberOfLines={2}>
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rectanglePlaceholder: {
    height: 120,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
