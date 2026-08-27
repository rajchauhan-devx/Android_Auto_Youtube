import React, {useState} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../theme/colors';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({onSend}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        placeholderTextColor={Colors.placeholder}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={2000}
      />
      <TouchableOpacity
        style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!message.trim()}
        activeOpacity={0.7}>
        <Icon
          name="send"
          size={20}
          color={message.trim() ? Colors.white : Colors.textLight}
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
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    backgroundColor: Colors.background,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
});
