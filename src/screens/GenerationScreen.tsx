import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import TabBar from '../components/common/TabBar';
import Header from '../components/common/Header';
import ImageGenerationTab from '../components/generation/ImageGenerationTab';
import AudioGenerationTab from '../components/generation/AudioGenerationTab';

const TABS = ['Image Generation', 'Audio Generation'];

export default function GenerationScreen() {
  const {colors} = useTheme();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header title="Generation" />
      <TabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.content}>
        {activeTab === TABS[0] ? <ImageGenerationTab /> : <AudioGenerationTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
