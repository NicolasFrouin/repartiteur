import Login from '@/components/admin/Login';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion - Répartiteur APHP',
  description: "Connectez-vous à l'espace d'administration de l'application de répartition",
};

interface Props {
  searchParams: { callbackUrl?: string; error?: string };
}

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <div className='flex flex-1 items-center justify-center'>
      <Login searchParams={searchParams} />
    </div>
  );
}
