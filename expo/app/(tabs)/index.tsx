import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';

export default function Home() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <ScreenContent path="app/(tabs)/index.tsx" title="Tab One" />
        <Button variant="secondary" size="lg" onPress={() => router.push('/login')}>
          <Text>Login</Text>
        </Button>
        <Button variant="secondary" size="lg" onPress={() => router.push('/exercise/list')}>
          <Text>Exercise</Text>
        </Button>
        <Button variant="secondary" size="lg" onPress={() => router.push('/(zShare)/debug')}>
          <Text>Debug</Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
