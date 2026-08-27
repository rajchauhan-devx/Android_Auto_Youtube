import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from './types';
import ScriptScreen from '../screens/ScriptScreen';
import PreviewScreen from '../screens/PreviewScreen';
import AssetsScreen from '../screens/AssetsScreen';
import GenerationScreen from '../screens/GenerationScreen';
import ReviewExportScreen from '../screens/ReviewExportScreen';
import YouTubeScreen from '../screens/YouTubeScreen';
import {Colors} from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Scripts: 'description',
  Preview: 'chat',
  Assets: 'assets',
  Generation: 'auto-fix-high',
  Review: 'rate-review',
  YouTube: 'smart-display',
};

const TAB_LABELS: Record<string, string> = {
  Scripts: 'Scripts',
  Preview: 'Preview',
  Assets: 'Assets',
  Generation: 'Generate',
  Review: 'Review',
  YouTube: 'YouTube',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => {
          const iconName = TAB_ICONS[route.name] || 'circle';
          return (
            <Icon
              name={iconName}
              size={22}
              color={focused ? Colors.primary : Colors.textLight}
            />
          );
        },
        tabBarLabel: ({focused}) => (
          <Text
            style={[
              styles.tabLabel,
              focused ? styles.tabLabelActive : styles.tabLabelInactive,
            ]}>
            {TAB_LABELS[route.name] || route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
      })}>
      <Tab.Screen name="Scripts" component={ScriptScreen} />
      <Tab.Screen name="Preview" component={PreviewScreen} />
      <Tab.Screen name="Assets" component={AssetsScreen} />
      <Tab.Screen name="Generation" component={GenerationScreen} />
      <Tab.Screen name="Review" component={ReviewExportScreen} />
      <Tab.Screen name="YouTube" component={YouTubeScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 4,
    paddingBottom: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  tabLabelInactive: {
    color: Colors.textLight,
  },
});
