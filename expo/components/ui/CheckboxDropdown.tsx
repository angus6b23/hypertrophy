import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Text } from '~/components/ui/text';

interface CheckboxDropdownProps {
  buttonText: string;
  menuLabel?: string;
  items: {
    label: string;
    value: string;
  }[];
  currentItem: string[] | undefined;
  callback: (action: 'add' | 'remove', item: any) => void;
}
export const CheckboxDropdown = (props: CheckboxDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={props.currentItem && props.currentItem.length > 0 ? 'default' : 'outline'}>
          <Text>{props.buttonText}</Text>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {props.menuLabel && (
          <>
            <DropdownMenuLabel>{props.menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {props.items.map((item) => {
          return (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={props.currentItem?.includes(item.value) || false}
              onCheckedChange={(checked) => props.callback(checked ? 'add' : 'remove', item.value)}>
              <Text>{item.label}</Text>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
