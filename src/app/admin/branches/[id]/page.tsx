import prisma from '@/prisma';

interface Props {
  params: { id: string };
}

export default async function Page({ params: { id } }: Props) {
  const branch = await prisma.branch.findUnique({
    where: { id: id },
    include: { caregivers: true, sectors: true },
  });

  if (!branch) {
    return <div>Branch not found</div>;
  }

  return (
    <div>
      <h1>{branch.name}</h1>
      <p>Caregivers: {branch.caregivers.length}</p>
      <p>Sectors: {branch.sectors.length}</p>
    </div>
  );
}
