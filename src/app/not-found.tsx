import { Anchor } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center text-center text-gray-800'>
      <h1 className='m-0 text-6xl font-bold'>404</h1>
      <h2 className='mt-4 text-2xl'>Page introuvable</h2>
      <p className='mt-2 mb-6 text-lg'>
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Anchor
        component={Link}
        href='/'
        className='rounded bg-blue-500 px-6 py-3 text-white transition hover:bg-blue-600'
      >
        Retour à l&apos;accueil
      </Anchor>
    </div>
  );
}
