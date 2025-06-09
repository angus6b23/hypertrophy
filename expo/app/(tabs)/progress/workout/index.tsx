import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Calendar } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { useColors } from '~/utils/rn-reusables/useColors';
import { useWorkoutStore } from '~/utils/stores/session-store';

export const ProgressWorkoutPage = () => {
  const colors = useColors();
  const workouts = useWorkoutStore((s) => s.workouts);
  const router = useRouter();
  const getDots = useCallback(() => {
    let markedDates: MarkedDates = {};
    workouts.forEach((w) => {
      const startTime = new Date(w.startTime);
      const date = startTime.toISOString().split('T')[0];
      markedDates = {
        ...markedDates,
        [date]: {
          marked: true,
        },
      };
    });
    return markedDates;
  }, [workouts]);

  return (
    <Calendar
      style={{
        margin: 12,
        borderRadius: 12,
      }}
      maxDate={new Date().toDateString()}
      allowSelectionOutOfRange={false}
      hideExtraDays={false}
      enableSwipeMonths={true}
      theme={{
        backgroundColor: colors.border,
        calendarBackground: colors.border,
        todayTextColor: colors.background,
        todayBackgroundColor: colors.text,
        todayDotColor: colors.background,
        dayTextColor: colors.text,
        dotColor: colors.text,
        monthTextColor: colors.text,
        textSectionTitleColor: colors.text,
        arrowColor: colors.text,
        textDisabledColor: colors.neutral,
      }}
      markedDates={getDots()}
      onDayPress={(d) => router.push(`/(zShare)/workout/${d.dateString}`)}
    />
  );
};
