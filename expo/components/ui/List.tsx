import { View } from 'react-native';

import { XStack, YStack } from './Stacks';

import { Separator } from '~/components/ui/separator';

export const List = ({ children }: { children: React.ReactNode }) => {
  return (
    <YStack padding="none" justify="start">
      {children}
    </YStack>
  );
};

export const ListItem = ({
  children,
  icon,
  select,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  select?: React.ReactNode;
  action?: (...params: any) => void;
}) => {
  return (
    <>
      <View>
        <XStack padding="none" align="center" justify="between" fill={false} className="w-full">
          <XStack justify="start" align="center" fill={false}>
            <View>{icon}</View>
            <View>{children}</View>
          </XStack>
          <View className="flex-1">{select}</View>
        </XStack>
      </View>
      <Separator orientation="horizontal" />
    </>
  );
};
