import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function TabBar({tabs, activeTab, onTabPress}: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab)}
            activeOpacity={0.7}>
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
});
