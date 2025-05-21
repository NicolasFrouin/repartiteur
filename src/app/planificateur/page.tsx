'use client';

import CalendarOptions, { TCalendarOptions } from '@/components/planner/CalendarOptions';
import CalendarTouchUp from '@/components/planner/CalendarTouchUp';
import CaregiverOptions from '@/components/planner/CaregiverOptions';
import { Caregiver, Sector } from '@/generated/client';
import { getFirstDayOfWeek, getWeekNumber } from '@/lib/utils';
import { FullAssignment } from '@/types/utils';
import { Box, Button, Group, Stepper } from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'react';

interface StepProps {
  label: string;
  component: React.ReactNode;
}

const GENERATE_CALENDAR_ON_STEP = 2;

export default function Page() {
  const [active, setActive] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [weekCalendar, setWeekCalendar] = useState<FullAssignment[] | null>(null);
  const [calendarOptions, setCalendarOptions] = useState<TCalendarOptions>({
    date: dayjs(getFirstDayOfWeek(getWeekNumber() + 1)).toISOString(),
    recurence: false,
  });
  const [forbiddenSectors, setForbiddenSectors] = useState<Record<Caregiver['id'], Sector['id'][]>>(
    {},
  );

  const STEPS: StepProps[] = [
    {
      label: 'Restriction de secteurs',
      component: (
        <CaregiverOptions
          forbiddenSectors={forbiddenSectors}
          setForbiddenSectors={setForbiddenSectors}
        />
      ),
    },
    {
      label: 'Options de génération',
      component: (
        <CalendarOptions
          calendarOptions={calendarOptions}
          setCalendarOptions={setCalendarOptions}
        />
      ),
    },
    {
      label: 'Génération / Modifications',
      component: (
        <CalendarTouchUp
          calendarOptions={calendarOptions}
          forbiddenSectors={forbiddenSectors}
          weekCalendar={weekCalendar}
          setWeekCalendar={setWeekCalendar}
        />
      ),
    },
  ];

  const nextStep = () => setActive((prev) => (prev < STEPS.length ? prev + 1 : prev));
  const prevStep = () => setActive((prev) => (prev > 0 ? prev - 1 : prev));

  function renderNextStepButton(): React.ReactNode {
    switch (active) {
      case GENERATE_CALENDAR_ON_STEP - 1:
        return 'Voir le calendrier';
      case GENERATE_CALENDAR_ON_STEP:
        return 'Confirmer le calendrier';
      case STEPS.length:
        return 'Terminer';
      default:
        return 'Suivant';
    }
  }

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
        {STEPS.map((step, i) => (
          <Stepper.Step key={i} label={step.label}>
            <Group justify={'center'} mb={'md'}>
              <Button
                onClick={prevStep}
                loading={loading}
                variant={'outline'}
                disabled={active === 0}
              >
                Précédent
              </Button>
              <Button onClick={nextStep} loading={loading} disabled={active === STEPS.length}>
                {renderNextStepButton()}
              </Button>
            </Group>
            {step.component}
          </Stepper.Step>
        ))}
      </Stepper>
      <Group justify={'center'} mt='xl'>
        <Button onClick={prevStep} loading={loading} variant={'outline'} disabled={active === 0}>
          Précédent
        </Button>
        <Button onClick={nextStep} loading={loading} disabled={active === STEPS.length}>
          {renderNextStepButton()}
        </Button>
      </Group>
    </Box>
  );
}
