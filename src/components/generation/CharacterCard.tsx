import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CharacterCardProps {
  name: string;
  onListenVoice: () => void;
}

export default function CharacterCard({name, onListenVoice}: CharacterCardProps) {
  const {colors} = useTheme();

  return (
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
          styles.avatar,
          {backgroundColor: colors.primaryLight},
        ]}>
        <Text style={styles.initials}>{name[0]?.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
        {name}
      </Text>
      <TouchableOpacity
        style={[
          styles.listenBtn,
          {borderColor: colors.primary},
        ]}
        onPress={onListenVoice}
        activeOpacity={0.7}>
        <Icon name="volume-up" size={18} color={colors.primary} />
        <Text style={[styles.listenBtnText, {color: colors.primary}]}>Listen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  initials: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  name: {
    ...Typography.body,
    flex: 1,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  listenBtnText: {
    ...Typography.captionBold,
  },
});
