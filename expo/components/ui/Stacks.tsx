import clsx from 'clsx';
import { View, ViewStyle } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { alignPosition, gapSize, justifyPosition, paddingSize } from './optionVariants';

interface YStackOptions {
  children: React.ReactNode;
  justify?: keyof typeof justifyPosition;
  align?: keyof typeof alignPosition;
  gap?: keyof typeof gapSize;
  padding?: keyof typeof paddingSize;
  fill?: boolean;
  style?: ViewStyle;
  className?: string;
}

export const YStack = ({
  children,
  justify = 'start',
  align = 'start',
  gap = 'md',
  padding = 'md',
  fill = true,
  style,
  className,
}: YStackOptions) => {
  return (
    <View
      className={twMerge(
        clsx(
          `flex flex-col ${justifyPosition[justify]} ${alignPosition[align]}  ${gapSize[gap]} ${paddingSize[padding]} bg-background`,
          className,
          {
            'w-full flex-1': fill,
          }
        )
      )}
      style={style}>
      {children}
    </View>
  );
};
export const XStack = ({
  children,
  justify = 'start',
  align = 'start',
  gap = 'md',
  padding = 'md',
  fill = true,
  style,
  className,
}: YStackOptions) => {
  return (
    <View
      className={twMerge(
        clsx(
          `flex flex-row ${justifyPosition[justify]} ${alignPosition[align]}  ${gapSize[gap]} ${paddingSize[padding]} bg-background`,
          className,
          {
            'h-full flex-1': fill,
          }
        )
      )}
      style={style}>
      {children}
    </View>
  );
};
