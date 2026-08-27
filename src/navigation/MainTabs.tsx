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
import ProfileScreen from '../screens/ProfileScreen';
import {useTheme} from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Scripts: 'description',
  Preview: 'chat',
  Assets: 'perm-media',
  Generation: 'auto-fix-high',
  Review: 'rate-review',
  YouTube: 'smart-display',
  Profile: 'person',
};

const TAB_LABELS: Record<string, string> = {
  Scripts: 'Scripts',
  Preview: 'Preview',
  Assets: 'Assets',
  Generation: 'Generate',
  Review: 'Review',
  YouTube: 'YouTube',
  Profile: 'Profile',
};

export default function MainTabs() {
  const {colors} = useTheme();

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
              color={focused ? colors.primary : colors.textLight}
            />
          );
        },
        tabBarLabel: ({focused}) => (
          <Text
            style={[
              styles.tabLabel,
              {color: focused ? colors.primary : colors.textLight},
            ]}
            numberOfLines={1}>
            {TAB_LABELS[route.name] || route.name}
          </Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
      })}>
      <Tab.Screen name="Scripts" component={ScriptScreen} />
      <Tab.Screen name="Preview" component={PreviewScreen} />
      <Tab.Screen name="Assets" component={AssetsScreen} />
      <Tab.Screen name="Generation" component={GenerationScreen} />
      <Tab.Screen name="Review" component={ReviewExportScreen} />
      <Tab.Screen name="YouTube" component={YouTubeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 4,
    paddingBottom: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
