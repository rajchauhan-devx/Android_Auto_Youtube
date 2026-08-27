import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ImageAsset, AudioAsset} from '../types';
import {useTheme} from '../context/ThemeContext';
import TabBar from '../components/common/TabBar';
import Header from '../components/common/Header';
import ImageAssetList from '../components/assets/ImageAssetList';
import AudioAssetList from '../components/assets/AudioAssetList';

const TABS = ['Image Assets', 'Audio Assets'];

export default function AssetsScreen() {
  const {colors} = useTheme();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const [imageAssets] = useState<ImageAsset[]>([]);
  const [audioAssets] = useState<AudioAsset[]>([]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header title="Assets" />
      <TabBar tabs={TABS} activeTab={activeTab} onTabPress={setActiveTab} />
      <View style={styles.content}>
        {activeTab === TABS[0] ? (
          <ImageAssetList assets={imageAssets} />
        ) : (
          <AudioAssetList assets={audioAssets} />
        )}
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
