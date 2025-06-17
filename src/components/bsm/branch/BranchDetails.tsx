'use client';

import { fetchBranch } from '@/actions/common';
import { Branch } from '@/generated/client';
import { Button, ColorInput, Group, Input, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

interface Props {
  branch: Branch;
  userId: string;
}

export default function BranchDetails({ branch, userId }: Props) {
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
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            updatedById: userId,
          },
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

  async function handleDelete() {
    modals.openConfirmModal({
      title: 'Supprimer cette branche',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer cette branche ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchBranch('delete', [{ where: { id: branch.id } }], '/');
        if (!deleteRes) {
          notifications.show({
            title: 'Erreur',
            message: 'Erreur lors de la suppression de la branche',
            color: 'red',
            autoClose: 4e3,
          });
        } else {
          notifications.show({
            title: 'Suppression de la branche',
            message: 'Branche supprimée avec succès',
            color: 'green',
            autoClose: 4e3,
          });
        }
        setLoading(false);
        redirect('/branches');
      },
    });
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

        <Group justify='center' mt='xl' className='!flex-col-reverse md:!flex-row'>
          {readOnly ? (
            <Button type='button' onClick={() => setReadonly(false)}>
              Modifier
            </Button>
          ) : (
            <>
              <Button type='button' color='red' onClick={handleDelete}>
                Supprimer
              </Button>
              <Button type='button' onClick={handleCancel} variant='light'>
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
