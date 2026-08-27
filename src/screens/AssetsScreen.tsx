import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useProfile} from '../context/ProfileContext';
import {useAssets} from '../context/AssetContext';
import {BorderRadius, Spacing} from '../theme/spacing';
import TabBar from '../components/common/TabBar';
import Header from '../components/common/Header';
import ImageAssetList from '../components/assets/ImageAssetList';
import AudioAssetList from '../components/assets/AudioAssetList';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  navigation: any;
}

export default function AssetsScreen({navigation}: Props) {
  const {colors} = useTheme();
  const {activeProfile} = useProfile();
  const {
    imageAssets,
    audioAssets,
    loadAssets,
    deleteImageAsset,
    deleteAudioAsset,
    clearAllAssets,
  } = useAssets();

  const [activeTab, setActiveTab] = useState('Image Prompts');

  useFocusEffect(
    useCallback(() => {
      loadAssets();
    }, [loadAssets]),
  );

  const tabs = [
    `Image Prompts (${imageAssets.length})`,
    `Audio Prompts (${audioAssets.length})`,
  ];

  const handleClearAll = () => {
    if (imageAssets.length === 0 && audioAssets.length === 0) return;
    Alert.alert(
      'Clear Assets',
      'Are you sure you want to clear all extracted image and audio assets for this profile?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllAssets(),
        },
      ],
    );
  };

  const handleMoveToGeneration = () => {
    navigation.navigate('Generation');
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top']}>
      <Header
        title="Extracted Assets"
        subtitle={
          activeProfile
            ? `📁 automation/${activeProfile.name}/assets/`
            : undefined
        }
        rightAction={
          imageAssets.length > 0 || audioAssets.length > 0
            ? {icon: 'delete-sweep', onPress: handleClearAll}
            : undefined
        }
      />

      {/* Move to Generation Button at Top */}
      <View style={styles.topActionContainer}>
        <TouchableOpacity
          style={[
            styles.moveToGenBtn,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleMoveToGeneration}
          activeOpacity={0.8}>
          <Icon name="auto-fix-high" size={20} color="#FFFFFF" />
          <Text style={styles.moveToGenText}>Move to Generation</Text>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TabBar
        tabs={tabs}
        activeTab={
          activeTab.startsWith('Image') ? tabs[0] : tabs[1]
        }
        onTabPress={tab => {
          setActiveTab(tab.startsWith('Image') ? 'Image Prompts' : 'Audio Prompts');
        }}
      />

      <View style={styles.content}>
        {activeTab.startsWith('Image') ? (
          <ImageAssetList
            assets={imageAssets}
            onDelete={deleteImageAsset}
          />
        ) : (
          <AudioAssetList
            assets={audioAssets}
            onDelete={deleteAudioAsset}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  moveToGenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  moveToGenText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
