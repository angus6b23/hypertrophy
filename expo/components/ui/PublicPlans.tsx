import { useAccountStore } from '~/utils/stores/account-store';
import { Text } from './text';
import { useTranslation } from 'react-i18next';

export const PublicPlans = () => {
  const isLoggedIn = useAccountStore((s) => s.isLoggedIn);
  const { t } = useTranslation();
  if (!isLoggedIn) {
    return (
      <>
        <Text>{t('plan.login_to_an_instance_to_explore_public_plans')}</Text>
      </>
    );
  } else {
    // TODO: Add pubic plan loading and exploring
    return (
      <>
        <Text>PUBLIC PLANS</Text>
      </>
    );
  }
};
