import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Spacing} from '../../theme/spacing';
import TabBar from '../common/TabBar';
import CustomButton from '../common/CustomButton';
import CharacterCard from './CharacterCard';

const AUDIO_TABS = ['Hindi Audio', 'English Audio'];

const HINDI_CHARACTERS = ['राम', 'सीता', 'हनुमान', 'रावण'];
const ENGLISH_CHARACTERS = ['Narrator', 'Hero', 'Villain', 'Sidekick'];

export default function AudioGenerationTab() {
  const [activeAudioTab, setActiveAudioTab] = useState(AUDIO_TABS[0]);

  const characters =
    activeAudioTab === AUDIO_TABS[0] ? HINDI_CHARACTERS : ENGLISH_CHARACTERS;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <CustomButton
        title="Run Audio Model"
        onPress={() => {}}
        style={styles.runBtn}
      />
      <TabBar
        tabs={AUDIO_TABS}
        activeTab={activeAudioTab}
        onTabPress={setActiveAudioTab}
      />
      <View style={styles.characterList}>
        {characters.map((name, index) => (
          <CharacterCard
            key={`${activeAudioTab}-${index}`}
            name={name}
            onListenVoice={() => {}}
          />
        ))}
      </View>
      <View style={styles.generationSection}>
        <CustomButton
          title="Start Audio Generation"
          onPress={() => {}}
          style={styles.genBtn}
        />
        <CustomButton
          title="Stop"
          variant="danger"
          onPress={() => {}}
          style={styles.genBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  runBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  characterList: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  generationSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  genBtn: {
    width: '100%',
  },
});
