import { Link, Tabs } from 'expo-router';

import TabBarIcon from '../../components/TabBarIcon';
import { HeaderButton } from '../../components/HeaderButton';

import { useTranslation } from 'react-i18next';

import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { NAV_THEME } from '~/utils/rn-reusables/constants';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_THEME[colorScheme].primary,
        tabBarInactiveTintColor: NAV_THEME[colorScheme].neutral,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="workout"
        options={{
          title: t('common.workout'),
          tabBarIcon: ({ color }) => <TabBarIcon name="Dumbbell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="exercise/index"
        options={{
          title: t('common.exercise'),
          tabBarIcon: ({ color }) => <TabBarIcon name="BicepsFlexed" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools/index"
        options={{
          title: t('common.tools'),
          tabBarIcon: ({ color }) => <TabBarIcon name="Wrench" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: t('common.progress'),
          tabBarIcon: ({ color }) => <TabBarIcon name="CalendarDays" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="Code" color={color} />,
          headerShown: true,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
