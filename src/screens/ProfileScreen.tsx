import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useProfile} from '../context/ProfileContext';
import {useTheme, ThemeMode} from '../context/ThemeContext';
import {useApiConfig} from '../context/ApiConfigContext';
import {Profile} from '../types';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import Header from '../components/common/Header';
import AppModal from '../components/common/AppModal';
import CustomInput from '../components/common/CustomInput';
import CustomButton from '../components/common/CustomButton';
import EmptyState from '../components/common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AVATAR_COLORS = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

interface Props {
  navigation: any;
}

export default function ProfileScreen({navigation}: Props) {
  const {
    profiles,
    activeProfile,
    loading,
    loadProfiles,
    addProfile,
    updateProfile,
    selectProfile,
    deleteProfile,
  } = useProfile();

  const {themeMode, setThemeMode, colors, systemColorScheme} = useTheme();
  const {hasApiKey, model} = useApiConfig();

  // Profile modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    const created = await addProfile(newProfileName.trim());
    await selectProfile(created);
    setNewProfileName('');
    setShowAddModal(false);
  };

  const handleStartEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProfile || !editName.trim()) return;
    await updateProfile(editingProfile.id, editName.trim());
    setShowEditModal(false);
    setEditingProfile(null);
  };

  const handleSelectProfile = async (profile: Profile) => {
    await selectProfile(profile);
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
          onPress: async () => {
            await deleteProfile(profile.id);
          },
        },
      ],
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      mode: 'light',
      label: 'Light Mode (White)',
      description: 'Bright and clean appearance',
      icon: 'light-mode',
    },
    {
      mode: 'dark',
      label: 'Dark Mode',
      description: 'Sleek dark theme, easy on the eyes',
      icon: 'dark-mode',
    },
    {
      mode: 'system',
      label: 'Match Android Theme',
      description: `Follows device settings (Current: ${
        systemColorScheme === 'dark' ? 'Dark' : 'Light'
      })`,
      icon: 'settings-suggest',
    },
  ];

  const canGoBack = navigation && navigation.canGoBack && navigation.canGoBack();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Profile & Settings"
        onBack={canGoBack ? () => navigation.goBack() : undefined}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Active Profile Section */}
        {activeProfile ? (
          <View
            style={[
              styles.activeCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}>
            <View style={styles.activeCardHeader}>
              <View
                style={[
                  styles.avatarLarge,
                  {backgroundColor: getAvatarColor(activeProfile.name)},
                ]}>
                <Text style={styles.avatarLargeText}>
                  {getInitials(activeProfile.name)}
                </Text>
              </View>
              <View style={styles.activeInfo}>
                <View style={styles.activeBadgeRow}>
                  <View
                    style={[
                      styles.activeBadge,
                      {backgroundColor: colors.secondary + '20'},
                    ]}>
                    <Icon name="check-circle" size={14} color={colors.secondary} />
                    <Text
                      style={[styles.activeBadgeText, {color: colors.secondary}]}>
                      Active Profile
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.activeName, {color: colors.text}]}
                  numberOfLines={1}>
                  {activeProfile.name}
                </Text>
                <Text
                  style={[styles.activeDate, {color: colors.textSecondary}]}>
                  Created:{' '}
                  {new Date(activeProfile.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.activeActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleStartEdit(activeProfile)}
                activeOpacity={0.7}>
                <Icon name="edit" size={16} color={colors.primary} />
                <Text style={[styles.actionButtonText, {color: colors.primary}]}>
                  Edit Name
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}>
                <Icon name="person-add" size={16} color={colors.secondary} />
                <Text
                  style={[
                    styles.actionButtonText,
                    {color: colors.secondary},
                  ]}>
                  New Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* PREREQUISITES NAVIGATION CARD */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.prereqNavCard,
              {
                backgroundColor: colors.surface,
                borderColor: hasApiKey ? colors.secondary + '40' : colors.border,
              },
            ]}
            onPress={() => navigation.navigate('Prerequisites')}
            activeOpacity={0.8}>
            <View style={styles.prereqNavLeft}>
              <View
                style={[
                  styles.prereqIconBox,
                  {backgroundColor: colors.primary + '15'},
                ]}><Icon name="vpn-key" size={24} color={colors.primary} />
              </View>
              <View style={styles.prereqNavText}>
                <View style={styles.prereqTitleRow}>
                  <Text style={[styles.prereqNavTitle, {color: colors.text}]}>
                    Prerequisites
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: hasApiKey
                          ? colors.secondary + '20'
                          : colors.warning + '20',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        {color: hasApiKey ? colors.secondary : colors.warning},
                      ]}>
                      {hasApiKey ? 'Configured' : 'Setup Required'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.prereqNavDesc, {color: colors.textSecondary}]}>
                  OpenCode API Key & AI Model: {model}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Theme / Appearance Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Icon name="palette" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Theme & Appearance
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, {color: colors.textSecondary}]}>
              Choose light, dark, or match Android system theme
            </Text>
          </View>

          <View style={styles.themeOptionsContainer}>
            {themeOptions.map(opt => {
              const isSelected = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[
                    styles.themeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setThemeMode(opt.mode)}
                  activeOpacity={0.8}>
                  <View style={styles.themeCardLeft}>
                    <View
                      style={[
                        styles.themeIconBox,
                        {
                          backgroundColor:
                            opt.mode === 'light'
                              ? '#FEF3C7'
                              : opt.mode === 'dark'
                              ? '#312E81'
                              : '#CCFBF1',
                        },
                      ]}>
                      <Icon
                        name={opt.icon}
                        size={22}
                        color={
                          opt.mode === 'light'
                            ? '#D97706'
                            : opt.mode === 'dark'
                            ? '#818CF8'
                            : '#0D9488'
                        }
                      />
                    </View>
                    <View style={styles.themeCardText}>
                      <Text
                        style={[
                          styles.themeCardTitle,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}>
                        {opt.label}
                      </Text>
                      <Text
                        style={[
                          styles.themeCardDesc,
                          {color: colors.textSecondary},
                        ]}>
                        {opt.description}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        backgroundColor: isSelected
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}>
                    {isSelected && (
                      <Icon name="check" size={14} color={colors.white} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Change / Switch Profiles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Icon name="switch-account" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Switch Profile ({profiles.length})
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addInlineBtn, {backgroundColor: colors.primary}]}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}>
              <Icon name="add" size={18} color={colors.white} />
              <Text style={styles.addInlineBtnText}>Add Profile</Text>
            </TouchableOpacity>
          </View>

          {profiles.length === 0 && !loading ? (
            <EmptyState
              icon="person-add"
              title="No Profiles Found"
              message="Create a profile to begin generating content"
            />
          ) : (
            <View style={styles.profileList}>
              {profiles.map(item => {
                const isActive = activeProfile?.id === item.id;
                const avatarBg = getAvatarColor(item.name);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.profileRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                        borderWidth: isActive ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleSelectProfile(item)}
                    activeOpacity={0.7}>
                    <View
                      style={[styles.avatarMedium, {backgroundColor: avatarBg}]}>
                      <Text style={styles.avatarMediumText}>
                        {getInitials(item.name)}
                      </Text>
                    </View>

                    <View style={styles.profileRowInfo}>
                      <View style={styles.profileRowTitleRow}>
                        <Text
                          style={[
                            styles.profileRowName,
                            {
                              color: colors.text,
                              fontWeight: isActive ? '700' : '600',
                            },
                          ]}
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                        {isActive && (
                          <View
                            style={[
                              styles.activeChip,
                              {backgroundColor: colors.secondary + '25'},
                            ]}>
                            <Text
                              style={[
                                styles.activeChipText,
                                {color: colors.secondary},
                              ]}>
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.profileRowDate,
                          {color: colors.textSecondary},
                        ]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.profileRowActions}>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleStartEdit(item)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Icon name="edit" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleDeleteProfile(item)}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                        <Icon name="delete-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Profile Modal */}
      <AppModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}>
        <Text style={[styles.modalTitle, {color: colors.text}]}>
          Create New Profile
        </Text>
        <CustomInput
          label="Profile Name"
          placeholder="e.g. Tech Channel"
          value={newProfileName}
          onChangeText={setNewProfileName}
          autoFocus
        />
        <CustomButton
          title="Create & Activate"
          onPress={handleAddProfile}
          disabled={!newProfileName.trim()}
        />
      </AppModal>

      {/* Edit Profile Modal */}
      <AppModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProfile(null);
        }}>
        <Text style={[styles.modalTitle, {color: colors.text}]}>
          Rename Profile
        </Text>
        <CustomInput
          label="Profile Name"
          placeholder="Enter new name"
          value={editName}
          onChangeText={setEditName}
          autoFocus
        />
        <CustomButton
          title="Save Changes"
          onPress={handleSaveEdit}
          disabled={!editName.trim()}
        />
      </AppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  activeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarLargeText: {
    ...Typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeInfo: {
    flex: 1,
  },
  activeBadgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeName: {
    ...Typography.h3,
    fontWeight: '700',
  },
  activeDate: {
    ...Typography.caption,
    marginTop: 2,
  },
  activeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  actionButtonText: {
    ...Typography.buttonSmall,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  prereqNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  prereqNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  prereqIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  prereqNavText: {
    flex: 1,
  },
  prereqTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  prereqNavTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  prereqNavDesc: {
    fontSize: 12,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addInlineBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  themeOptionsContainer: {
    gap: Spacing.sm,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  themeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  themeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  themeCardText: {
    flex: 1,
  },
  themeCardTitle: {
    fontSize: 15,
  },
  themeCardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileList: {
    gap: Spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  avatarMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarMediumText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileRowInfo: {
    flex: 1,
  },
  profileRowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  profileRowName: {
    fontSize: 15,
  },
  activeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  profileRowDate: {
    fontSize: 12,
    marginTop: 2,
  },
  profileRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  modalTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    fontWeight: '700',
  },
});
