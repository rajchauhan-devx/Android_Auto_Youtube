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
  onAdd: (
    title: string,
    description: string,
    fileName?: string,
    fileContent?: string,
  ) => Promise<any> | void;
}

export default function AddScriptModal({
  visible,
  onClose,
  onAdd,
}: AddScriptModalProps) {
  const {colors} = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onAdd(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.warn('Error saving script:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onClose={() => {
        if (!saving) onClose();
      }}>
      <Text style={[styles.modalTitle, {color: colors.text}]}>Add Script</Text>
      <CustomInput
        label="Script Title"
        placeholder="Enter script title (e.g. Episode 1)"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />
      <CustomInput
        label="Description / File Content"
        placeholder="Enter description or paste script content (.txt, .md)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        style={styles.textArea}
      />
      <CustomButton
        title={saving ? 'Saving to Phone Storage...' : 'Save Script'}
        onPress={handleAdd}
        disabled={!title.trim() || saving}
        loading={saving}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    fontWeight: '700',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
