'use client';

import CalendarOptions from '@/components/planner/CalendarOptions';
import CalendarTouchUp from '@/components/planner/CalendarTouchUp';
import CaregiverOptions from '@/components/planner/CaregiverOptions';
import { Caregiver, Sector } from '@/generated/client';
import { DEFAULT_CALENDAR_OPTIONS } from '@/lib/utils';
import { FullAssignment, TCalendarOptions } from '@/types/utils';
import { Anchor, Box, Breadcrumbs, Button, Group, Stack, Stepper, Text } from '@mantine/core';
import Link from 'next/link';
import { SetStateAction, useState } from 'react';

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
  const [calendarOptions, setCalendarOptions] =
    useState<TCalendarOptions>(DEFAULT_CALENDAR_OPTIONS);
  const [forbiddenSectors, setForbiddenSectors] = useState<Record<Caregiver['id'], Sector['id'][]>>(
    {},
  );

  function handleSetCalendarOptions(value: SetStateAction<TCalendarOptions>) {
    setCalendarOptions(value);
    setWeekCalendar(null);
  }

  const STEPS: StepProps[] = [
    {
      label: 'Options de génération',
      component: (
        <CalendarOptions
          calendarOptions={calendarOptions}
          setCalendarOptions={handleSetCalendarOptions}
        />
      ),
    },
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
      <Group justify='space-between' align='center' mb={20}>
        <Breadcrumbs>
          <Anchor component={Link} href={'/admin'}>
            Administration
          </Anchor>
          <Text>Planificateur</Text>
        </Breadcrumbs>
      </Group>
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
        {active === STEPS.length && (
          <Stepper.Completed>
            <Stack justify={'center'} mb={'md'}>
              <Text ta='center' fw={'bolder'} size='lg'>
                Le calendrier a été généré avec succès !
              </Text>
              <Text ta='center' size='sm' mt='xs'>
                Vous pouvez quitter cette page ou revenir en arrière pour modifier le calendrier.
              </Text>
              <Anchor component={Link} href={'/'} ta={'center'} mt='md'>
                Retour à l&apos;accueil
              </Anchor>
            </Stack>
          </Stepper.Completed>
        )}
      </Stepper>
      <Group justify={'center'} mt='lg'>
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
