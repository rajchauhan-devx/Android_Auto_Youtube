import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {AudioAsset} from '../../types';
import EmptyState from '../common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AudioAssetListProps {
  assets: AudioAsset[];
  onDelete?: (id: string) => void;
}

export default function AudioAssetList({assets, onDelete}: AudioAssetListProps) {
  const {colors} = useTheme();

  if (assets.length === 0) {
    return (
      <EmptyState
        icon="audiotrack"
        title="No Audio Prompts Found"
        message="Extract audio prompts from chat in the Preview page using <Audio>your voice/dialogue text</Audio> tags."
      />
    );
  }

  const handleDelete = (item: AudioAsset, index: number) => {
    Alert.alert(
      'Delete Audio Prompt',
      `Are you sure you want to delete Audio Prompt #${index + 1}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(item.id),
        },
      ],
    );
  };

  return (
    <FlatList
      data={assets}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({item, index}) => {
        const textContent = item.prompt || item.text || '';
        return (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    {backgroundColor: '#10B98118'},
                  ]}>
                  <Icon name="graphic-eq" size={14} color="#10B981" />
                  <Text style={[styles.badgeText, {color: '#10B981'}]}>
                    Audio Prompt #{index + 1}
                  </Text>
                </View>
              </View>

              {onDelete && (
                <TouchableOpacity
                  onPress={() => handleDelete(item, index)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Icon name="delete-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>

            <Text
              style={[styles.promptText, {color: colors.text}]}
              selectable={true}>
              {textContent}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  promptText: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 20,
  },
});
