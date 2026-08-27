import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function CustomInput({
  label,
  error,
  style,
  ...props
}: CustomInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={Colors.placeholder}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    ...Typography.small,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
