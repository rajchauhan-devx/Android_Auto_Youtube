import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useProfile} from '../context/ProfileContext';
import {Profile} from '../types';
import {Colors} from '../theme/colors';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import AppModal from '../components/common/AppModal';
import CustomInput from '../components/common/CustomInput';
import CustomButton from '../components/common/CustomButton';
import EmptyState from '../components/common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PROFILE_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

interface Props {
  navigation: any;
}

export default function ProfileScreen({navigation}: Props) {
  const {profiles, loading, loadProfiles, addProfile, selectProfile, deleteProfile} =
    useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    await addProfile(newProfileName.trim());
    setNewProfileName('');
    setShowAddModal(false);
  };

  const handleSelectProfile = (profile: Profile) => {
    selectProfile(profile);
    navigation.navigate('MainTabs');
  };

  const handleDeleteProfile = (profile: Profile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"? This will remove all associated data.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProfile(profile.id),
        },
      ],
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderProfileCard = ({item, index}: {item: Profile; index: number}) => {
    const color = PROFILE_COLORS[index % PROFILE_COLORS.length];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectProfile(item)}
        onLongPress={() => handleDeleteProfile(item)}
        activeOpacity={0.7}>
        <View style={[styles.avatar, {backgroundColor: color}]}>
          <Text style={styles.initials}>{getInitials(item.name)}</Text>
        </View>
        <Text style={styles.profileName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profiles</Text>
        <Text style={styles.subtitle}>Select or create a profile</Text>
      </View>
      <FlatList
        data={profiles}
        renderItem={renderProfileCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="person-add"
              title="No Profiles"
              message="Create a profile to get started"
            />
          ) : undefined
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}>
        <Icon name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      <AppModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}>
        <Text style={styles.modalTitle}>New Profile</Text>
        <CustomInput
          label="Profile Name"
          placeholder="Enter profile name"
          value={newProfileName}
          onChangeText={setNewProfileName}
          autoFocus
        />
        <CustomButton
          title="Create Profile"
          onPress={handleAddProfile}
          disabled={!newProfileName.trim()}
        />
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    margin: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '47%',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  initials: {
    ...Typography.h2,
    color: Colors.white,
  },
  profileName: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
});
