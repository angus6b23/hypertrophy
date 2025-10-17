import { TabView, TabBar, Route, SceneRendererProps } from 'react-native-tab-view';
import { Dimensions } from 'react-native';

import { ReactNode, useState } from 'react';

import { useColors } from '~/utils/rn-reusables/useColors';
import { IconName, ThemedIcon } from './ThemedIcon';

interface CustomRoute extends Route {
  icon?: IconName;
}

export const CustomTab = ({
  screens,
  routes,
  tabViewProps,
  tabBarProps,
}: {
  routes: CustomRoute[];
  screens: (props: SceneRendererProps & { route: Route }) => ReactNode;
  tabViewProps?: Partial<React.ComponentProps<typeof TabView>>;
  tabBarProps?: Partial<React.ComponentProps<typeof TabBar>>;
}) => {
  const [tab, setTab] = useState(0);
  const colors = useColors();

  return (
    <TabView
      navigationState={{
        index: tab,
        routes,
      }}
      style={{ padding: 0 }}
      swipeEnabled={true}
      commonOptions={{
        icon: ({ route }) => route.icon && <ThemedIcon name={route.icon as IconName} size={20} />,
      }}
      renderScene={screens}
      onIndexChange={setTab}
      initialLayout={{ width: Dimensions.get('window').width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          activeColor={colors.text}
          inactiveColor={colors.text}
          style={{
            backgroundColor: colors.background,
            width: Dimensions.get('window').width,
          }}
          indicatorStyle={{ backgroundColor: colors.text }}
          scrollEnabled={true}
          {...tabBarProps}
        />
      )}
      {...tabViewProps}
    />
  );
};
