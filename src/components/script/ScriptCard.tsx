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
  onDelete?: () => void;
  onReset?: () => void;
}

export default function ScriptCard({
  script,
  onStart,
  onDelete,
  onReset,
}: ScriptCardProps) {
  const {colors} = useTheme();
  const handleDelete = onDelete || onReset || (() => {});

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      {/* Title at top */}
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>
          {script.title}
        </Text>
        {script.description ? (
          <Text
            style={[styles.description, {color: colors.textSecondary}]}
            numberOfLines={2}>
            {script.description}
          </Text>
        ) : null}
      </View>

      {/* Two buttons in the same row below */}
      <View style={styles.buttonRow}>
        <CustomButton
          title="Delete"
          variant="danger"
          size="sm"
          onPress={handleDelete}
          style={styles.btn}
        />
        <CustomButton
          title="Start"
          variant="primary"
          size="sm"
          onPress={onStart}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    padding: Spacing.lg,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    ...Typography.caption,
    marginTop: 4,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  btn: {
    flex: 1,
  },
});
