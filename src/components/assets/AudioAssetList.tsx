import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {AudioAsset} from '../../types';
import EmptyState from '../common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AudioAssetListProps {
  assets: AudioAsset[];
}

export default function AudioAssetList({assets}: AudioAssetListProps) {
  const {colors} = useTheme();

  if (assets.length === 0) {
    return (
      <EmptyState
        icon="audiotrack"
        title="No Audio Assets"
        message="Audio assets will appear here after extraction"
      />
    );
  }

  return (
    <FlatList
      data={assets}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({item}) => (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <View
            style={[
              styles.iconContainer,
              {backgroundColor: colors.background},
            ]}>
            <Icon name="audiotrack" size={24} color={colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, {color: colors.text}]}>
              {item.characterName}
            </Text>
            <Text style={[styles.language, {color: colors.textSecondary}]}>
              {item.language === 'hindi' ? 'Hindi' : 'English'}
            </Text>
          </View>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  item.status === 'done'
                    ? colors.secondary
                    : colors.textLight,
              },
            ]}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.bodyBold,
  },
  language: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
