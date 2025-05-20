import { Assignment, Branch, Mission, Sector } from '@/generated/client';
import { cn, formatDate, getWeekDays, getWeekNumber, MAIN_CONTENT_HEIGHT } from '@/lib/utils';
import { BSM, FullAssignment } from '@/types/utils';
import {
  Mark,
  ScrollArea,
  ScrollAreaProps,
  Table,
  TableCaption,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from '@mantine/core';

type FullSector = Sector & { missions: Mission[] };
type FullBranch = Branch & { sectors: FullSector[] };

interface Props {
  weekNumber?: number | string;
  options?: Partial<{ ScrollArea: ScrollAreaProps }>;
  assignmentsData?: FullAssignment[];
  branchesData?: BSM[];
}

export default function CaregiversPlanning({
  weekNumber = getWeekNumber(),
  assignmentsData = [],
  branchesData = [],
  options = {},
}: Props) {
  const caregiverCache = new Map<string, string[]>();
  const days = getWeekDays();

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

  return (
    <ScrollArea
      type='always'
      className={cn(`${MAIN_CONTENT_HEIGHT} scrollbarY:z-10`, options.ScrollArea?.className)}
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
        <TableCaption aria-labelledby={'caption'}>
          <Text id={'caption'} fw={'bolder'}>
            Répartition de la semaine {weekNumber}
          </Text>
        </TableCaption>
        <TableThead>
          <TableTr>
            <TableTh>Branche</TableTh>
            <TableTh>Secteur</TableTh>
            <TableTh>Mission</TableTh>
            <TableTh style={{ backgroundColor: 'black' }} p={1} />
            {days.map(formatDate).map((day) => (
              <TableTh key={day} className='capitalize'>
                <span>{day.replace(/ .*/, '')}</span>
                <br />
                <span>{day.replace(/.*? /, '')}</span>
              </TableTh>
            ))}
          </TableTr>
        </TableThead>
        <TableTbody>
          {branchesData.map((b) => {
            return b.sectors.map((s: FullSector, si: number) => {
              return s.missions.map((m: Mission, mi: number) => {
                const toPrint = [];
                for (let i = 0; i < getMissionSpan(m); i++) {
                  toPrint.push(
                    <TableTr
                      key={`${m.id}-${i}`}
                      className='!border-y-black [&>td]:text-center'
                      aria-label={`Branche ${b.name}, secteur ${s.name}, mission ${m.name}`}
                    >
                      {si === 0 && mi === 0 && i === 0 && (
                        <TableTh
                          rowSpan={getBranchSpan(b)}
                          styles={{ th: { backgroundColor: b.color ?? undefined } }}
                          color={b.color ?? undefined}
                        >
                          {b.name}
                        </TableTh>
                      )}
                      {mi === 0 && i === 0 && (
                        <TableTh
                          rowSpan={getSectorSpan(s)}
                          styles={{ th: { backgroundColor: s.color ?? undefined } }}
                        >
                          {s.name}
                        </TableTh>
                      )}
                      {i === 0 && (
                        <TableTh
                          rowSpan={getMissionSpan(m)}
                          className='sticky whitespace-pre-wrap'
                          styles={{ th: { backgroundColor: m.color ?? undefined } }}
                        >
                          {m.name || ' '}
                        </TableTh>
                      )}
                      <TableTd style={{ backgroundColor: 'black' }} p={1}></TableTd>
                      {days.map((day: Date, di: number) => {
                        const assignment = getCaregiverAssigned(m, day);
                        return assignment ? (
                          <TableTd
                            key={`${m.id}-${i}-${di}`}
                            styles={{ td: { backgroundColor: assignment.color ?? undefined } }}
                          >
                            <Mark color={assignment.caregiver.color || 'transparent'}>
                              {[assignment.caregiver.firstname, assignment.caregiver.lastname].join(
                                ' ',
                              )}
                            </Mark>
                          </TableTd>
                        ) : (
                          <TableTd key={`${m.id}-${i}-${di}`} className='text-gray-300 select-none'>
                            /
                          </TableTd>
                        );
                      })}
                    </TableTr>,
                  );
                }
                return toPrint;
              });
            });
          })}
        </TableTbody>
      </Table>
    </ScrollArea>
  );
}
