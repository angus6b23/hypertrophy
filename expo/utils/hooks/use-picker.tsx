import { TouchableNativeFeedback, View } from 'react-native';
import { ReactNode, useCallback, useState } from 'react';

import { Text } from '~/components/ui/text';
import { Dialog, DialogClose, DialogContent } from '~/components/ui/dialog';

export interface PickerItem<T> {
  label: string;
  value: T;
}

function usePicker<T>({
  items,
  onSelect,
}: {
  items: PickerItem<T>[];
  onSelect: React.Dispatch<React.SetStateAction<T>>;
}): [ReactNode, () => void] {
  const [show, setShow] = useState(false);
  const trigger = useCallback(() => {
    setShow(true);
  }, []);

  const dialog = (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent
        className="min-w-96 p-0 max-h-3/4 border-none rounded-none gap-0"
        hideClose={true}>
        {items.map((item) => (
          <View key={item.value as string} className="bg-muted">
            <TouchableNativeFeedback
              className=""
              onPress={() => {
                onSelect(item.value);
                setShow(false);
              }}>
              <View className="p-4 w-full bg-red-400">
                <Text>{item.label}</Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        ))}
      </DialogContent>
    </Dialog>
  );

  return [dialog, trigger];
}

export default usePicker;
