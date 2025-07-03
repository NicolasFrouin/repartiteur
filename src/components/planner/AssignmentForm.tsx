'use client';

import { swapAssignmentCaregiver } from '@/actions/assignments';
import { fetchCaregiver } from '@/actions/common';
import { Caregiver, Mission, Sector } from '@/generated/client';
import { cn, toSlug } from '@/lib/utils';
import { FullAssignment, FullBranch, FullCaregiver } from '@/types/utils';
import {
  Box,
  Button,
  ColorInput,
  Combobox,
  ComboboxProps,
  Group,
  Switch,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export type ModalData = {
  assignment: FullAssignment | null;
  branch: FullBranch;
  sector: Sector;
  mission: Mission;
  date: Date;
};

const COLORS = {
  AFFECTED_CAN: '!bg-green-100',
  AFFECTED_CANNOT: '!bg-red-100',
  NOT_AFFECTED: '!bg-gray-100',
} as const;

interface Props {
  data: ModalData | null;
  close: () => void;
  refresh: () => void;
  forbiddenSectors?: Record<Caregiver['id'], Sector['id'][]>;
}

export default function AssignmentForm({ data, close, refresh, forbiddenSectors }: Props) {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(data?.assignment?.color || '');
  const [caregiversData, setCaregiversData] = useState<FullCaregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(
    data?.assignment?.caregiver || null,
  );
  const [searchValue, setSearchValue] = useState(
    data?.assignment?.caregiver
      ? [data.assignment.caregiver.firstname, data.assignment.caregiver.lastname].join(' ')
      : '',
  );
  const [deleteAssignment, setDeleteAssignment] = useState(false);

  const combobox = useCombobox();
  const shouldFilterOptions = !caregiversData.some((c) => c.slug === searchValue);
  const filteredOptions = shouldFilterOptions
    ? caregiversData.filter((c) =>
        c.slug?.toLowerCase().includes(toSlug(searchValue).toLowerCase().trim()),
      )
    : caregiversData;

  const options = filteredOptions.map((c) => {
    const isAffected = c.assignedSectors.some((s) => s.sectorId === data?.sector.id);
    const isForbidden = isAffected && forbiddenSectors?.[c.id]?.includes(data?.sector.id || '');
    const optionBgColor = isForbidden
      ? COLORS.AFFECTED_CANNOT
      : isAffected
        ? COLORS.AFFECTED_CAN
        : COLORS.NOT_AFFECTED;

    return (
      <Combobox.Option
        value={c.id}
        key={c.slug}
        className={cn('!border-x-4 hover:!bg-blue-100', optionBgColor)}
        styles={{ option: { borderInline: c.color || 'transparent' } }}
      >
        {[c.firstname, c.lastname].join(' ')}
      </Combobox.Option>
    );
  });

  const handleCaregiverSelection: ComboboxProps['onOptionSubmit'] = (value, props) => {
    const selected = caregiversData.find((c) => c.id === value) || null;
    setSelectedCaregiver(selected);
    setSearchValue(String(props.children));
    combobox.closeDropdown();
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !data ||
      (!selectedCaregiver && !deleteAssignment) ||
      (deleteAssignment && !data.assignment?.caregiver)
    ) {
      notifications.show({
        title: 'Modification impossible',
        message: 'Aucune donnée à modifier',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);

    const swapRes = await swapAssignmentCaregiver(
      {
        baseCaregiverId: data.assignment?.caregiver?.id || null,
        date: data.date,
        missionId: data.mission.id,
        selectedCaregiverId: deleteAssignment ? null : selectedCaregiver!.id,
        color,
      },
      session!.user.id,
    );
    if (!swapRes.success) {
      notifications.show({
        title: 'Erreur',
        message: swapRes.message || "Échec de la modification de l'affectation",
        color: 'red',
      });
      console.error('Swap assignment failed:', swapRes.details);
      return;
    }
    notifications.show({
      title: 'Succès',
      message: deleteAssignment
        ? 'Affectation supprimée avec succès'
        : 'Affectation modifiée avec succès',
      color: 'green',
    });
    refresh();
    setLoading(false);
    close();
  }

  useEffect(() => {
    async function fetchData() {
      const caregiverResult = await fetchCaregiver('findMany', [
        {
          where: { active: true, slug: { contains: toSlug(searchValue) } },
          include: { assignedSectors: true },
          orderBy: [{ lastname: 'asc' }, { firstname: 'asc' }],
        },
      ]).catch(() => []);

      setCaregiversData(caregiverResult);
    }

    fetchData();
  }, [searchValue]);

  if (!data) {
    return <Text>Aucune donnée disponible</Text>;
  }

  return (
    <Box className='px-[5%]'>
      <form onSubmit={handleSubmit}>
        <ColorInput
          label="Couleur de l'affectation"
          description="En cas de changement de soignant, la couleur de l'affectation sera conservée."
          value={color}
          onChange={setColor}
          size='md'
          mb='sm'
          className='mb-4'
          disabled={deleteAssignment}
        />
        <Combobox
          onOptionSubmit={handleCaregiverSelection}
          store={combobox}
          withinPortal={true}
          size='md'
          disabled={deleteAssignment}
        >
          <Combobox.Target>
            <TextInput
              label='Soignant affecté'
              placeholder='Entrez le nom du soignant...'
              description={
                <Box component='span' className='*:!text-sm'>
                  <Text>Vous pouvez affecté n&apos;importe quel soignant à cette mission.</Text>
                  <Text>Légende des couleurs de fond :</Text>
                  <Text>
                    -{' '}
                    <span className={cn(COLORS.AFFECTED_CAN, 'p-0.5')}>
                      Est affecté au secteur et autorisé
                    </span>
                  </Text>
                  <Text>
                    -{' '}
                    <span className={cn(COLORS.AFFECTED_CANNOT, 'p-0.5')}>
                      Est affecté au secteur mais interdit
                    </span>
                  </Text>
                  <Text>
                    -{' '}
                    <span className={cn(COLORS.NOT_AFFECTED, 'p-0.5')}>
                      N&apos;est pas affecté au secteur
                    </span>
                  </Text>
                </Box>
              }
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              rightSection={
                <Combobox.ClearButton
                  onClear={() => setSearchValue('')}
                  disabled={deleteAssignment}
                />
              }
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
              className='py-2'
              size='md'
              disabled={deleteAssignment}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options mah={250} className='overflow-y-auto'>
              {options.length === 0 ? (
                <Combobox.Empty>Aucun soignant trouvé</Combobox.Empty>
              ) : (
                options
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
        {data.assignment?.caregiver && (
          <Switch
            label="Supprimer l'affectation"
            description='Si coché, le soignant ne sera plus affecté à cette mission pour ce jour.'
            size='md'
            mb='sm'
            color='red'
            checked={deleteAssignment}
            onChange={(event) => setDeleteAssignment(event.currentTarget.checked)}
          />
        )}

        <Group gap='md' justify='center' mt='lg' className='!flex-col-reverse md:!flex-row'>
          <Button
            type='button'
            variant='outline'
            onClick={close}
            loading={loading}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type='submit'
            color={deleteAssignment ? 'red' : 'blue'}
            loading={loading}
            disabled={loading}
          >
            {deleteAssignment ? 'Supprimer' : 'Modifier'} l&apos;affectation
          </Button>
        </Group>
      </form>
    </Box>
  );
}
