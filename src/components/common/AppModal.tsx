import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showClose?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export default function AppModal({
  visible,
  onClose,
  children,
  showClose = true,
  contentStyle,
}: AppModalProps) {
  const {colors} = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        {/* Backdrop (tap outside to close) */}
        <TouchableOpacity
          style={[styles.backdrop, {backgroundColor: colors.overlay}]}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content Box - Touch events pass directly to child ScrollViews */}
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            contentStyle,
          ]}>
          {showClose && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    width: '96%',
    maxWidth: 480,
    maxHeight: '90%',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
    zIndex: 10,
  },
});
