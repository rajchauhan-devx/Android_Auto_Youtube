import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import ProfileScreen from '../screens/ProfileScreen';
import PrerequisitesScreen from '../screens/PrerequisitesScreen';
import MainTabs from './MainTabs';
import {useTheme} from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {colors} = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="Prerequisites"
        component={PrerequisitesScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
