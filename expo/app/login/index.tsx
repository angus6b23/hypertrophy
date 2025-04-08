import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import { AuthErrors } from 'share/interfaces/error-codes';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { YStack } from '~/components/ui/Stacks';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';

function LoginPage() {
  const [tab, setTab] = useState('login');
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          presentation: 'modal',
          title: t('common.login'),
        }}
        name="login"
      />
      <YStack justify="center">
        <YStack justify="start" fill={false}>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full flex-row">
              <TabsTrigger value="login" className="flex-1">
                <Text>Login</Text>
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                <Text>Signup</Text>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginCard />
            </TabsContent>
            <TabsContent value="signup">
              <SignupCard />
            </TabsContent>
          </Tabs>
        </YStack>
      </YStack>
    </>
  );
}

const LoginCard = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const changeUserName = useCallback(
    (text: string) => {
      setUserName(text);
    },
    [setUserName]
  );
  const changePassword = useCallback((text: string) => setPassword(text), [setPassword]);
  const allValid = useCallback(() => {
    return userName !== '' && password !== '';
  }, [userName, password]);
  return (
    <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>
      <YStack className="mt-4 rounded-lg" padding="none" fill={false}>
        <YStack gap="sm" padding="none" className="w-full" fill={false}>
          <Label>Username</Label>
          <Input
            value={userName}
            onChangeText={changeUserName}
            className="w-full"
            autoComplete="username"
          />
        </YStack>
        <YStack gap="sm" padding="none" className="w-full" fill={false}>
          <Label>Password</Label>
          <Input
            value={password}
            onChangeText={changePassword}
            className="w-full"
            autoComplete="password"
            caretHidden
            secureTextEntry
          />
        </YStack>
        <Button className="w-full" onPress={() => toast('pressed')} disabled={!allValid()}>
          <Text>Log in</Text>
        </Button>
      </YStack>
    </Animated.View>
  );
};

const SignupCard = () => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    displayName: '',
  });
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const changeUserName = useCallback(
    (text: string) => {
      const usernameSchema = z
        .string()
        .min(3, { message: AuthErrors.username_too_short })
        .max(32, { message: AuthErrors.username_too_long })
        .regex(/^[a-zA-Z0-9_]+$/, {
          message: AuthErrors.username_invalid_char,
        });
      const valid = usernameSchema.safeParse(text);
      setUserName(text);
      if (!valid.success) {
        setErrors((e) => ({ ...e, username: valid.error.issues[0].message }));
      } else {
        setErrors((e) => ({ ...e, username: '' }));
      }
    },
    [setUserName]
  );

  const changePassword = useCallback(
    (text: string) => {
      const passwordSchema = z
        .string()
        .min(8, { message: AuthErrors.password_too_short })
        .max(32, { message: AuthErrors.password_too_long })
        .regex(/^[a-zA-Z0-9_]+$/, {
          message: AuthErrors.username_invalid_char,
        });
      const valid = passwordSchema.safeParse(text);
      setPassword(text);
      if (!valid.success) {
        setErrors((e) => ({ ...e, password: valid.error.issues[0].message }));
      } else {
        setErrors((e) => ({ ...e, password: '' }));
      }
    },
    [setPassword]
  );
  const changeDisplayName = useCallback((text: string) => {
    const displayNameSchema = z
      .string()
      .min(3, { message: AuthErrors.displayName_too_short })
      .max(32, { message: AuthErrors.displayName_too_long });
    const valid = displayNameSchema.safeParse(text);
    setDisplayName(text);
    if (!valid.success) {
      setErrors((e) => ({ ...e, displayName: valid.error.issues[0].message }));
    } else {
      setErrors((e) => ({ ...e, displayName: '' }));
    }
  }, []);

  const allValid = useCallback(() => {
    return (
      errors.displayName === '' &&
      errors.username === '' &&
      errors.password === '' &&
      userName !== '' &&
      displayName !== '' &&
      password !== ''
    );
  }, [errors, userName, displayName, password]);

  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutRight}>
      <YStack className="mt-4 rounded-lg" padding="none" fill={false}>
        <YStack gap="sm" padding="none" className="w-full" fill={false}>
          <Label>{t('auth.display_name')}</Label>
          <Input
            value={displayName}
            onChangeText={changeDisplayName}
            className="w-full"
            autoComplete="name"
            placeholder={t('auth.the_name_to_be_displayed_on_your_profile')}
          />
          {errors.displayName && (
            <Label className="mt-0 text-destructive">{errors.displayName}</Label>
          )}
        </YStack>
        <YStack gap="sm" padding="none" className="w-full" fill={false}>
          <Label>{t('auth.username')}</Label>
          <Input
            value={userName}
            onChangeText={changeUserName}
            className="w-full"
            autoComplete="username"
            placeholder={t('auth.the_username_used_for_login')}
          />
          {errors.username && <Label className="mt-0 text-destructive">{errors.username}</Label>}
        </YStack>
        <YStack gap="sm" padding="none" className="w-full" fill={false}>
          <Label>{t('auth.password')}</Label>
          <Input
            value={password}
            onChangeText={changePassword}
            className="w-full"
            autoComplete="password"
            caretHidden
            secureTextEntry
            placeholder={t('auth.super_secret')}
          />
          {errors.password && <Label className="mt-0 text-destructive">{errors.password}</Label>}
        </YStack>
        <Button className="w-full" onPress={() => toast('pressed')} disabled={!allValid()}>
          <Text>{t('auth.signup')}</Text>
        </Button>
      </YStack>
    </Animated.View>
  );
};
export default LoginPage;
