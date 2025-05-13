'use client';

import CaregiverOptions from '@/components/planner/CaregiverOptions';
import { Caregiver, Sector } from '@/prisma/generated/client';
import { Button, Group, Stepper } from '@mantine/core';
import { useState } from 'react';

interface StepProps {
  label: string;
  component: React.ReactNode;
}

export default function Page() {
  const [active, setActive] = useState(0);

  const [forbiddenSectors, setForbiddenSectors] = useState<Record<Caregiver['id'], Sector['id'][]>>(
    {},
  );

  const STEPS: StepProps[] = [
    {
      label: 'Choix des secteurs à ne pas attribuer',
      component: (
        <CaregiverOptions
          forbiddenSectors={forbiddenSectors}
          setForbiddenSectors={setForbiddenSectors}
        />
      ),
    },
  ];

  const nextStep = () => setActive((prev) => (prev < STEPS.length ? prev + 1 : prev));
  const prevStep = () => setActive((prev) => (prev > 0 ? prev - 1 : prev));

  return (
    <div>
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
        {STEPS.map((step, i) => (
          <Stepper.Step key={i} label={step.label}>
            {step.component}
          </Stepper.Step>
        ))}
      </Stepper>
      <Group justify={'center'} mt='xl'>
        <Button onClick={prevStep}>Précédent</Button>
        <Button onClick={nextStep}>Suivant</Button>
      </Group>
    </div>
  );
}
