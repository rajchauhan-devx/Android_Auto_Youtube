import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CharacterCardProps {
  name: string;
  onListenVoice: () => void;
}

export default function CharacterCard({name, onListenVoice}: CharacterCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{name[0]?.toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <TouchableOpacity
        style={styles.listenBtn}
        onPress={onListenVoice}
        activeOpacity={0.7}>
        <Icon name="volume-up" size={18} color={Colors.primary} />
        <Text style={styles.listenBtnText}>Listen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  initials: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  name: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  listenBtnText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
});
