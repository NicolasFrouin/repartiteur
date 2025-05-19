'use client';

import { fetchBranch, fetchSector } from '@/actions/common';
import { Branch, Sector } from '@/generated/client';
import {
  Box,
  Button,
  ColorInput,
  Group,
  Input,
  LoadingOverlay,
  Select,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { z } from 'zod';

interface Props {
  sector: Sector;
}

export default function SectorDetails({ sector }: Props) {
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(true);
  const [sectorData, setSectorData] = useState<Sector>(sector);
  const [branchesData, setBranchesData] = useState<{ value: string; label: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const schema = z.object({});

  const form = useForm({
    initialValues: sectorData,
    mode: 'controlled',
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
    setBranchesLoading(true);
    await fetchBranch('findMany', [
      {
        where: { OR: [{ name: { contains: query } }, { id: { contains: query } }], active: true },
        take: 25,
        orderBy: { name: 'asc' },
      },
    ]).then((branches: Branch[]) =>
      setBranchesData(branches.map((b) => ({ value: b.id, label: b.name }))),
    );
    setBranchesLoading(false);
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
  }

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const updateRes: Sector | null = await fetchSector(
      'update',
      [
        {
          where: { id: sector.id },
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            branch: { connect: { id: values.branchId } },
          },
        },
      ],
      '/',
    ).catch(() => null);

    if (!updateRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la modification du secteur',
        color: 'red',
        autoClose: 4e3,
      });
      return;
    }
    setReadonly(true);
    setSectorData(updateRes);
    form.setValues(updateRes);
    form.resetDirty();
    notifications.show({
      title: 'Modification du secteur',
      message: 'Secteur modifié avec succès',
      color: 'green',
      autoClose: 4e3,
    });
    setLoading(false);
  }

  const branchSearchChange = useDebouncedCallback(handleBranchSearch, 300);

  useEffect(() => {
    handleBranchSearch('');
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label='Nom' key={form.key('name')} {...defaultProps('name')} />
        <ColorInput
          label='Couleur'
          placeholder='Sélectionner une couleur'
          key={form.key('color')}
          {...defaultProps('color')}
        />
        <Input.Wrapper label='Actif' {...defaultProps('active')}>
          <Switch
            key={form.key('active')}
            {...defaultProps('active', 'styles.required')}
            checked={form.getInputProps('active').value}
          />
        </Input.Wrapper>
        <Box pos={'relative'}>
          <LoadingOverlay
            visible={branchesLoading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <Select
            label='Branche'
            placeholder='Sélectionner une branche'
            data={branchesData}
            key={form.key('branchId')}
            {...defaultProps('branchId')}
            searchable
            nothingFoundMessage='Aucune branche trouvée'
            onSearchChange={branchSearchChange}
          />
        </Box>
        <Group justify='center' mt='xl'>
          {readOnly ? (
            <Button onClick={() => setReadonly(false)}>Modifier</Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant='subtle'>
                Annuler
              </Button>
              <Button type='submit' loading={loading}>
                Enregistrer
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </form>
  );
}
