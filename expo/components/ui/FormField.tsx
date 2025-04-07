import { TextInputProps, View } from 'react-native';

import { Input } from './input';
import { Label } from './label';

export const FormField = ({ label, ...props }: { label: string } & TextInputProps) => {
  return (
    <View className="flex-1">
      <Label className="text-lg font-bold">{label}</Label>
      <Input className="mt-2 w-full text-lg" {...props} />
    </View>
  );
};
