import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../theme/colors';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import Header from '../components/common/Header';
import CustomInput from '../components/common/CustomInput';
import CustomButton from '../components/common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function YouTubeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="YouTube Export" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.videoPreview}>
          <Icon name="play-circle-outline" size={48} color={Colors.textLight} />
          <Text style={styles.previewText}>Video Preview</Text>
        </View>

        <CustomInput
          label="Title"
          placeholder="Enter video title"
          value=""
          onChangeText={() => {}}
        />

        <CustomInput
          label="Description"
          placeholder="Enter video description"
          value=""
          onChangeText={() => {}}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <View style={styles.captionsSection}>
          <Text style={styles.sectionLabel}>Auto-Generated Captions</Text>
          <View style={styles.captionsBox}>
            <Text style={styles.captionsPlaceholder}>
              Captions will be auto-generated here...
            </Text>
          </View>
          <CustomButton
            title="Regenerate Captions"
            variant="outline"
            size="sm"
            onPress={() => {}}
            style={styles.regenerateBtn}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Export to YouTube" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  videoPreview: {
    height: 200,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  previewText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  captionsSection: {
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  captionsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  captionsPlaceholder: {
    ...Typography.body,
    color: Colors.textLight,
  },
  regenerateBtn: {
    alignSelf: 'flex-start',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
