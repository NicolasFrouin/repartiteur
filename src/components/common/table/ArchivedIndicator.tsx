import { Tooltip, Stack, Text, ActionIcon } from '@mantine/core';
import { FaTrash } from 'react-icons/fa6';

interface Props {
  archived?: boolean;
  content?: React.ReactNode;
}

export default function ArchivedIndicator({ archived, content }: Props) {
  if (!archived) {
    return null;
  }

  let tooltipContent: React.ReactNode;

  const tooltipText = content || 'Ces données sont archivées.';

  if (typeof content === 'string') {
    tooltipContent = <Text>{tooltipText}</Text>;
  } else {
    tooltipContent = content;
  }

  return (
    <Tooltip
      label={
        <Stack gap={0} align='center'>
          {tooltipContent}
          <Text fs={'italic'} fz='xs' c='dimmed'>
            Les données archivées sont uniquement conservées à des fins de référence.
          </Text>
        </Stack>
      }
    >
      <ActionIcon
        variant='transparent'
        color='gray'
        size={16}
        ml={4}
        radius='xl'
        title='Utilisateur archivé'
      >
        <FaTrash size={12} />
      </ActionIcon>
    </Tooltip>
  );
}
