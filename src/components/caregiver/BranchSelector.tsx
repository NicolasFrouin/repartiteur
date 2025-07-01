'use client';

import { fetchBranch } from '@/actions/common';
import { Branch } from '@/generated/client';
import { cn } from '@/lib/utils';
import { FullBranch } from '@/types/utils';
import { CheckIcon, Combobox, Group, InputBase, Loader, useCombobox } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';

type ValueType = Branch | FullBranch | null;

interface Props {
  value: ValueType;
  onChange: (branch: FullBranch | null) => void;
  onSearchChange?: (search: string) => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  searchValue?: string;
}

function formatBranchName(branch?: ValueType) {
  return branch?.name || '';
}

export default function BranchSelector({
  value,
  onChange,
  onSearchChange,
  readOnly = false,
  label = 'Branche',
  placeholder = 'Rechercher une branche',
  required = false,
  error,
  size = 'md',
  searchValue: externalSearchValue,
}: Props) {
  const [branchesData, setBranchesData] = useState<FullBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [internalSearchValue, setInternalSearchValue] = useState(formatBranchName(value) || '');
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

  const searchValue = externalSearchValue ?? internalSearchValue;

  const branchCombobox = useCombobox({
    onDropdownClose: () => branchCombobox.resetSelectedOption(),
    onDropdownOpen: () => {
      const currentSearch = searchValue || '';
      setInternalSearchValue('');
      if (onSearchChange) {
        onSearchChange('');
      }
      if (branchesData.length === 0 && !branchesLoading && !hasInitiallyFetched) {
        handleBranchSearch(currentSearch);
      }
      branchCombobox.resetSelectedOption();
    },
  });

  const handleBranchSearch = useCallback(async (query: string) => {
    setBranchesLoading(true);

    try {
      const branches = await fetchBranch('findMany', [
        {
          where: { OR: [{ name: { contains: query } }, { id: query }], active: true },
          include: { sectors: true },
          take: 25,
          orderBy: { name: 'asc' },
        },
      ]);
      setBranchesData(branches || []);
      setHasInitiallyFetched(true);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranchesData([]);
      setHasInitiallyFetched(true);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const branchSearchChange = useDebouncedCallback(handleBranchSearch, 300);

  function handleBranchComboOptionSubmit(branchId: string) {
    if (readOnly || branchesLoading) return;

    const selectedBranch = branchesData.find((branch) => branch.id === branchId) || null;
    onChange(selectedBranch);

    const branchName = formatBranchName(selectedBranch);
    setInternalSearchValue(branchName);
    if (onSearchChange) {
      onSearchChange(branchName);
    }

    branchCombobox.closeDropdown();
  }

  function handleComboInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (readOnly) return;

    branchCombobox.openDropdown();
    branchCombobox.updateSelectedOptionIndex();

    const newValue = event.currentTarget.value;
    setInternalSearchValue(newValue);
    if (onSearchChange) {
      onSearchChange(newValue);
    }

    branchSearchChange(newValue);
  }

  function handleBlur() {
    if (readOnly) return;

    branchCombobox.closeDropdown();

    const fallbackValue = value ? formatBranchName(value) : searchValue || '';
    setInternalSearchValue(fallbackValue);
    if (onSearchChange) {
      onSearchChange(fallbackValue);
    }
  }

  useEffect(() => {
    if (branchesData.length === 0 && !branchesLoading) {
      handleBranchSearch('');
    }
  }, [handleBranchSearch, branchesData.length, branchesLoading]);

  useEffect(() => {
    const newSearchValue = formatBranchName(value) || '';
    setInternalSearchValue(newSearchValue);
    if (onSearchChange) {
      onSearchChange(newSearchValue);
    }
  }, [value, onSearchChange]);

  const branchesOptions = (branchesData || []).map((item) => (
    <Combobox.Option
      key={item.id}
      value={item.id}
      className={cn({ '!bg-blue-100': item.id === value?.id })}
    >
      <Group align='center' gap='xs'>
        {item.id === value?.id && <CheckIcon size={14} />}
        {formatBranchName(item)}
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox store={branchCombobox} onOptionSubmit={handleBranchComboOptionSubmit}>
      <Combobox.Target>
        <InputBase
          label={label}
          size={size}
          error={error}
          withAsterisk={required}
          readOnly={readOnly}
          pointer={!readOnly && !branchesLoading && !branchCombobox.dropdownOpened}
          rightSection={
            readOnly ? null : branchesLoading ? <Loader size={18} /> : <Combobox.Chevron />
          }
          rightSectionPointerEvents='none'
          value={searchValue}
          onChange={handleComboInputChange}
          onClick={() => !readOnly && branchCombobox.openDropdown()}
          onFocus={() => !readOnly && branchCombobox.openDropdown()}
          onBlur={handleBlur}
          placeholder={placeholder}
          styles={required ? { required: { color: 'blue' } } : undefined}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {branchesLoading ? (
            <Combobox.Empty>Chargement...</Combobox.Empty>
          ) : branchesOptions.length > 0 ? (
            branchesOptions
          ) : (
            <Combobox.Empty>Aucune branche trouvée</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
