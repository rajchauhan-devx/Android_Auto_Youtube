import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
}

export default function EmptyState({icon, title, message}: EmptyStateProps) {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} size={56} color={colors.textLight} />
      <Text style={[styles.title, {color: colors.textSecondary}]}>{title}</Text>
      {message && (
        <Text style={[styles.message, {color: colors.textLight}]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.huge,
  },
  title: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
