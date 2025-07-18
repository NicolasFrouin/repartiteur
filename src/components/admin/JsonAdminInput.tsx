'use client';

import { Box, Button, JsonInput, Stack, Title } from '@mantine/core';
import { useEffect, useState } from 'react';

export default function JsonAdminInput() {
  const [jsonData, setJsonData] = useState('');

  useEffect(() => {
    console.log('JSON Data:', jsonData);
  }, [jsonData]);

  return (
    <Box>
      <Stack className='rounded-md bg-white p-4 shadow-md'>
        <Title order={2}>Import de données JSON</Title>
        <JsonInput
          label='JSON Input'
          placeholder='Enter JSON data'
          minRows={4}
          maxRows={8}
          value={jsonData}
          onChange={setJsonData}
        />
        <Button>Importer</Button>
      </Stack>
    </Box>
  );
}
