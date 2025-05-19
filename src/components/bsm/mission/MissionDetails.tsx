'use client';

import { fetchMission, fetchSector } from '@/actions/common';
import ComboboxAsyncCommon from '@/components/common/form/ComboboxAsyncCommon';
import { Sector } from '@/generated/client';
import { debounce } from '@/lib/utils';
import { FullMission } from '@/types/utils';
import {
  Button,
  ColorInput,
  Combobox,
  Group,
  Input,
  Stack,
  Switch,
  TextInput,
  useCombobox,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { z } from 'zod';

function formatSectorName(sector: FullMission['sector']) {
  return `${sector.name} (${sector.branch.name})`;
}

interface Props {
  mission: FullMission;
}

export default function MissionDetails({ mission }: Props) {
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadonly] = useState(true);
  const [missionData, setMissionData] = useState<FullMission>(mission);
  const [sectorsData, setSectorsData] = useState<FullMission['sector'][]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (sectorsData.length === 0 && !sectorsLoading) {
        handleSectorSearch('').then(() => combobox.resetSelectedOption());
      }
    },
  });
  const [comboSearch, setComboSearch] = useState(formatSectorName(mission.sector) || '');
  const [comboValue, setComboValue] = useState<Sector | null>(mission.sector);

  const schema = z.object({
    name: z.string().min(1, { message: 'Nom requis' }),
    color: z.string().min(1, { message: 'Couleur requise' }),
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

  async function handleSectorSearch(query?: string): Promise<FullMission['sector'][]> {
    setSectorsLoading(true);
    const fetchRes = await fetchSector('findMany', [
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
    ]).catch(() => []);
    setSectorsLoading(false);

    return fetchRes;
  }

  function handleCancel() {
    setReadonly(true);
    form.reset();
    form.resetDirty();
    setComboSearch(formatSectorName(mission.sector) || '');
    setComboValue(mission.sector);
  }

  async function handleSubmit(values: typeof form.values) {
    console.log({ values });

    setLoading(true);
    const updateRes = await fetchMission(
      'update',
      [
        {
          where: { id: mission.id },
          data: {
            name: values.name,
            color: values.color,
            active: values.active,
            sector: { connect: { id: comboValue?.id } },
          },
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
    }
    setReadonly(true);
    setMissionData(updateRes);
    form.setValues(updateRes);
    form.resetDirty();
    notifications.show({
      title: 'Modification de la mission',
      message: 'Mission modifiée avec succès',
      color: 'green',
      autoClose: 4e3,
    });
    setLoading(false);
  }

  const sectorSearchChange = useDebouncedCallback(handleSectorSearch, 300);

  function renderOption(option: FullMission['sector']) {
    return (
      <Combobox.Option key={option.id} value={option.id}>
        {formatSectorName(option)}
      </Combobox.Option>
    );
  }

  const options = (sectorsData || []).map((item) => (
    <Combobox.Option key={item.id} value={item.id}>
      {item.name} ({item.branch.name})
    </Combobox.Option>
  ));

  function handleComboOptionSubmit(val: string) {
    const selectedSector = sectorsData.find((sector) => sector.id === val) || mission.sector;
    setComboValue(selectedSector);
    setComboSearch(formatSectorName(selectedSector));
    form.setFieldValue('sectorId', selectedSector?.id);
    combobox.closeDropdown();
  }

  function handleComboInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log('MissionDetails::handleComboInputChange', this, event);

    combobox.openDropdown();
    combobox.updateSelectedOptionIndex();
    setComboSearch(event.target.value);
    sectorSearchChange(event.target.value);
  }

  useEffect(() => {
    console.log({ comboValue, comboSearch, sectorsData });
  }, [comboSearch, comboValue, sectorsData]);

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

        <ComboboxAsyncCommon<FullMission['sector']>
          inputKey={form.key('sectorId')}
          defaultProps={defaultProps('sectorId')}
          readOnly={readOnly}
          visuals={{ label: 'Secteur', placeholder: 'Sélectionner un secteur' }}
          search={comboSearch}
          setSearch={setComboSearch}
          fetchData={handleSectorSearch}
          renderOption={renderOption}
          handleComboOptionSubmit={handleComboOptionSubmit}
          handleComboInputChange={handleComboInputChange}
        />

        <Group justify='center' mt='xl'>
          {readOnly ? (
            <Button onClick={() => setReadonly(false)}>Modifier</Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant='subtle'>
                Annuler
              </Button>
              <Button type='submit' loading={sectorsLoading}>
                Enregistrer
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </form>
  );
}
