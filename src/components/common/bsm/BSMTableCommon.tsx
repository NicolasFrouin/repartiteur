'use client';

import {
  Box,
  Flex,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Table,
  TableProps,
} from '@mantine/core';
import { useEffect, useState } from 'react';

interface Props {
  tableData: TableProps['data'];
  fetcher: (page: number, pageSize: number) => Promise<void>;
  total?: number;
}

export default function BSMTableCommon({ tableData, fetcher, total = 0 }: Props) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      if (!fetcher) return;

      setLoading(true);
      await fetcher(page, pageSize);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  return (
    <Flex direction={'column'} gap={'md'}>
      <Box pos={'relative'}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <ScrollArea type={'auto'}>
          <Table highlightOnHover data={tableData} />
        </ScrollArea>
      </Box>
      <Group justify={'center'} mt={'md'}>
        <Pagination
          total={Math.ceil(total / pageSize)}
          value={page}
          onChange={setPage}
          siblings={2}
        />
      </Group>
    </Flex>
  );
}
