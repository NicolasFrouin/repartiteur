'use client';

import { fetchUser } from '@/actions/common';
import { Role, User } from '@/generated/client';
import { signInSchema } from '@/lib/utils/zod';
import {
  Button,
  Group,
  Input,
  PasswordInput,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const defaultUser = {
  id: '',
  role: Role.USER,
  name: '',
  email: '',
  password: '',
  active: true,
} as User;

interface Props {
  user?: User;
  userId: string;
}

export default function UserDetails({ user = defaultUser, userId }: Props) {
  const isCreating = !Boolean(user.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [userData, setUserData] = useState<User>(user);

  const schema = z.object({
    name: z.string().min(1, 'Nom requis'),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Rôle requis' }) }),
    email: signInSchema.shape.email,
    active: z.boolean(),
  });

  if (isCreating) {
    schema.extend({ password: signInSchema.shape.password });
  }

  const form = useForm({
    mode: 'controlled',
    initialValues: userData,
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
    const createRes: User | null = await fetchUser(
      'create',
      [
        {
          data: {
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
            createdById: userId,
            updatedById: userId,
          },
          omit: { password: true },
        },
      ],
      '/',
    ).catch(() => null);

    if (!createRes) {
      notifications.show({
        title: 'Erreur',
        message: "Erreur lors de la création de l'utilisateur",
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setUserData(createRes);
      form.setValues(createRes);
      form.resetDirty();
      notifications.show({
        title: "Création d'utilisateur",
        message: 'Utilisateur créé avec succès',
        color: 'green',
        autoClose: 4e3,
      });
      redirect(`/admin/utilisateurs/${createRes.id}`);
    }
  }

  async function handleUpdate(values: typeof form.values) {
    const updateRes: User | null = await fetchUser(
      'update',
      [
        {
          data: {
            name: values.name,
            email: values.email,
            // password: values.password,
            role: values.role,
            updatedById: userId,
          },
          where: { id: userData.id },
        },
      ],
      '/',
    ).catch(() => null);

    if (!updateRes) {
      notifications.show({
        title: 'Erreur',
        message: "Erreur lors de la modification de l'utilisateur",
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setUserData(updateRes);
      form.setValues(updateRes);
      form.resetDirty();
      notifications.show({
        title: "Modification d'utilisateur",
        message: 'Utilisateur modifié avec succès',
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
      title: 'Supprimer cet utilisateur',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchUser('delete', [{ where: { id: user.id } }], '/');
        if (!deleteRes) {
          notifications.show({
            title: 'Erreur',
            message: "Erreur lors de la suppression de l'utilisateur",
            color: 'red',
            autoClose: 4e3,
          });
        } else {
          notifications.show({
            title: "Suppression d'utilisateur",
            message: 'Utilisateur supprimé avec succès',
            color: 'green',
            autoClose: 4e3,
          });
        }
        setLoading(false);
        redirect('/admin/utilisateurs');
      },
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label='Nom complet'
          placeholder='Michel·le Dupont'
          key={form.key('name')}
          {...defaultProps('name')}
        />
        <Input.Wrapper label='Rôle' className='flex flex-col' {...defaultProps('role')}>
          <SegmentedControl
            key={form.key('role')}
            color='blue'
            {...defaultProps('role', 'styles.required')}
            data={[
              { label: 'USER', value: Role.USER },
              { label: 'ADMIN', value: Role.ADMIN },
              { label: 'SUPERADMIN', value: Role.SUPERADMIN },
            ]}
          />
        </Input.Wrapper>
        <TextInput
          label='Adresse email'
          placeholder='dupont.m@exemple.com'
          key={form.key('email')}
          {...defaultProps('email')}
        />
        {isCreating && (
          <PasswordInput
            label='Mot de passe'
            placeholder='••••••••'
            key={form.key('password')}
            {...defaultProps('password')}
          />
        )}
        <Input.Wrapper label='Actif' {...defaultProps('active')}>
          <Switch
            key={form.key('active')}
            {...defaultProps('active', 'styles.required')}
            checked={form.getInputProps('active').value}
          />
        </Input.Wrapper>
      </Stack>

      <Group justify='center' mt='xl' className='!flex-col-reverse md:!flex-row'>
        {readOnly ? (
          <Button type='button' onClick={() => setReadonly(false)}>
            Modifier
          </Button>
        ) : (
          <>
            {!isCreating && (
              <>
                <Button type='button' color='red' onClick={handleDelete}>
                  Supprimer
                </Button>
                <Button type='button' onClick={handleCancel} variant='light'>
                  Annuler
                </Button>
              </>
            )}
            <Button type='submit' loading={loading}>
              {isCreating ? 'Créer' : 'Enregistrer'}
            </Button>
          </>
        )}
      </Group>
    </form>
  );
}
