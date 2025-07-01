'use client';

import { fetchBranch, fetchCaregiver } from '@/actions/common';
import { CaregiverBigWeekType, CaregiverTime, Sector } from '@/generated/client';
import { BIG_WEEK_DAYS, getWeekDay, getWeekNumber, toSlug } from '@/lib/utils';
import { FullBranch, FullCaregiver } from '@/types/utils';
import {
  ActionIcon,
  Box,
  Button,
  ColorInput,
  Combobox,
  Group,
  Input,
  MultiSelect,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { zodResolver } from 'mantine-form-zod-resolver';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import BranchSelector from './BranchSelector';
import { FaFill } from 'react-icons/fa6';

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
  assignedSectors: [] as Data['assignedSectors'],
} as Data;

interface Props {
  caregiver?: Data;
  userId: string;
}

export default function CaregiverDetails({ caregiver = defaultCaregiver, userId }: Props) {
  const isCreating = !Boolean(caregiver.id);

  const [sectorsData, setSectorsData] = useState<Sector[]>([]);

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(!isCreating);
  const [caregiverData, setCaregiverData] = useState<Data>({
    ...caregiver,
    linkedSectors: caregiver.assignedSectors.map((s) => ({ id: s.sectorId }) as Sector),
  });

  const [branchComboValue, setBranchComboValue] = useState<Data['branch'] | FullBranch | null>(
    caregiver.branch || null,
  );
  const isEvenWeek = getWeekNumber() % 2 === 0;

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
    linkedSectors: z.array(z.object({ id: z.string() })).optional(),
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

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setBranchComboValue(caregiver.branch || null);
    form.setFieldValue('branchId', caregiver.branch?.id || '');
    form.setFieldValue(
      'linkedSectors',
      caregiver.assignedSectors.map((s) => ({ id: s.sectorId }) as Sector),
    );
  }

  async function handleCreate(values: typeof form.values) {
    // Validate sectors before creating
    const validSectors = (values.linkedSectors || []).filter((sector) =>
      sectorsData.some((sectorData) => sectorData.id === sector.id),
    );

    const createRes: Data | null = await fetchCaregiver(
      'create',
      [
        {
          // @ts-expect-error ---
          data: {
            firstname: values.firstname,
            lastname: values.lastname,
            slug: toSlug([values.firstname, values.lastname].join(' ')),
            time: CaregiverTime.DAY,
            bigWeekType: values.bigWeekType,
            color: values.color,
            active: values.active,
            createdById: userId,
            updatedById: userId,
            branchId: branchComboValue?.id,
            assignedSectors: {
              createMany: {
                data: validSectors.map((sector) => ({
                  sectorId: sector.id,
                  createdById: userId,
                  updatedById: userId,
                })),
              },
            },
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
            slug: toSlug([values.firstname, values.lastname].join(' ')),
            bigWeekType: values.bigWeekType,
            color: values.color,
            branchId: branchComboValue?.id,
            active: values.active,
            updatedById: userId,
            assignedSectors: {
              deleteMany: {
                caregiverId: caregiver.id,
                OR: [{ archived: true }, { archived: false }],
              },
              createMany: {
                data: (values.linkedSectors || []).map((sector) => ({
                  sectorId: sector.id,
                  createdById: userId,
                  updatedById: userId,
                })),
              },
            },
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
      return;
    }

    setCaregiverData(updateRes);
    form.setValues(updateRes);
    form.resetDirty();
    notifications.show({
      title: 'Modification de soignant',
      message: 'Soignant modifié avec succès',
      color: 'green',
      autoClose: 4e3,
    });
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
      title: 'Supprimer ce soignant',
      centered: true,
      labels: { confirm: 'Supprimer', cancel: 'Annuler' },
      confirmProps: { color: 'red' },
      children: <Text>Êtes-vous sûr de vouloir supprimer ce soignant ?</Text>,
      async onConfirm() {
        setLoading(true);
        const deleteRes = await fetchCaregiver(
          'delete',
          [{ where: { id: caregiver.id }, include: { assignedSectors: true, assignments: true } }],
          '/',
        );
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

  function selectAllSectors() {
    if (!branchComboValue?.id) return;
    const allSectors = sectorsData.map((sector) => ({ id: sector.id }) as Sector);
    form.setFieldValue('linkedSectors', allSectors);
  }

  useEffect(() => {
    if (branchComboValue?.id) {
      fetchBranch('findUnique', [
        { where: { id: branchComboValue.id, active: true }, include: { sectors: true } },
      ]).then((branch) => {
        if (branch) {
          setSectorsData(branch.sectors);
        }
      });
    } else {
      setSectorsData([]);
      form.setFieldValue('linkedSectors', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchComboValue?.id]);

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

        <BranchSelector
          value={branchComboValue}
          onChange={(branch) => {
            setBranchComboValue(branch as Data['branch']);
            form.setFieldValue('branchId', branch?.id || '');
            form.setFieldValue('linkedSectors', []);
          }}
          readOnly={readOnly}
          required={form.isDirty('branchId')}
          error={form.getInputProps('branchId').error}
          size='md'
        />

        <MultiSelect
          label='Secteurs associés'
          placeholder={
            form.getInputProps('linkedSectors').value?.length ? undefined : 'Aucun secteur associé'
          }
          key={form.key('linkedSectors')}
          {...defaultProps('linkedSectors', 'styles.required')}
          searchable
          leftSection={
            !readOnly && (
              <Tooltip
                label='Ajouter tous les secteurs de la branche sélectionnée'
                position='top'
                withArrow
              >
                <ActionIcon onClick={selectAllSectors} disabled={!branchComboValue?.id}>
                  <FaFill />
                </ActionIcon>
              </Tooltip>
            )
          }
          rightSection={readOnly ? <div /> : <Combobox.Chevron />}
          value={
            form.getInputProps('linkedSectors').value?.map((sector: Sector) => sector.id) || []
          }
          onChange={(sectorIds) => {
            const selectedSectors = sectorsData.filter((sector) => sectorIds.includes(sector.id));
            form.setFieldValue('linkedSectors', selectedSectors);
          }}
          data={sectorsData.map((sector) => ({
            value: sector.id,
            label: sector.name || 'Secteur sans nom',
          }))}
          disabled={!branchComboValue?.id}
        />

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
