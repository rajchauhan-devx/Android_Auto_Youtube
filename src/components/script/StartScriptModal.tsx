import React, {useState} from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {Spacing} from '../../theme/spacing';
import {Script} from '../../types';
import AppModal from '../common/AppModal';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StartScriptModalProps {
  visible: boolean;
  script: Script | null;
  onClose: () => void;
  onStart: (instructions: string, topic?: string) => void;
  onViewDescription: () => void;
}

export default function StartScriptModal({
  visible,
  script,
  onClose,
  onStart,
  onViewDescription,
}: StartScriptModalProps) {
  const {colors} = useTheme();
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!script) return null;

  const handleStart = () => {
    onStart(instructions.trim(), topic.trim());
    setTopic('');
    setInstructions('');
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, {color: colors.text}]}>{script.title}</Text>

        <TouchableOpacity
          style={[styles.viewFileBtn, {backgroundColor: colors.background}]}
          onPress={onViewDescription}
          activeOpacity={0.7}>
          <Icon name="description" size={20} color={colors.primary} />
          <Text style={[styles.viewFileText, {color: colors.primary}]}>
            View Description / File
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Topic Input */}
        <CustomInput
          label="Topic"
          placeholder="e.g. Space Exploration, Anime, Tech..."
          value={topic}
          onChangeText={setTopic}
        />

        {/* Instructions for AI Input */}
        <CustomInput
          label="Instructions for AI"
          placeholder="Enter custom instructions for the AI..."
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <CustomButton title="Start" onPress={handleStart} />
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontWeight: '700',
  },
  viewFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  viewFileText: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
