import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '~/components/ui/text';

export default function Toolpage() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <Text>{t('common.tools')}</Text>
    </>
  );
}
