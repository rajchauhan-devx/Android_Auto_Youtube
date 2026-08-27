import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useScripts} from '../context/ScriptContext';
import {Script} from '../types';
import {Colors} from '../theme/colors';
import {Typography} from '../theme/typography';
import {Spacing} from '../theme/spacing';
import ScriptCard from '../components/script/ScriptCard';
import AddScriptModal from '../components/script/AddScriptModal';
import StartScriptModal from '../components/script/StartScriptModal';
import AppModal from '../components/common/AppModal';
import EmptyState from '../components/common/EmptyState';
import Header from '../components/common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

export default function ScriptScreen({navigation}: Props) {
  const {scripts, loading, loadScripts, addScript, deleteScript} = useScripts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const handleStart = (script: Script) => {
    setSelectedScript(script);
    setShowStartModal(true);
  };

  const handleStartWithInstructions = (_instructions: string) => {
    setShowStartModal(false);
    navigation.navigate('Preview');
  };

  const handleViewDescription = () => {
    setShowStartModal(false);
    setShowDescriptionModal(true);
  };

  const handleEditDescription = () => {
    setShowDescriptionModal(false);
    // Edit modal logic here
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Scripts"
        rightAction={{icon: 'add', onPress: () => setShowAddModal(true)}}
      />
      <FlatList
        data={scripts}
        renderItem={({item}) => (
          <ScriptCard
            script={item}
            onStart={() => handleStart(item)}
            onReset={() => deleteScript(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="article"
              title="No Scripts"
              message="Add a script to get started"
            />
          ) : undefined
        }
      />

      <AddScriptModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addScript}
      />

      <StartScriptModal
        visible={showStartModal}
        script={selectedScript}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartWithInstructions}
        onViewDescription={handleViewDescription}
      />

      <AppModal
        visible={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}>
        <Text style={styles.descTitle}>{selectedScript?.title}</Text>
        <Text style={styles.descContent}>
          {selectedScript?.fileContent || selectedScript?.description || 'No description available'}
        </Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={handleEditDescription}>
          <Icon name="edit" size={18} color={Colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingVertical: Spacing.md,
    paddingBottom: 100,
  },
  descTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  descContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  editBtnText: {
    ...Typography.buttonSmall,
    color: Colors.primary,
  },
});
