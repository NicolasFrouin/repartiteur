import { auth } from '@/auth';
import NotAuthorized from '@/components/error/NotAuthorized';
import { Role } from '@/generated/client';
import { canAccess } from '@/lib/utils/auth';

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth();

  if (!canAccess(session?.user?.role, Role.SUPERADMIN)) {
    return <NotAuthorized />;
  }

  return children;
}
