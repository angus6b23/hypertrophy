import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Text } from '~/components/ui/text';

interface RadioDropdownProps {
  buttonText: string;
  menuLabel?: string;
  items: {
    label: string;
    value: string;
  }[];
  currentItem: string | undefined;
  callback: (item: any) => void;
}
export const RadioDropdown = (props: RadioDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={props.currentItem ? 'default' : 'outline'}>
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
        <DropdownMenuRadioGroup value={props.currentItem} onValueChange={props.callback}>
          {props.items.map((item) => {
            return (
              <DropdownMenuRadioItem key={item.value} value={item.value}>
                <Text>{item.label}</Text>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
