import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Profile: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Scripts: undefined;
  Preview: undefined;
  Assets: undefined;
  Generation: undefined;
  Review: undefined;
  YouTube: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
