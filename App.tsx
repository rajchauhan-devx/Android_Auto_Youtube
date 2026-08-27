import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import {ProfileProvider} from './src/context/ProfileContext';
import {ScriptProvider} from './src/context/ScriptContext';
import AppNavigator from './src/navigation/AppNavigator';

function MainApp() {
  const {isDark} = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <ProfileProvider>
          <ScriptProvider>
            <AppNavigator />
          </ScriptProvider>
        </ProfileProvider>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
