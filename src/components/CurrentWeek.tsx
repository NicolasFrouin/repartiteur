import { getBranchesToMissions, getWeekAssignmentsData } from '@/actions/data';
import EnhancedCaregiversPlanning from './caregiver/EnhancedCaregiverPlanning';

export default async function CurrentWeek() {
  const branchesData = await getBranchesToMissions();
  const assignmentsData = await getWeekAssignmentsData();

  return (
    <EnhancedCaregiversPlanning assignmentsData={assignmentsData} branchesData={branchesData} />
  );
}
