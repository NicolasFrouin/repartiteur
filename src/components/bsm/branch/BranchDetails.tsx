'use client';

import { fetchBranch } from '@/actions/common';
import { Branch } from '@/generated/client';
import { Button, ColorInput, Group, Input, Stack, Switch, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { z } from 'zod';

interface Props {
  branch: Branch;
}

export default function BranchDetails({ branch }: Props) {
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(true);
  const [branchData, setBranchData] = useState<Branch>(branch);

  const schema = z.object({});

  const form = useForm({
    initialValues: branchData,
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

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
  }

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const updateRes = await fetchBranch(
      'update',
      [
        {
          where: { id: branch.id },
          data: { name: values.name, color: values.color, active: values.active },
        },
      ],
      '/',
    ).catch(() => null);

    if (!updateRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la modification de la branche',
        color: 'red',
        autoClose: 4e3,
      });
    }
    setReadonly(true);
    setBranchData(updateRes);
    form.setValues(updateRes);
    form.resetDirty();
    notifications.show({
      title: 'Modification de la branche',
      message: 'Branche modifiée avec succès',
      color: 'green',
      autoClose: 4e3,
    });
    setLoading(false);
  }

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
