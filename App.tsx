import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ProfileProvider} from './src/context/ProfileContext';
import {ScriptProvider} from './src/context/ScriptContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <ProfileProvider>
          <ScriptProvider>
            <AppNavigator />
          </ScriptProvider>
        </ProfileProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
