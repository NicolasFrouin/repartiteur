import { DEFAULT_CALENDAR_OPTIONS, endOfWeek, isInWeekRange, startOfWeek } from '@/lib/utils';
import { TCalendarOptions } from '@/types/utils';
import { ActionIcon, Box, Input, Stack, Switch, Text, Tooltip } from '@mantine/core';
import { DateFormatter, DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { FaCalendarDay } from 'react-icons/fa6';

const metadata: Metadata & { title: string } = { title: 'Planificateur - Options de génération' };

interface Props {
  calendarOptions?: TCalendarOptions;
  setCalendarOptions?: React.Dispatch<React.SetStateAction<TCalendarOptions>>;
}

export default function CalendarOptions({
  calendarOptions = DEFAULT_CALENDAR_OPTIONS,
  setCalendarOptions = () => {},
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const formatter: DateFormatter = ({ date, format, labelSeparator }) => {
    if (Array.isArray(date)) {
      return date.map((d) => dayjs(d).format(format)).join(labelSeparator);
    } else {
      date = dayjs(date).toISOString();
      return `Semaine n°${dayjs(date).format('ww')} -> du ${dayjs(startOfWeek(date)).format(format)} au ${dayjs(endOfWeek(date)).format(format)}`;
    }
  };

  useEffect(() => {
    const oldTitle = document.title;
    document.title = metadata.title;

    return () => {
      document.title = oldTitle;
    };
  }, []);

  return (
    <Box className='md:px-[20%]'>
      <Stack>
        <DatePickerInput
          size='md'
          label='Semaine du planning'
          description={
            <Box component='span'>
              <Text size='xs' component='span'>
                Choisissez la semaine pour laquelle vous souhaitez générer le calendrier.
              </Text>
            </Box>
          }
          withWeekNumbers
          placeholder='Semaine du planning'
          valueFormat='LL'
          valueFormatter={formatter}
          value={calendarOptions.date}
          onChange={(date) => date && setCalendarOptions((p) => ({ ...p, date: date }))}
          withCellSpacing={false}
          rightSection={
            <Tooltip label='Sélectionner la semaine prochaine' position='top' withArrow>
              <ActionIcon
                onClick={() =>
                  setCalendarOptions((p) => ({ ...p, date: dayjs().add(1, 'week').toISOString() }))
                }
              >
                <FaCalendarDay />
              </ActionIcon>
            </Tooltip>
          }
          getDayProps={(date) => {
            const isHovered = isInWeekRange(date, hovered);
            const isSelected = isInWeekRange(date, calendarOptions.date);
            const isInRange = isHovered || isSelected;
            return {
              onMouseEnter: () => setHovered(date),
              onMouseLeave: () => setHovered(null),
              inRange: isInRange,
              firstInRange: isInRange && new Date(date).getDay() === 1,
              lastInRange: isInRange && new Date(date).getDay() === 0,
              selected: isSelected,
              onClick: () => setCalendarOptions((p) => ({ ...p, date: date })),
            };
          }}
        />
        <Input.Wrapper
          size='md'
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
