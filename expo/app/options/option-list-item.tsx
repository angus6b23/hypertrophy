import RNPickerSelect, { Item } from 'react-native-picker-select';

import { ListItem } from '~/components/ui/List';
import { IconName, ThemedIcon } from '~/components/ui/ThemedIcon';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/utils/rn-reusables/useColorScheme';
import { useColors } from '~/utils/rn-reusables/useColors';

interface OptionListItemProps {
  icon?: IconName;
  label: string;
  items: Item[];
  value: any;
  onValueChange: (value: any, index: any) => void;
}
export const OptionListItem = (props: OptionListItemProps) => {
  const colors = useColors();
  const { colorScheme } = useColorScheme();

  const SelectEl = () => {
    return (
      <RNPickerSelect
        placeholder={{}}
        onValueChange={props.onValueChange}
        value={props.value}
        style={{
          inputAndroid: {
            fontSize: 16,
            paddingRight: 12,
            flex: 1,
            flexGrow: 1,
            color: colors.text,
            textAlign: 'right',
          },
          inputIOS: {
            flex: 16,
            color: colors.text,
            textAlign: 'right',
          },
        }}
        items={props.items}
        Icon={() => <></>}
        darkTheme={colorScheme === 'dark'}
        useNativeAndroidPickerStyle={false}
      />
    );
  };
  return (
    <ListItem icon={props.icon && <ThemedIcon name={props.icon} />} select={<SelectEl />}>
      <Text className="text-lg">{props.label}</Text>
    </ListItem>
  );
};
