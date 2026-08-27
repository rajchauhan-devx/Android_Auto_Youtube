import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {Typography} from '../../theme/typography';
import {BorderRadius, Spacing} from '../../theme/spacing';
import CustomButton from '../common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ImageGenerationTab() {
  const {colors} = useTheme();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CustomButton title="Start Model" onPress={() => {}} style={styles.startBtn} />
      <View style={styles.grid}>
        {Array.from({length: 6}).map((_, index) => (
          <View
            key={index}
            style={[
              styles.imageCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View
              style={[
                styles.imagePlaceholder,
                {backgroundColor: colors.background},
              ]}>
              <Icon name="image" size={32} color={colors.textLight} />
            </View>
            <Text style={[styles.imageLabel, {color: colors.textSecondary}]}>
              Image {index + 1}
            </Text>
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
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLabel: {
    ...Typography.caption,
    padding: Spacing.sm,
    textAlign: 'center',
  },
});
