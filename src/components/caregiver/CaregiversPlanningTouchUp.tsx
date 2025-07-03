'use client';

import { Assignment, Branch, Caregiver, Mission, Sector } from '@/generated/client';
import { cn, formatDate, getFirstDayOfWeek, getWeekDays, getWeekNumber } from '@/lib/utils';
import { BSM, FullAssignment } from '@/types/utils';
import { Box, Mark, Modal, ScrollArea, ScrollAreaProps, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import AssignmentForm, { ModalData } from '../planner/AssignmentForm';

type FullSector = Sector & { missions: Mission[] };
type FullBranch = Branch & { sectors: FullSector[] };

interface Props {
  weekNumber?: number;
  options?: Partial<{ ScrollArea: ScrollAreaProps }>;
  assignmentsData?: FullAssignment[];
  branchesData?: BSM[];
  setWeekCalendar: (value: FullAssignment[] | null) => void;
  forbiddenSectors?: Record<Caregiver['id'], Sector['id'][]>;
}

export default function CaregiversPlanningTouchUp({
  weekNumber = getWeekNumber(),
  assignmentsData = [],
  branchesData = [],
  setWeekCalendar = () => {},
  options = {},
  forbiddenSectors = {},
}: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const caregiverCache = new Map<string, string[]>();
  const days = getWeekDays(getFirstDayOfWeek(weekNumber));

  function getBranchSpan(b: FullBranch) {
    return b.sectors.reduce((acc: number, s: FullSector) => acc + getSectorSpan(s), 0);
  }

  function getSectorSpan(s: FullSector) {
    return s.missions.reduce((acc: number, m: Mission) => acc + getMissionSpan(m), 0);
  }

  function getMissionSpan(m: Mission) {
    return m.max ?? 1;
  }

  function getCaregiverAssigned(m: Mission, day: Date) {
    const key = `${m.id}-${formatDate(day)}`;
    const caregiversForKey = caregiverCache.get(key) ?? [];
    const caregivers = assignmentsData
      .filter((a: Assignment) => !caregiversForKey.includes(a.caregiverId))
      .filter(
        (a: Assignment) =>
          a.missionId === m.id && formatDate(a.date).localeCompare(formatDate(day)) === 0,
      );

    const returnCaregiver = caregivers[0] ?? null;
    if (returnCaregiver) {
      caregiverCache.set(key, [...caregiversForKey, returnCaregiver.caregiverId]);
      return returnCaregiver;
    }
    return null;
  }

  function handleCaregiverAssignmentClick(data: ModalData) {
    setModalData(data);
    open();
  }

  return (
    <Box>
      <Text id={'caption'} fw={'bolder'} ta={'center'} mb={'md'}>
        Répartition de la semaine {weekNumber}
      </Text>
      <ScrollArea
        type='always'
        className={cn(`scrollbarY:z-10`, options.ScrollArea?.className)}
        offsetScrollbars
        {...options.ScrollArea}
      >
        <Table
          withColumnBorders
          withTableBorder
          stickyHeader
          stickyHeaderOffset={-2}
          captionSide='top'
          mr={'xl'}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Branche</Table.Th>
              <Table.Th>Secteur</Table.Th>
              <Table.Th>Mission</Table.Th>
              <Table.Th style={{ backgroundColor: 'black' }} p={1} />
              {days.map(formatDate).map((day) => (
                <Table.Th key={day} className='whitespace-nowrap capitalize'>
                  <span>{day.replace(/ .*/, '')}</span>
                  <br />
                  <span>{day.replace(/.*? /, '')}</span>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {branchesData.map((b) => {
              return b.sectors.map((s: FullSector, si: number) => {
                return s.missions.map((m: Mission, mi: number) => {
                  const toPrint = [];
                  for (let i = 0; i < getMissionSpan(m); i++) {
                    toPrint.push(
                      <Table.Tr
                        key={`${m.id}-${i}`}
                        className='!border-y-black [&>td]:text-center'
                        aria-label={`Branche ${b.name}, secteur ${s.name}, mission ${m.name}`}
                      >
                        {si === 0 && mi === 0 && i === 0 && (
                          <Table.Th
                            rowSpan={getBranchSpan(b)}
                            styles={{ th: { backgroundColor: b.color ?? undefined } }}
                            color={b.color ?? undefined}
                          >
                            {b.name}
                          </Table.Th>
                        )}
                        {mi === 0 && i === 0 && (
                          <Table.Th
                            rowSpan={getSectorSpan(s)}
                            styles={{ th: { backgroundColor: s.color ?? undefined } }}
                          >
                            {s.name}
                          </Table.Th>
                        )}
                        {i === 0 && (
                          <Table.Th
                            rowSpan={getMissionSpan(m)}
                            className='sticky whitespace-pre-wrap'
                            styles={{ th: { backgroundColor: m.color ?? undefined } }}
                          >
                            {m.name || ' '}
                          </Table.Th>
                        )}
                        <Table.Td style={{ backgroundColor: 'black' }} p={1}></Table.Td>
                        {days.map((day: Date, di: number) => {
                          const assignment = getCaregiverAssigned(m, day);
                          return assignment ? (
                            <Table.Td
                              key={`${m.id}-${i}-${di}`}
                              styles={{ td: { backgroundColor: assignment.color ?? undefined } }}
                              className='cursor-pointer hover:!bg-blue-500/20 hover:inset-ring-2 hover:inset-ring-blue-500'
                              onClick={handleCaregiverAssignmentClick.bind(null, {
                                assignment,
                                branch: b,
                                sector: s,
                                mission: m,
                                date: day,
                              })}
                            >
                              <Mark color={assignment.caregiver.color || 'transparent'}>
                                {[
                                  assignment.caregiver.firstname,
                                  assignment.caregiver.lastname,
                                ].join(' ')}
                              </Mark>
                            </Table.Td>
                          ) : (
                            <Table.Td
                              key={`${m.id}-${i}-${di}`}
                              className='cursor-pointer hover:!bg-blue-500/20 hover:inset-ring-2 hover:inset-ring-blue-500'
                              onClick={handleCaregiverAssignmentClick.bind(null, {
                                assignment: null,
                                branch: b,
                                sector: s,
                                mission: m,
                                date: day,
                              })}
                            >
                              /
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>,
                    );
                  }
                  return toPrint;
                });
              });
            })}
          </Table.Tbody>
        </Table>
        <Modal
          opened={opened}
          onClose={close}
          size={'md'}
          centered
          title={
            <Text>
              Affectation à la mission `
              <Text fw={'bold'} component='span'>
                {modalData?.mission.name}
              </Text>
              ` ({modalData?.branch.name} {'→'} {modalData?.sector.name}) du{' '}
              {modalData?.date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          }
          overlayProps={{ opacity: 0.55, blur: 5 }}
        >
          <AssignmentForm
            data={modalData}
            close={close}
            refresh={setWeekCalendar.bind(null, null)}
            forbiddenSectors={forbiddenSectors}
          />
        </Modal>
      </ScrollArea>
    </Box>
  );
}
