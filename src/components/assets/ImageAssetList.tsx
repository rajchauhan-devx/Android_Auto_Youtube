import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {ImageAsset} from '../../types';
import EmptyState from '../common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ImageAssetListProps {
  assets: ImageAsset[];
}

export default function ImageAssetList({assets}: ImageAssetListProps) {
  if (assets.length === 0) {
    return (
      <EmptyState
        icon="image"
        title="No Image Assets"
        message="Image prompts will appear here after extraction"
      />
    );
  }

  return (
    <FlatList
      data={assets}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({item, index}) => (
        <View style={styles.card}>
          <View style={styles.thumbnail}>
            <Icon name="image" size={24} color={Colors.textLight} />
          </View>
          <View style={styles.info}>
            <Text style={styles.promptNumber}>Prompt {index + 1}</Text>
            <Text style={styles.prompt} numberOfLines={2}>
              {item.prompt}
            </Text>
            <View style={[styles.statusDot, {backgroundColor: item.status === 'done' ? Colors.secondary : item.status === 'generating' ? Colors.warning : Colors.textLight}]} />
          </View>
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
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  promptNumber: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  prompt: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.xs,
  },
});
