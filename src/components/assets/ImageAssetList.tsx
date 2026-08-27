import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import {ImageAsset} from '../../types';
import EmptyState from '../common/EmptyState';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ImageAssetListProps {
  assets: ImageAsset[];
}

export default function ImageAssetList({assets}: ImageAssetListProps) {
  const {colors} = useTheme();

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
              styles.thumbnail,
              {backgroundColor: colors.background},
            ]}>
            <Icon name="image" size={24} color={colors.textLight} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.promptNumber, {color: colors.text}]}>
              Prompt {index + 1}
            </Text>
            <Text
              style={[styles.prompt, {color: colors.textSecondary}]}
              numberOfLines={2}>
              {item.prompt}
            </Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === 'done'
                      ? colors.secondary
                      : item.status === 'generating'
                      ? colors.warning
                      : colors.textLight,
                },
              ]}
            />
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
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  promptNumber: {
    ...Typography.captionBold,
    marginBottom: Spacing.xs,
  },
  prompt: {
    ...Typography.caption,
    lineHeight: 18,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.xs,
  },
});
