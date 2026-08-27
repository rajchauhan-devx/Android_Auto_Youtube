import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Colors} from '../../theme/colors';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import CustomButton from '../common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ImageGenerationTab() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CustomButton title="Start Model" onPress={() => {}} style={styles.startBtn} />
      <View style={styles.grid}>
        {Array.from({length: 6}).map((_, index) => (
          <View key={index} style={styles.imageCard}>
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={32} color={Colors.textLight} />
            </View>
            <Text style={styles.imageLabel}>Image {index + 1}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  startBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  imageCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    padding: Spacing.sm,
    textAlign: 'center',
  },
});
