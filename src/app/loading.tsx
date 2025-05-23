import { MAIN_CONTENT_HEIGHT } from '@/lib/utils';
import { Loader } from '@mantine/core';

export default function Loading() {
  return (
    <div className={`flex ${MAIN_CONTENT_HEIGHT} items-center justify-center`}>
      <Loader />
    </div>
  );
}
