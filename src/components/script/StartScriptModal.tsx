import React, {useState} from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Colors} from '../../theme/colors';
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
  onStart: (instructions: string) => void;
  onViewDescription: () => void;
}

export default function StartScriptModal({
  visible,
  script,
  onClose,
  onStart,
  onViewDescription,
}: StartScriptModalProps) {
  const [instructions, setInstructions] = useState('');

  if (!script) return null;

  const handleStart = () => {
    onStart(instructions.trim());
    setInstructions('');
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{script.title}</Text>

        <TouchableOpacity
          style={styles.viewFileBtn}
          onPress={onViewDescription}
          activeOpacity={0.7}>
          <Icon name="description" size={20} color={Colors.primary} />
          <Text style={styles.viewFileText}>View Description / File</Text>
          <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <CustomInput
          label="Instructions for AI"
          placeholder="Enter instructions for the AI..."
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
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  viewFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  viewFileText: {
    ...Typography.body,
    color: Colors.primary,
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
