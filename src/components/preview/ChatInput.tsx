import React, {useState} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({onSend}: ChatInputProps) {
  const {colors} = useTheme();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Type a message..."
        placeholderTextColor={colors.placeholder}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={2000}
      />
      <TouchableOpacity
        style={[
          styles.sendBtn,
          {
            backgroundColor: message.trim()
              ? colors.primary
              : colors.border,
          },
        ]}
        onPress={handleSend}
        disabled={!message.trim()}
        activeOpacity={0.7}>
        <Icon
          name="send"
          size={20}
          color={message.trim() ? colors.white : colors.textLight}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
