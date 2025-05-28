/*eslint import/namespace: ['error', { allowComputed: true }]*/
import { icons } from 'lucide-react-native';

import { useColors } from '~/utils/rn-reusables/useColors';

export type IconName = keyof typeof icons;
interface ThemedIconProps {
  name: IconName;
  color?: string;
  inverted?: boolean;
  size?: number;
}
export const ThemedIcon = (props: ThemedIconProps) => {
  const colors = useColors();
  const size = props.size || 28;
  const LucideIcon = icons[props.name];
  return (
    <LucideIcon
      size={size}
      color={props.color ?? (props.inverted ? colors.background : colors.text)}
    />
  );
};
