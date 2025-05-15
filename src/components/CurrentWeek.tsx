import { getBranchesToMissions, getWeekAssignmentsData } from '@/actions/data';
import CaregiversPlanning from './CaregiversPlanning';

export default async function CurrentWeek() {
  const branchesData = await getBranchesToMissions();
  const assignmentsData = await getWeekAssignmentsData();

  return <CaregiversPlanning assignmentsData={assignmentsData} branchesData={branchesData} />;
}
