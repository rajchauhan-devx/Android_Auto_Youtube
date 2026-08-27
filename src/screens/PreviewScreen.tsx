import React, {useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChatMessage as ChatMessageType} from '../types';
import {useTheme} from '../context/ThemeContext';
import {Typography} from '../theme/typography';
import {Spacing} from '../theme/spacing';
import ChatBubble from '../components/preview/ChatBubble';
import ChatInput from '../components/preview/ChatInput';
import Header from '../components/common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

export default function PreviewScreen(_props: Props) {
  const {colors} = useTheme();
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m ready to help you generate your video content. What would you like to create?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSend = (content: string) => {
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand. Let me help you with that. I\'ll process your request and generate the appropriate content.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Preview"
        rightAction={{
          icon: 'download',
          onPress: () => {},
        }}
      />
      <TouchableOpacity
        style={[
          styles.extractBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primary,
          },
        ]}
        activeOpacity={0.7}>
        <Icon name="perm-media" size={18} color={colors.primary} />
        <Text style={[styles.extractBtnText, {color: colors.primary}]}>
          Extract Assets
        </Text>
      </TouchableOpacity>
      <FlatList
        data={messages}
        renderItem={({item}) => <ChatBubble message={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />
      <ChatInput onSend={handleSend} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  extractBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  extractBtnText: {
    ...Typography.captionBold,
  },
  messageList: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
});
