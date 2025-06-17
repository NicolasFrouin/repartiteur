'use client';

import { signInSchema } from '@/lib/utils';
import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FiAlertCircle, FiLock, FiMail } from 'react-icons/fi';

function getErrorMessage(error?: string, code?: string): string {
  if (!error && !code) {
    return '';
  }
  if (error === 'CredentialsSignin' || code === 'credentials') {
    return 'Identifiants incorrects';
  }
  return error || "Une erreur s'est produite lors de la connexion";
}

interface Props {
  searchParams: { callbackUrl?: string; error?: string; code?: string };
}

export default function Login({ searchParams }: Props) {
  const callbackUrl = searchParams.callbackUrl || '/';

  const [error, setError] = useState<string | null>(
    getErrorMessage(searchParams.error, searchParams.code) || null,
  );
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: zodResolver(signInSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);
    try {
      await signIn('credentials', { ...values, redirect: true, redirectTo: callbackUrl });
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === 'CredentialsSignin') {
          setError('Identifiants incorrects');
        } else {
          setError("Erreur d'authentification: " + error.message);
        }
      } else {
        setError("Une erreur s'est produite lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mx='auto' mb={100}>
      <Paper radius='md' p='xl' withBorder shadow='md' maw={400}>
        <Title order={2} ta='center' mb='md'>
          Bienvenue dans l&apos;espace administrateur
        </Title>
        <Text size='sm' ta='center' mb='md' c='dimmed'>
          Veuillez saisir vos identifiants pour accéder à l&apos;espace administrateur
        </Text>

        <Divider my='md' />

        {error && (
          <Alert
            icon={<FiAlertCircle size='1rem' />}
            title="Erreur d'authentification"
            color='red'
            mb='md'
            radius='md'
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label='Adresse email'
              placeholder='votre@email.com'
              leftSection={<FiMail size='1rem' />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              required
              label='Mot de passe'
              placeholder='Votre mot de passe'
              leftSection={<FiLock size='1rem' />}
              {...form.getInputProps('password')}
            />
          </Stack>

          <Group justify='flex-end' mt='xl'>
            <Button type='submit' radius='md' fullWidth loading={loading}>
              Connexion
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  );
}
