import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {ChatMessage as ChatMessageType} from '../../types';

interface ChatBubbleProps {
  message: ChatMessageType;
}

export default function ChatBubble({message}: ChatBubbleProps) {
  const {colors} = useTheme();
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
          isUser
            ? [styles.userBubble, {backgroundColor: colors.primary}]
            : [
                styles.assistantBubble,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ],
        ]}>
        <Text
          style={[
            styles.text,
            isUser
              ? [styles.userText, {color: colors.white}]
              : [styles.assistantText, {color: colors.text}],
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
    borderBottomRightRadius: Spacing.xs,
  },
  assistantBubble: {
    borderBottomLeftRadius: Spacing.xs,
    borderWidth: 1,
  },
  text: {
    ...Typography.body,
    lineHeight: 22,
  },
  userText: {},
  assistantText: {},
});
