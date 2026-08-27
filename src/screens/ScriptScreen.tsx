import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useScripts} from '../context/ScriptContext';
import {useProfile} from '../context/ProfileContext';
import {useTheme} from '../context/ThemeContext';
import {Script} from '../types';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import ScriptCard from '../components/script/ScriptCard';
import AddScriptModal from '../components/script/AddScriptModal';
import StartScriptModal from '../components/script/StartScriptModal';
import AppModal from '../components/common/AppModal';
import CustomButton from '../components/common/CustomButton';
import EmptyState from '../components/common/EmptyState';
import Header from '../components/common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

export default function ScriptScreen({navigation}: Props) {
  const {scripts, loading, loadScripts, addScript, updateScript, deleteScript} =
    useScripts();
  const {activeProfile} = useProfile();
  const {colors} = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadScripts();
    }, [loadScripts]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadScripts();
    setRefreshing(false);
  };

  const handleStart = (script: Script) => {
    setSelectedScript(script);
    setShowStartModal(true);
  };

  const handleDelete = (script: Script) => {
    Alert.alert(
      'Delete Script',
      `Are you sure you want to delete "${script.title}" from phone storage?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteScript(script.id),
        },
      ],
    );
  };

  const handleStartWithInstructions = (
    instructions: string,
    topic?: string,
  ) => {
    setShowStartModal(false);
    if (!selectedScript) {
      navigation.navigate('Preview');
      return;
    }

    const scriptBody =
      selectedScript.fileContent ||
      selectedScript.description ||
      selectedScript.title;

    const parts: string[] = [];

    if (topic && topic.trim()) {
      parts.push(`Topic: ${topic.trim()}`);
    }

    if (instructions && instructions.trim()) {
      parts.push(`Instructions: ${instructions.trim()}`);
    }

    parts.push(scriptBody);

    const fullPrompt = parts.join('\n\n');

    navigation.navigate('Preview', {
      initialPrompt: fullPrompt,
      scriptTitle: selectedScript.title,
      autoStart: true,
    });
  };

  const handleViewDescription = () => {
    setShowStartModal(false);
    setShowDescriptionModal(true);
  };

  const handleOpenEdit = () => {
    if (!selectedScript) return;
    setEditTitle(selectedScript.title);
    setEditDesc(selectedScript.description || '');
    setEditContent(
      selectedScript.fileContent || selectedScript.description || '',
    );
    setShowDescriptionModal(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedScript || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateScript(
        selectedScript.id,
        editTitle.trim(),
        editDesc.trim(),
        editContent,
      );
      if (updated) {
        setSelectedScript(updated);
      }
      setShowEditModal(false);
      Alert.alert('Saved', 'Script updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update script');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Scripts"
        subtitle={
          activeProfile
            ? `📁 automation/${activeProfile.name}/scripts/`
            : undefined
        }
        rightAction={{icon: 'add', onPress: () => setShowAddModal(true)}}
      />

      {activeProfile && (
        <View
          style={[
            styles.storageBanner,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Icon name="folder" size={16} color={colors.primary} />
          <Text
            style={[styles.storageBannerText, {color: colors.textSecondary}]}
            numberOfLines={1}>
            Saved in: automation/{activeProfile.name}/scripts/
          </Text>

          <View style={styles.bannerActions}>
            <View
              style={[
                styles.countBadge,
                {backgroundColor: colors.primary + '15'},
              ]}>
              <Text style={[styles.countBadgeText, {color: colors.primary}]}>
                {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'}
              </Text>
            </View>

            {/* Direct Reload Button */}
            <TouchableOpacity
              style={[
                styles.reloadBtn,
                {backgroundColor: colors.primary + '15', borderColor: colors.primary + '30'},
              ]}
              onPress={handleRefresh}
              disabled={refreshing || loading}
              activeOpacity={0.7}>
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icon name="refresh" size={14} color={colors.primary} />
                  <Text style={[styles.reloadBtnText, {color: colors.primary}]}>
                    Reload
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={scripts}
        renderItem={({item}) => (
          <ScriptCard
            script={item}
            onStart={() => handleStart(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="article"
              title="No Scripts Yet"
              message={`Add a script or tap Reload to scan automation/${
                activeProfile?.name || 'profile'
              }/scripts/`}
            />
          ) : undefined
        }
      />

      {/* Add Script Modal */}
      <AddScriptModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addScript}
      />

      {/* Start Script Modal */}
      <StartScriptModal
        visible={showStartModal}
        script={selectedScript}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartWithInstructions}
        onViewDescription={handleViewDescription}
      />

      {/* View Script & Description Modal with Large Scrollable View */}
      <AppModal
        visible={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        contentStyle={styles.viewModalContent}>
        <View style={styles.viewModalHeader}>
          <Icon name="description" size={24} color={colors.primary} />
          <Text
            style={[styles.descTitle, {color: colors.text}]}
            numberOfLines={2}>
            {selectedScript?.title}
          </Text>
        </View>

        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={true}
          keyboardShouldPersistTaps="handled">
          {selectedScript?.description ? (
            <View style={styles.sectionBlock}>
              <Text
                style={[styles.sectionHeading, {color: colors.textSecondary}]}>
                DESCRIPTION / SUMMARY
              </Text>
              <Text
                style={[styles.descText, {color: colors.text}]}
                selectable={true}>
                {selectedScript.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.sectionBlock}>
            <Text
              style={[styles.sectionHeading, {color: colors.textSecondary}]}>
              FULL SCRIPT CONTENT
            </Text>
            <Text
              style={[styles.descContent, {color: colors.text}]}
              selectable={true}>
              {selectedScript?.fileContent ||
                selectedScript?.description ||
                'No content available'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.viewModalActions}>
          <TouchableOpacity
            style={[
              styles.editBtn,
              {backgroundColor: colors.primary},
            ]}
            onPress={handleOpenEdit}
            activeOpacity={0.8}>
            <Icon name="edit" size={18} color="#FFFFFF" />
            <Text style={styles.editBtnText}>
              Edit Script
            </Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      {/* Edit Script Modal */}
      <AppModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        contentStyle={styles.editModalContent}>
        <Text style={[styles.editModalTitle, {color: colors.text}]}>
          Edit Script
        </Text>

        <ScrollView
          style={styles.editScrollView}
          contentContainerStyle={styles.editScrollContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={[styles.inputLabel, {color: colors.text}]}>Title</Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Script title"
            placeholderTextColor={colors.placeholder}
            value={editTitle}
            onChangeText={setEditTitle}
          />

          {/* Description */}
          <Text style={[styles.inputLabel, {color: colors.text}]}>
            Description / Summary
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Short description"
            placeholderTextColor={colors.placeholder}
            value={editDesc}
            onChangeText={setEditDesc}
          />

          {/* Content */}
          <Text style={[styles.inputLabel, {color: colors.text}]}>
            Script Content
          </Text>
          <TextInput
            style={[
              styles.textAreaInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Write or edit script text..."
            placeholderTextColor={colors.placeholder}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.editActionRow}>
            <CustomButton
              title={savingEdit ? 'Saving...' : 'Save Changes'}
              onPress={handleSaveEdit}
              loading={savingEdit}
              disabled={!editTitle.trim()}
            />
          </View>
        </ScrollView>
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  storageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  storageBannerText: {
    fontSize: 11,
    flex: 1,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  reloadBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    paddingVertical: Spacing.xs,
    paddingBottom: 100,
  },
  viewModalContent: {
    height: '86%',
    maxHeight: '88%',
    paddingBottom: Spacing.lg,
  },
  viewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingRight: Spacing.xxl,
  },
  descTitle: {
    ...Typography.h3,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
    marginVertical: Spacing.xs,
  },
  modalScrollContent: {
    paddingVertical: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descText: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  descContent: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  viewModalActions: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editModalContent: {
    height: '88%',
    maxHeight: '90%',
  },
  editModalTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  editScrollView: {
    flex: 1,
  },
  editScrollContent: {
    paddingBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.captionBold,
    fontSize: 13,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 14,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 220,
    fontSize: 13,
    lineHeight: 18,
  },
  editActionRow: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
});
