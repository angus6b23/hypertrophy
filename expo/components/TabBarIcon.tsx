/*eslint import/namespace: ['error', { allowComputed: true }]*/
import { icons } from 'lucide-react-native';

const Icon = ({ name, color }: { name: keyof typeof icons; color: string }) => {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={28} />;
};

export default Icon;
