import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {Spacing} from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export default function Header({title, onBack, rightAction}: HeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.sideBtn} onPress={onBack}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideBtn} />
      )}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightAction ? (
        <TouchableOpacity style={styles.sideBtn} onPress={rightAction.onPress}>
          <Icon name={rightAction.icon} size={24} color={Colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
