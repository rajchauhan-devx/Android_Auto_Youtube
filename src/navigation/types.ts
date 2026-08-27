import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Profile: undefined;
  MainTabs: undefined;
  Prerequisites: undefined;
};

export type MainTabParamList = {
  Scripts: undefined;
  Preview: {initialPrompt?: string; scriptTitle?: string; autoStart?: boolean} | undefined;
  Assets: undefined;
  Generation: undefined;
  Review: undefined;
  YouTube: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
