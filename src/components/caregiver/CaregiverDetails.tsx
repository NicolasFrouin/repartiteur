'use client';

import { fetchBranch, fetchCaregiver } from '@/actions/common';
import { CaregiverBigWeekType, CaregiverTime } from '@/generated/client';
import { BIG_WEEK_DAYS, getWeekDay, getWeekNumber, toSlug } from '@/lib/utils';
import { FullCaregiver } from '@/types/utils';
import {
  Box,
  Button,
  ColorInput,
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const defaultCaregiver = {
  id: '',
  firstname: '',
  lastname: '',
  slug: '',
  color: '',
  bigWeekType: CaregiverBigWeekType.EVEN,
  active: true,
  branchId: '',
} as FullCaregiver;

function formatBranchName(branch?: FullCaregiver['branch']) {
  return branch?.name || '';
}

interface Props {
  caregiver?: FullCaregiver;
}

export default function CaregiverDetails({ caregiver = defaultCaregiver }: Props) {
  const isCreating = !Boolean(caregiver.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [caregiverData, setCaregiverData] = useState<FullCaregiver>(caregiver);
  const [branchesData, setBranchesData] = useState<FullCaregiver['branch'][]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const isEvenWeek = getWeekNumber() % 2 === 0;

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      setComboSearch('');
      if (branchesData.length === 0 && !branchesLoading) {
        handleBranchSearch('').then(() => combobox.resetSelectedOption());
      }
    },
  });
  const [comboSearch, setComboSearch] = useState(formatBranchName(caregiver.branch) || '');
  const [comboValue, setComboValue] = useState<FullCaregiver['branch'] | null>(
    caregiver.branch || null,
  );

  const schema = z.object({
    firstname: z.string().min(1, 'Prénom requis'),
    lastname: z.string().min(1, 'Nom requis'),
    bigWeekType: z.enum([CaregiverBigWeekType.EVEN, CaregiverBigWeekType.ODD]),
    color: z
      .string({ coerce: true })
      .startsWith('#', 'Seuls les couleurs au format hexadécimal sont acceptées (#6c0277)')
      .optional()
      .or(z.literal('')),
    branchId: z.string().min(1, 'Branche requise'),
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
    setBranchesLoading(true);
    await fetchBranch('findMany', [
      {
        where: { OR: [{ name: { contains: query } }, { id: query }], active: true },
        take: 25,
        orderBy: { name: 'asc' },
      },
    ])
      .then((branches: FullCaregiver['branch'][]) => setBranchesData(branches))
      .catch(() => setBranchesData([]))
      .finally(() => setBranchesLoading(false));
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setComboSearch(formatBranchName(caregiver.branch) || '');
    setComboValue(caregiver.branch || null);
  }

  async function handleCreate(values: typeof form.values) {
    const createRes: FullCaregiver | null = await fetchCaregiver(
      'create',
      [
        {
          data: {
            firstname: values.firstname,
            lastname: values.lastname,
            slug: toSlug([values.firstname, values.lastname].join(' ')),
            time: CaregiverTime.DAY,
            bigWeekType: values.bigWeekType,
            color: values.color,
            branch: { connect: { id: comboValue?.id } },
            active: values.active,
          },
        },
      ],
      '/',
    ).catch(() => null);

    if (!createRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la création du soignant',
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setCaregiverData(createRes);
      form.setValues(createRes);
      form.resetDirty();
      notifications.show({
        title: 'Création de soignant',
        message: 'Soignant créé avec succès',
        color: 'green',
        autoClose: 4e3,
      });
      redirect(`/admin/soignants/${createRes.id}`);
    }
  }

  async function handleUpdate(values: typeof form.values) {
    const updateRes: FullCaregiver | null = await fetchCaregiver(
      'update',
      [
        {
          data: {
            firstname: values.firstname,
            lastname: values.lastname,
            bigWeekType: values.bigWeekType,
            color: values.color,
            branch: { connect: { id: comboValue?.id } },
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
    } else {
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

  const branchSearchChange = useDebouncedCallback(handleBranchSearch, 300);

  const options = (branchesData || []).map((item) => (
    <Combobox.Option key={item.id} value={item.id} selected={item.id === comboValue?.id}>
      {formatBranchName(item)}
    </Combobox.Option>
  ));

  function handleComboOptionSubmit(val: string) {
    const selectedBranch = branchesData.find((branch) => branch.id === val) || caregiver.branch;
    setComboValue(selectedBranch);
    setComboSearch(formatBranchName(selectedBranch));
    form.setFieldValue('branchId', selectedBranch?.id);
    combobox.closeDropdown();
  }

  function handleComboInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    combobox.openDropdown();
    combobox.updateSelectedOptionIndex();
    setComboSearch(event.currentTarget.value);
    branchSearchChange(event.currentTarget.value);
  }

  async function handleDelete() {
    modals.openConfirmModal({
      title: 'Supprimer ce soignant',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer ce soignant ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchCaregiver('delete', [{ where: { id: caregiver.id } }], '/');
        if (!deleteRes) {
          notifications.show({
            title: 'Erreur',
            message: 'Erreur lors de la suppression du soignant',
            color: 'red',
            autoClose: 4e3,
          });
        } else {
          notifications.show({
            title: 'Suppression de soignant',
            message: 'Soignant supprimé avec succès',
            color: 'green',
            autoClose: 4e3,
          });
        }
        setLoading(false);
        redirect('/admin/soignants');
      },
    });
  }

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

        <Combobox store={combobox} withinPortal={false} onOptionSubmit={handleComboOptionSubmit}>
          <Combobox.Target>
            <InputBase
              key={form.key('branchId')}
              {...defaultProps('branchId')}
              rightSection={
                readOnly ? null : branchesLoading ? <Loader size={18} /> : <Combobox.Chevron />
              }
              label='Branche'
              rightSectionPointerEvents='none'
              value={comboSearch}
              onChange={handleComboInputChange}
              onClick={() => !readOnly && combobox.openDropdown()}
              onFocus={() => !readOnly && combobox.openDropdown()}
              onBlur={() => {
                if (readOnly) return;
                combobox.closeDropdown();
                setComboSearch(comboValue ? formatBranchName(comboValue) : comboSearch || '');
              }}
              placeholder='Rechercher une branche'
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {branchesLoading ? (
                <Combobox.Empty>Chargement...</Combobox.Empty>
              ) : options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>Aucune branche trouvée</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

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
