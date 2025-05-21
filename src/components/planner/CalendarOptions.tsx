import { getFirstDayOfWeek, getWeekNumber } from '@/lib/utils';
import { Box, Input, Stack, Switch, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';

export type TCalendarOptions = { date: string; recurence: boolean };
export const DEFAULT_CALENDAR_OPTIONS: TCalendarOptions = {
  date: dayjs(getFirstDayOfWeek(getWeekNumber() + 1)).toISOString(),
  recurence: false,
};

interface Props {
  calendarOptions?: TCalendarOptions;
  setCalendarOptions?: React.Dispatch<React.SetStateAction<TCalendarOptions>>;
}

export default function CalendarOptions({
  calendarOptions = DEFAULT_CALENDAR_OPTIONS,
  setCalendarOptions = () => {},
}: Props) {
  return (
    <Box className='md:px-[20%]'>
      <Stack>
        <DatePickerInput
          label='Date de début de semaine'
          description={
            <Box component='span'>
              <Text size='xs' component='span'>
                Choisissez une date dans la semaine de référence.
              </Text>
              <Text size='xs' component='span'>
                Le lundi de cette semaine sera considéré comme le début de la semaine.
              </Text>
            </Box>
          }
          placeholder='Date de début de semaine'
          valueFormat='LL'
          value={calendarOptions.date}
          onChange={(date) =>
            setCalendarOptions((p) => ({
              ...p,
              date: dayjs(getFirstDayOfWeek(getWeekNumber(new Date(date)))).toISOString(),
            }))
          }
        />
        <Input.Wrapper
          label='Récurrence'
          description='Les soignants affectés à une section la semaine précédente pourront-ils être affectés à la même section cette semaine ?'
        >
          <Switch
            mt={4}
            size='lg'
            checked={calendarOptions.recurence}
            onChange={(event) =>
              setCalendarOptions((p) => ({
                ...p,
                recurence: event.currentTarget?.checked ?? event.target.checked,
              }))
            }
            onLabel='Oui'
            offLabel='Non'
          />
        </Input.Wrapper>
      </Stack>
    </Box>
  );
}
