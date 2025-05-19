'use client';

import { debounce } from '@/lib/utils';
import { Combobox, InputBase, Loader, useCombobox } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useState } from 'react';

interface Props<T> {
  inputKey?: string;
  defaultProps?: Record<string, unknown>;
  readOnly?: boolean;
  loading?: boolean;
  search?: string;
  visuals?: {
    label?: React.ReactNode;
    placeholder?: string;
    loading?: React.ReactNode;
    empty?: React.ReactNode;
  };
  setSearch?: (search: string) => void;
  handleComboInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleComboOptionSubmit?: (option: string) => void;
  fetchData?: (query: string) => Promise<T[]>;
  renderOption?: (option: T, index: number) => React.ReactNode;
}

export default function ComboboxAsyncCommon<T = unknown>({
  inputKey = undefined,
  defaultProps = {},
  readOnly = false,
  loading = false,
  search = '',
  visuals = { loading: 'Chargement...', empty: 'Aucune donnée trouvée' },
  setSearch = () => {},
  handleComboInputChange = () => {},
  handleComboOptionSubmit = () => {},
  fetchData = () => Promise.resolve([]),
  renderOption = (option: T, index: number) => (
    <Combobox.Option key={index} value={String(option)}>
      {String(option)}
    </Combobox.Option>
  ),
}: Props<T>) {
  const [comboData, setComboData] = useState<T[]>([]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (options.length === 0 && !loading) {
        fetchData('')
          .then((res) => setComboData(res))
          .then(() => combobox.resetSelectedOption());
      }
    },
  });

  const options = (comboData || []).map(renderOption);

  return (
    <Combobox store={combobox} withinPortal={false} onOptionSubmit={handleComboOptionSubmit}>
      <Combobox.Target>
        <InputBase
          key={inputKey}
          {...defaultProps}
          rightSection={readOnly ? null : loading ? <Loader size={18} /> : <Combobox.Chevron />}
          label={visuals.label}
          rightSectionPointerEvents='none'
          value={search}
          onChange={handleComboInputChange}
          onClick={() => !readOnly && combobox.openDropdown()}
          onFocus={() => !readOnly && combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(search || '');
          }}
          placeholder={visuals.placeholder}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {loading ? (
            <Combobox.Empty>{visuals.loading}</Combobox.Empty>
          ) : options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>{visuals.empty}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
