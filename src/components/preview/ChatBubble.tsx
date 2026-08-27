import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {ChatMessage as ChatMessageType} from '../../types';

interface ChatBubbleProps {
  message: ChatMessageType;
}

export default function ChatBubble({message}: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
          ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Spacing.xs,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    ...Typography.body,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.text,
  },
});
