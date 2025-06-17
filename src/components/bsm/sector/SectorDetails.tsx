'use client';

import { fetchBranch, fetchSector } from '@/actions/common';
import { FullSector } from '@/types/utils';
import {
  Button,
  ColorInput,
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  Stack,
  Switch,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

function formatBranchName(branch: FullSector['branch']) {
  return branch.name || '';
}

const defaultSector = {
  id: '',
  name: '',
  color: '',
  active: true,
  branchId: '',
  branch: { id: '', name: '', color: '', active: true },
} as FullSector;

interface Props {
  sector?: FullSector;
  userId: string;
}

export default function SectorDetails({ sector = defaultSector, userId }: Props) {
  const isCreating = !Boolean(sector.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [sectorData, setSectorData] = useState<FullSector>(sector);
  const [branchesData, setBranchesData] = useState<FullSector['branch'][]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      setComboSearch('');
      if (branchesData.length === 0 && !branchesLoading) {
        handleBranchSearch('').then(() => combobox.resetSelectedOption());
      }
    },
  });
  const [comboSearch, setComboSearch] = useState(formatBranchName(sector.branch) || '');
  const [comboValue, setComboValue] = useState<FullSector['branch'] | null>(sector.branch);

  const schema = z.object({
    name: z.string().min(1, { message: 'Nom requis' }),
    color: z
      .string({ coerce: true })
      .startsWith('#', 'Seules les couleurs au format hexadécimal sont acceptées (#6c0277)')
      .optional()
      .or(z.literal('')),
    active: z.boolean(),
    branchId: z.string().min(1, { message: 'Branche requise' }),
  });

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
        where: { OR: [{ name: { contains: query } }, { id: query }], active: true },
        take: 25,
        orderBy: { name: 'asc' },
      },
    ])
      .then((branches: FullSector['branch'][]) => setBranchesData(branches))
      .catch(() => setBranchesData([]))
      .finally(() => setBranchesLoading(false));
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setComboSearch(formatBranchName(sector.branch) || '');
    setComboValue(sector.branch);
  }

  async function handleCreate(values: typeof form.values) {
    const createRes: FullSector | null = await fetchSector(
      'create',
      [
        {
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            branch: { connect: { id: comboValue?.id } },
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
          },
          include: { branch: true, missions: true },
        },
      ],
      '/',
    ).catch(() => null);

    if (!createRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la création du secteur',
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setSectorData(createRes);
      form.setValues(createRes);
      form.resetDirty();
      notifications.show({
        title: 'Création de secteur',
        message: 'Secteur créé avec succès',
        color: 'green',
        autoClose: 4e3,
      });
      redirect(`/admin/secteurs/${createRes.id}`);
    }
  }

  async function handleSubmit(values: typeof form.values) {
    if (readOnly) return;

    setLoading(true);
    if (isCreating) {
      await handleCreate(values);
    } else {
      await handleUpdate(values);
    }
    setLoading(false);
  }

  async function handleUpdate(values: typeof form.values) {
    const updateRes: FullSector | null = await fetchSector(
      'update',
      [
        {
          where: { id: sectorData.id },
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            branch: { connect: { id: comboValue?.id } },
            updatedBy: { connect: { id: userId } },
          },
          include: { branch: true, missions: true },
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
    } else {
      setSectorData(updateRes);
      form.setValues(updateRes);
      form.resetDirty();
      notifications.show({
        title: 'Modification du secteur',
        message: 'Secteur modifié avec succès',
        color: 'green',
        autoClose: 4e3,
      });
    }
    setReadonly(true);
  }

  const branchSearchChange = useDebouncedCallback(handleBranchSearch, 300);

  const options = (branchesData || []).map((item) => (
    <Combobox.Option key={item.id} value={item.id}>
      {formatBranchName(item)}
    </Combobox.Option>
  ));

  function handleComboOptionSubmit(val: string) {
    const selectedBranch = branchesData.find((branch) => branch.id === val) || sectorData.branch;
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
      title: 'Supprimer ce secteur',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer ce secteur ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchSector('delete', [{ where: { id: sectorData.id } }], '/');
        if (!deleteRes) {
          notifications.show({
            title: 'Erreur',
            message: 'Erreur lors de la suppression du secteur',
            color: 'red',
            autoClose: 4e3,
          });
        } else {
          notifications.show({
            title: 'Suppression de secteur',
            message: 'Secteur supprimé avec succès',
            color: 'green',
            autoClose: 4e3,
          });
        }
        setLoading(false);
        redirect('/admin/secteurs');
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
              {loading ? (
                <Combobox.Empty>Chargement...</Combobox.Empty>
              ) : options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>Aucune branche trouvée</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

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
