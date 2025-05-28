import { useTranslation } from 'react-i18next';

export const useWeekday = (weekDay: number) => {
  const { t } = useTranslation();
  const days = [
    t('common.sunday'),
    t('common.monday'),
    t('common.tuesday'),
    t('common.wednesday'),
    t('common.thursday'),
    t('common.friday'),
    t('common.saturday'),
  ];
  return days[weekDay % 7];
};
