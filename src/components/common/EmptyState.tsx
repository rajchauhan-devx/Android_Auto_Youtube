import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EmptyStateProps {
  icon: string;
  title: string;
  message?: string;
}

export default function EmptyState({icon, title, message}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={56} color={Colors.textLight} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
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
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
