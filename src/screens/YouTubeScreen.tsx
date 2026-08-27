import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {Typography} from '../theme/typography';
import {BorderRadius, Spacing} from '../theme/spacing';
import Header from '../components/common/Header';
import CustomInput from '../components/common/CustomInput';
import CustomButton from '../components/common/CustomButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function YouTubeScreen() {
  const {colors} = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header title="YouTube Export" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.videoPreview,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Icon name="play-circle-outline" size={48} color={colors.textLight} />
          <Text style={[styles.previewText, {color: colors.textLight}]}>
            Video Preview
          </Text>
        </View>

        <CustomInput
          label="Title"
          placeholder="Enter video title"
          value={title}
          onChangeText={setTitle}
        />

        <CustomInput
          label="Description"
          placeholder="Enter video description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <View style={styles.captionsSection}>
          <Text style={[styles.sectionLabel, {color: colors.text}]}>
            Auto-Generated Captions
          </Text>
          <View
            style={[
              styles.captionsBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.captionsPlaceholder, {color: colors.textLight}]}>
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

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}>
        <CustomButton title="Export to YouTube" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  previewText: {
    ...Typography.caption,
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
    marginBottom: Spacing.sm,
  },
  captionsBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 80,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  captionsPlaceholder: {
    ...Typography.body,
  },
  regenerateBtn: {
    alignSelf: 'flex-start',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});
