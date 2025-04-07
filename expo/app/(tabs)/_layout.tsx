import { Link, Tabs } from 'expo-router';
import { CalendarDaysIcon, Code } from 'lucide-react-native';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

import { NAV_THEME } from '~/utils/rn-reusables/constants';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NAV_THEME[colorScheme].primary,
        tabBarInactiveTintColor: NAV_THEME[colorScheme].neutral,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerShown: true,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <Code size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <CalendarDaysIcon size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
