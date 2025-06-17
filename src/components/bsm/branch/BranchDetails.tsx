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

const defaultBranch = { id: '', name: '', color: '', active: true } as Branch;

interface Props {
  branch?: Branch;
  userId: string;
}

export default function BranchDetails({ branch = defaultBranch, userId }: Props) {
  const isCreating = !Boolean(branch.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [branchData, setBranchData] = useState<Branch>(branch);

  const schema = z.object({
    name: z.string().min(1, 'Nom requis'),
    color: z
      .string({ coerce: true })
      .startsWith('#', 'Seules les couleurs au format hexadécimal sont acceptées (#6c0277)')
      .optional()
      .or(z.literal('')),
    active: z.boolean(),
  });

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

  async function handleCreate(values: typeof form.values) {
    const createRes: Branch | null = await fetchBranch(
      'create',
      [
        {
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            createdById: userId,
            updatedById: userId,
          },
        },
      ],
      '/',
    ).catch(() => null);

    if (!createRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la création de la branche',
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setBranchData(createRes);
      form.setValues(createRes);
      form.resetDirty();
      notifications.show({
        title: 'Création de branche',
        message: 'Branche créée avec succès',
        color: 'green',
        autoClose: 4e3,
      });
      redirect(`/admin/branches/${createRes.id}`);
    }
  }

  async function handleUpdate(values: typeof form.values) {
    const updateRes: Branch | null = await fetchBranch(
      'update',
      [
        {
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            updatedById: userId,
          },
          where: { id: branchData.id },
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
    } else {
      setBranchData(updateRes);
      form.setValues(updateRes);
      form.resetDirty();
      notifications.show({
        title: 'Modification de la branche',
        message: 'Branche modifiée avec succès',
        color: 'green',
        autoClose: 4e3,
      });
    }
    setReadonly(true);
  }

  async function handleSubmit(values: ReturnType<(typeof form)['getValues']>) {
    if (readOnly) return;

    setLoading(true);
    if (isCreating) {
      await handleCreate(values);
    } else {
      await handleUpdate(values);
    }
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
        const deleteRes = await fetchBranch('delete', [{ where: { id: branchData.id } }], '/');
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
        redirect('/');
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
              {!isCreating && (
                <Button type='button' color='red' onClick={handleDelete}>
                  Supprimer
                </Button>
              )}
              <Button type='button' onClick={handleCancel} variant='light'>
                Annuler
              </Button>
              <Button type='submit' loading={loading}>
                {isCreating ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </form>
  );
}
