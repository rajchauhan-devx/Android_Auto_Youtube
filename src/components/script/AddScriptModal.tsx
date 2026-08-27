import React, {useState} from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {Spacing} from '../../theme/spacing';
import AppModal from '../common/AppModal';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';

interface AddScriptModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, fileName?: string, fileContent?: string) => void;
}

export default function AddScriptModal({
  visible,
  onClose,
  onAdd,
}: AddScriptModalProps) {
  const {colors} = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <Text style={[styles.modalTitle, {color: colors.text}]}>Add Script</Text>
      <CustomInput
        label="Script Title"
        placeholder="Enter script title"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />
      <CustomInput
        label="Description / File Content"
        placeholder="Enter description or paste file content (.md, .txt)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        style={styles.textArea}
      />
      <CustomButton
        title="Add Script"
        onPress={handleAdd}
        disabled={!title.trim()}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
