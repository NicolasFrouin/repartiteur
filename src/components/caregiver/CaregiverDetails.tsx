'use client';

import { fetchBranch, fetchCaregiver } from '@/actions/common';
import { Branch, Caregiver, CaregiverBigWeekType } from '@/generated/client';
import { debounce, getWeekDay } from '@/lib/utils';
import { BIG_WEEK_DAYS, getWeekNumber } from '@/utils/date';
import {
  Box,
  Button,
  ColorInput,
  Group,
  Input,
  LoadingOverlay,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { z } from 'zod';

interface Props {
  caregiver: Caregiver;
}

export default function CaregiverDetails({ caregiver }: Props) {
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(true);
  const [caregiverData, setCaregiverData] = useState<Caregiver>(caregiver);
  const [branchesData, setBranchesData] = useState<{ value: string; label: string }[]>([]);

  const isEvenWeek = getWeekNumber() % 2 === 0;

  const schema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    bigWeekType: z.enum([CaregiverBigWeekType.EVEN, CaregiverBigWeekType.ODD]),
    color: z.string(),
    branchId: z.string(),
    active: z.boolean(),
  });

  const form = useForm({
    mode: 'controlled',
    initialValues: caregiverData,
    validate: zodResolver(schema),
  });

  const defaultProps = (
    key: keyof ReturnType<(typeof form)['getInitialValues']>,
    has: 'asterix' | 'styles.required' | 'none' | 'both' = 'both',
  ) => {
    const props = { size: 'md', readOnly: readOnly, ...form.getInputProps(key) };
    if (has === 'styles.required' || has === 'both') {
      // @ts-expect-error ---
      props.styles = { required: { color: 'blue' } };
    }
    if (has === 'asterix' || has === 'both') {
      // @ts-expect-error ---
      props.withAsterisk = form.isDirty(key);
    }
    return props;
  };

  async function handleBranchSearch(query: string) {
    setLoading(true);
    await fetchBranch('findMany', [
      {
        where: { OR: [{ name: { contains: query } }, { id: { contains: query } }], active: true },
        take: 25,
        orderBy: { name: 'asc' },
      },
    ]).then((branches: Branch[]) =>
      setBranchesData(branches.map((b) => ({ value: b.id, label: b.name }))),
    );
    setLoading(false);
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    handleBranchSearch(caregiver.branchId);
  }

  async function handleSubmit(values: ReturnType<(typeof form)['getValues']>) {
    const updateRes: Caregiver | null = await fetchCaregiver(
      'update',
      [
        {
          data: {
            firstname: values.firstname,
            lastname: values.lastname,
            bigWeekType: values.bigWeekType,
            color: values.color,
            branch: { connect: { id: values.branchId } },
            active: values.active,
          },
          where: { id: caregiver.id },
        },
      ],
      '/',
    ).catch(() => null);
    if (!updateRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la modification du soignant',
        color: 'red',
        autoClose: 4e3,
      });
      return;
    }
    setReadonly(true);
    setCaregiverData(updateRes);
    form.setValues(updateRes);
    form.resetDirty();
    notifications.show({
      title: 'Modification de soignant',
      message: 'Soignant modifié avec succès',
      color: 'green',
      autoClose: 4e3,
    });
  }

  useEffect(() => {
    handleBranchSearch('');
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label='Prénom'
          placeholder='Michel·le'
          key={form.key('firstname')}
          {...defaultProps('firstname')}
        />
        <TextInput
          label='Nom de famille'
          placeholder='Dupont'
          key={form.key('lastname')}
          {...defaultProps('lastname')}
        />
        <Input.Wrapper
          label='Grosse semaine de travail'
          className='flex flex-col'
          description={
            <Box size='sm' component='span'>
              Travail les {BIG_WEEK_DAYS.map(getWeekDay).join(', ')}
              <br />
              <Text size='xs' fs={'italic'} component='span'>
                Nous sommes actuellement en semaine <b>{isEvenWeek ? 'paire' : 'impaire'}</b>
              </Text>
            </Box>
          }
          {...defaultProps('bigWeekType')}
        >
          <SegmentedControl
            key={form.key('bigWeekType')}
            {...defaultProps('bigWeekType', 'styles.required')}
            data={[
              { label: 'Semaine paire', value: CaregiverBigWeekType.EVEN },
              { label: 'Semaine impaire', value: CaregiverBigWeekType.ODD },
            ]}
          />
        </Input.Wrapper>
        <ColorInput
          label='Couleur'
          placeholder='Sélectionner une couleur'
          key={form.key('color')}
          {...defaultProps('color')}
        />
        <Box pos={'relative'}>
          <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />
          <Select
            label='Branche'
            placeholder='Sélectionner une branche'
            data={branchesData}
            key={form.key('branchId')}
            {...defaultProps('branchId')}
            searchable
            nothingFoundMessage='Aucune branche trouvée'
            onSearchChange={debounce(handleBranchSearch)}
          />
        </Box>
        <Input.Wrapper label='Actif' {...defaultProps('active')}>
          <Switch
            key={form.key('active')}
            {...defaultProps('active', 'styles.required')}
            checked={form.getInputProps('active').value}
          />
        </Input.Wrapper>
      </Stack>
      <Group justify='center' mt='xl'>
        {readOnly ? (
          <Button onClick={() => setReadonly(false)}>Modifier</Button>
        ) : (
          <>
            <Button onClick={handleCancel} variant='subtle'>
              Annuler
            </Button>
            <Button type='submit'>Enregistrer</Button>
          </>
        )}
      </Group>
    </form>
  );
}
