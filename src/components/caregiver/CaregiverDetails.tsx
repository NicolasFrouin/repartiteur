'use client';

import { fetchBranch, fetchCaregiver } from '@/actions/common';
import { CaregiverBigWeekType, CaregiverTime, Sector } from '@/generated/client';
import { BIG_WEEK_DAYS, getWeekDay, getWeekNumber, toSlug } from '@/lib/utils';
import { FullCaregiver } from '@/types/utils';
import {
  Box,
  Button,
  Checkbox,
  ColorInput,
  Combobox,
  Group,
  Input,
  InputBase,
  Loader,
  Pill,
  PillsInput,
  SegmentedControl,
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

type Data = FullCaregiver & { linkedSectors?: Sector[] };

const defaultCaregiver = {
  id: '',
  firstname: '',
  lastname: '',
  slug: '',
  color: '',
  bigWeekType: CaregiverBigWeekType.EVEN,
  active: true,
  branchId: '',
  sectors: [] as Data['sectors'],
} as Data;

function formatBranchName(branch?: Data['branch']) {
  return branch?.name || '';
}

interface Props {
  caregiver?: Data;
  userId: string;
}

export default function CaregiverDetails({ caregiver = defaultCaregiver, userId }: Props) {
  const isCreating = !Boolean(caregiver.id);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [caregiverData, setCaregiverData] = useState<Data>({
    ...caregiver,
    linkedSectors: caregiver.sectors.map((s) => ({ id: s.sectorId }) as Sector),
  });

  const [branchesData, setBranchesData] = useState<Data['branch'][]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchComboSearch, setBranchComboSearch] = useState(
    formatBranchName(caregiver.branch) || '',
  );
  const [branchComboValue, setBranchComboValue] = useState<Data['branch'] | null>(
    caregiver.branch || null,
  );

  const [sectorsData, setSectorsData] = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);

  const isEvenWeek = getWeekNumber() % 2 === 0;

  const branchCombobox = useCombobox({
    onDropdownClose: () => branchCombobox.resetSelectedOption(),
    onDropdownOpen: () => {
      setBranchComboSearch('');
      if (branchesData.length === 0 && !branchesLoading) {
        handleBranchSearch('').then(() => branchCombobox.resetSelectedOption());
      }
    },
  });
  const sectorsCombobox = useCombobox({
    onDropdownClose: () => sectorsCombobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (sectorsData.length === 0) {
        fetchBranchSectors(caregiverData.branchId || '').then(() =>
          sectorsCombobox.resetSelectedOption(),
        );
      }
    },
  });

  const schema = z.object({
    firstname: z.string().min(1, 'Prénom requis'),
    lastname: z.string().min(1, 'Nom requis'),
    bigWeekType: z.enum([CaregiverBigWeekType.EVEN, CaregiverBigWeekType.ODD]),
    color: z
      .string({ coerce: true })
      .startsWith('#', 'Seules les couleurs au format hexadécimal sont acceptées (#6c0277)')
      .optional()
      .or(z.literal('')),
    branchId: z.string().min(1, 'Branche requise'),
    sectors: z.array(z.object({ sectorId: z.string() })).optional(),
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
      .then((branches: Data['branch'][]) => setBranchesData(branches))
      .catch(() => setBranchesData([]))
      .finally(() => setBranchesLoading(false));
  }

  async function fetchBranchSectors(branchId: Data['branch']['id']) {
    console.log('fetchBranchSectors :', branchId);
    if (!branchId) return;
    setSectorsLoading(true);
    await fetchBranch('findUnique', [
      { where: { id: branchId, active: true }, include: { sectors: true } },
    ])
      .then((branch) => {
        if (branch) {
          setSectorsData(branch.sectors);
        }
      })
      .catch(() => setSectorsData([]))
      .finally(() => setSectorsLoading(false));
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setBranchComboSearch(formatBranchName(caregiver.branch) || '');
    setBranchComboValue(caregiver.branch || null);
  }

  async function handleCreate(values: typeof form.values) {
    const createRes: Data | null = await fetchCaregiver(
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
            branch: { connect: { id: branchComboValue?.id } },
            active: values.active,
            createdBy: { connect: { id: userId } },
            updatedBy: { connect: { id: userId } },
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
    const updateRes: Data | null = await fetchCaregiver(
      'update',
      [
        {
          data: {
            firstname: values.firstname,
            lastname: values.lastname,
            bigWeekType: values.bigWeekType,
            color: values.color,
            branch: { connect: { id: branchComboValue?.id } },
            active: values.active,
            updatedBy: { connect: { id: userId } },
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

  function handleComboOptionSubmit(val: string) {
    const selectedBranch = branchesData.find((branch) => branch.id === val) || caregiver.branch;
    setBranchComboValue(selectedBranch);
    setBranchComboSearch(formatBranchName(selectedBranch));
    form.setFieldValue('branchId', selectedBranch?.id);
    fetchBranchSectors(selectedBranch?.id);
    branchCombobox.closeDropdown();
  }

  function handleComboInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    branchCombobox.openDropdown();
    branchCombobox.updateSelectedOptionIndex();
    setBranchComboSearch(event.currentTarget.value);
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
            color='blue'
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

        <Combobox
          store={branchCombobox}
          withinPortal={false}
          onOptionSubmit={handleComboOptionSubmit}
        >
          <Combobox.Target>
            <InputBase
              key={form.key('branchId')}
              {...defaultProps('branchId')}
              pointer={!readOnly && !branchesLoading && !branchCombobox.dropdownOpened}
              rightSection={
                readOnly ? null : branchesLoading ? <Loader size={18} /> : <Combobox.Chevron />
              }
              label='Branche'
              rightSectionPointerEvents='none'
              value={branchComboSearch}
              onChange={handleComboInputChange}
              onClick={() => !readOnly && branchCombobox.openDropdown()}
              onFocus={() => !readOnly && branchCombobox.openDropdown()}
              onBlur={() => {
                if (readOnly) return;
                branchCombobox.closeDropdown();
                setBranchComboSearch(
                  branchComboValue ? formatBranchName(branchComboValue) : branchComboSearch || '',
                );
              }}
              placeholder='Rechercher une branche'
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {branchesLoading ? (
                <Combobox.Empty>Chargement...</Combobox.Empty>
              ) : branchesData.length > 0 ? (
                (branchesData || []).map((item) => (
                  <Combobox.Option
                    key={item.id}
                    value={item.id}
                    selected={item.id === branchComboValue?.id}
                  >
                    {formatBranchName(item)}
                  </Combobox.Option>
                ))
              ) : (
                <Combobox.Empty>Aucune branche trouvée</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        <Combobox
          store={sectorsCombobox}
          withinPortal={false}
          onOptionSubmit={(value: string) => {
            if (readOnly || sectorsLoading) return;
            const sector = sectorsData.find((s) => s.id === value);
            if (sector) {
              const linkedSectors = form.getInputProps('linkedSectors').value || [];
              const sectorExists = linkedSectors.some((s: Sector) => s.id === sector.id);
              const updatedSectors = sectorExists
                ? linkedSectors.filter((s: Sector) => s.id !== sector.id)
                : [...linkedSectors, sector];
              form.setFieldValue('linkedSectors', updatedSectors);
            }
          }}
        >
          <Combobox.DropdownTarget>
            <PillsInput
              pointer={!readOnly}
              key={form.key('linkedSectors')}
              {...defaultProps('linkedSectors')}
              label='Secteurs associés'
              rightSection={
                readOnly ? null : sectorsLoading ? <Loader size={18} /> : <Combobox.Chevron />
              }
              onClick={() => !readOnly && sectorsCombobox.openDropdown()}
              onFocus={() => !readOnly && sectorsCombobox.openDropdown()}
            >
              <Pill.Group>
                {form.getInputProps('linkedSectors').value.length > 0 ? (
                  form
                    .getInputProps('linkedSectors')
                    .value.map((sector: Sector) => (
                      <Pill key={sector.id}>
                        {sectorsData.find((s) => s.id === sector.id)?.name || 'Secteur inconnu'}
                      </Pill>
                    ))
                ) : (
                  <Input.Placeholder>Aucun secteur associé</Input.Placeholder>
                )}
              </Pill.Group>
            </PillsInput>
          </Combobox.DropdownTarget>
          <Combobox.Dropdown>
            <Combobox.Options>
              {sectorsLoading ? (
                <Combobox.Empty>Chargement...</Combobox.Empty>
              ) : sectorsData.length > 0 ? (
                sectorsData.map((sector) => (
                  <Combobox.Option key={sector.id} value={sector.id}>
                    <Group align='center' gap='xs'>
                      <Checkbox
                        readOnly
                        checked={form
                          .getInputProps('linkedSectors')
                          .value.some((s: Sector) => s.id === sector.id)}
                      />
                      {sector.name}
                    </Group>
                  </Combobox.Option>
                ))
              ) : (
                <Combobox.Empty>Aucun secteur trouvé</Combobox.Empty>
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
