import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import ProfileScreen from '../screens/ProfileScreen';
import MainTabs from './MainTabs';
import {Colors} from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: Colors.background},
      }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
