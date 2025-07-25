'use client';

import { fetchMission, fetchSector } from '@/actions/common';
import { FullMission } from '@/types/utils';
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

function formatSectorName(sector: FullMission['sector']) {
  if (!sector?.name || !sector.branch?.name) {
    return '';
  }
  return `${sector.name} (${sector.branch.name})`;
}

const defaultMission = {
  id: '',
  name: '',
  color: '',
  active: true,
  sectorId: '',
  sector: {
    id: '',
    name: '',
    color: '',
    active: true,
    branch: { id: '', name: '', color: '', active: true },
  },
} as FullMission;

interface Props {
  mission?: FullMission;
  userId: string;
}

export default function MissionDetails({ mission = defaultMission, userId }: Props) {
  const isCreating = !Boolean(mission.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [missionData, setMissionData] = useState<FullMission>(mission);
  const [sectorsData, setSectorsData] = useState<FullMission['sector'][]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      setComboSearch('');
      if (sectorsData.length === 0 && !sectorsLoading) {
        handleSectorSearch('').then(() => combobox.resetSelectedOption());
      }
    },
  });
  const [comboSearch, setComboSearch] = useState(formatSectorName(mission.sector) || '');
  const [comboValue, setComboValue] = useState<FullMission['sector'] | null>(mission.sector);

  const schema = z.object({
    name: z.string().min(1, { message: 'Nom requis' }),
    color: z
      .string({ coerce: true })
      .startsWith('#', 'Seules les couleurs au format hexadécimal sont acceptées (#6c0277)')
      .optional()
      .or(z.literal('')),
    active: z.boolean(),
    sectorId: z.string().min(1, { message: 'Secteur requis' }),
  });

  const form = useForm({
    initialValues: missionData,
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

  async function handleSectorSearch(query?: string) {
    setSectorsLoading(true);
    await fetchSector('findMany', [
      {
        where: {
          OR: [
            { name: { contains: query } },
            { id: query },
            { branch: { name: { contains: query } } },
          ],
          active: true,
        },
        take: 25,
        orderBy: { name: 'asc' },
        include: { branch: { select: { name: true } } },
      },
    ])
      .then((sectors: FullMission['sector'][]) => setSectorsData(sectors))
      .catch(() => setSectorsData([]))
      .finally(() => setSectorsLoading(false));
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setComboSearch(formatSectorName(mission.sector) || '');
    setComboValue(mission.sector);
  }

  async function handleCreate(values: typeof form.values) {
    const createRes: FullMission | null = await fetchMission(
      'create',
      [
        {
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            sector: { connect: { id: comboValue?.id } },
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
          },
          include: { sector: { include: { branch: true } } },
        },
      ],
      '/',
    ).catch(() => null);

    if (!createRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la création de la mission',
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setMissionData(createRes);
      form.setValues(createRes);
      form.resetDirty();
      notifications.show({
        title: 'Création de mission',
        message: 'Mission créée avec succès',
        color: 'green',
        autoClose: 4e3,
      });
      redirect(`/admin/missions/${createRes.id}`);
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
    const updateRes: FullMission | null = await fetchMission(
      'update',
      [
        {
          where: { id: missionData.id },
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            sector: { connect: { id: comboValue?.id } },
            updatedBy: { connect: { id: userId } },
          },
          include: { sector: { include: { branch: true } } },
        },
      ],
      '/',
    ).catch(() => null);

    if (!updateRes) {
      notifications.show({
        title: 'Erreur',
        message: 'Erreur lors de la modification de la mission',
        color: 'red',
        autoClose: 4e3,
      });
    } else {
      setMissionData(updateRes);
      form.setValues(updateRes);
      form.resetDirty();
      notifications.show({
        title: 'Modification de la mission',
        message: 'Mission modifiée avec succès',
        color: 'green',
        autoClose: 4e3,
      });
    }
    setReadonly(true);
  }

  const sectorSearchChange = useDebouncedCallback(handleSectorSearch, 300);

  const options = (sectorsData || []).map((item) => (
    <Combobox.Option key={item.id} value={item.id}>
      {formatSectorName(item)}
    </Combobox.Option>
  ));

  function handleComboOptionSubmit(val: string) {
    const selectedSector = sectorsData.find((sector) => sector.id === val) || missionData.sector;
    setComboValue(selectedSector);
    setComboSearch(formatSectorName(selectedSector));
    form.setFieldValue('sectorId', selectedSector?.id);
    combobox.closeDropdown();
  }

  function handleComboInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    combobox.openDropdown();
    combobox.updateSelectedOptionIndex();
    setComboSearch(event.currentTarget.value);
    sectorSearchChange(event.currentTarget.value);
  }

  async function handleDelete() {
    modals.openConfirmModal({
      title: 'Supprimer cette mission',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer cette mission ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchMission('delete', [{ where: { id: missionData.id } }], '/');
        if (!deleteRes) {
          notifications.show({
            title: 'Erreur',
            message: 'Erreur lors de la suppression de la mission',
            color: 'red',
            autoClose: 4e3,
          });
        } else {
          notifications.show({
            title: 'Suppression de la mission',
            message: 'Mission supprimée avec succès',
            color: 'green',
            autoClose: 4e3,
          });
        }
        setLoading(false);
        redirect('/admin/missions');
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
              key={form.key('sectorId')}
              {...defaultProps('sectorId')}
              rightSection={
                readOnly ? null : sectorsLoading ? <Loader size={18} /> : <Combobox.Chevron />
              }
              label='Secteur'
              rightSectionPointerEvents='none'
              value={comboSearch}
              onChange={handleComboInputChange}
              onClick={() => !readOnly && combobox.openDropdown()}
              onFocus={() => !readOnly && combobox.openDropdown()}
              onBlur={() => {
                if (readOnly) return;
                combobox.closeDropdown();
                setComboSearch(comboValue ? formatSectorName(comboValue) : comboSearch || '');
              }}
              placeholder='Rechercher un secteur'
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {loading ? (
                <Combobox.Empty>Chargement...</Combobox.Empty>
              ) : options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>Aucun secteur trouvé</Combobox.Empty>
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
