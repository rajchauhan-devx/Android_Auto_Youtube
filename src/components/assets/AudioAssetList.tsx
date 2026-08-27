import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {AudioAsset} from '../../types';
import EmptyState from '../common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AudioAssetListProps {
  assets: AudioAsset[];
}

export default function AudioAssetList({assets}: AudioAssetListProps) {
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
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name="audiotrack" size={24} color={Colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.characterName}</Text>
            <Text style={styles.language}>
              {item.language === 'hindi' ? 'Hindi' : 'English'}
            </Text>
          </View>
          <View style={[styles.statusDot, {backgroundColor: item.status === 'done' ? Colors.secondary : Colors.textLight}]} />
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
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  language: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
