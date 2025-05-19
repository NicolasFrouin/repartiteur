'use client';

import { Badge, Tooltip } from '@mantine/core';

interface Props {
  color: string | null;
}

export default function ColorCell({ color }: Props) {
  return (
    <Tooltip label={color} withArrow disabled={!Boolean(color)}>
      <Badge variant='filled' w={24} h={24} color={color || 'transparent'} />
    </Tooltip>
  );
}
