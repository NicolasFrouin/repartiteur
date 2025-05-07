import prisma from '@/prisma';

interface Props {
  params: { id: string };
}

export default async function Page({ params: { id } }: Props) {
  const caregiver = await prisma.caregiver.findUnique({
    where: { id: id },
    include: { branch: true },
  });

  if (!caregiver) {
    return <div>Caregiver not found</div>;
  }

  return (
    <div>
      <h1>{caregiver?.firstname}</h1>
    </div>
  );
}
