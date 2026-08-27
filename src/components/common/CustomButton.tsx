import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: CustomButtonProps) {
  const {colors} = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {backgroundColor: colors.secondary};
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'danger':
        return {backgroundColor: colors.danger};
      case 'primary':
      default:
        return {backgroundColor: colors.primary};
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return {color: colors.primary};
      default:
        return {color: '#FFFFFF'};
    }
  };

  const buttonStyles = [
    styles.base,
    getVariantStyle(),
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    getTextStyle(),
    styles[`textSize_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  size_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...Typography.button,
  },
  textSize_sm: {
    ...Typography.buttonSmall,
  },
  textSize_md: {
    ...Typography.button,
  },
  textSize_lg: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
});
