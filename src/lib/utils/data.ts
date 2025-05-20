import { Branch, Caregiver, Mission, Sector } from '@/generated/client';
import { NonRequired } from '@/types/utils';

type BranchWithSectors = NonRequired<Branch> & {
  sectors: (NonRequired<Sector> & { missions: NonRequired<Mission, 'max' | 'min'>[] })[];
};

export const branches: BranchWithSectors[] = [
  {
    name: 'IDE',
    sectors: [
      {
        name: 'RÉA',
        missions: [
          { name: 'Unité 1', max: 3, min: 3 },
          { name: 'Unité 2', max: 2, min: 2 },
          { name: 'Unité 3', max: 2, min: 2 },
          { name: 'Unité 4', max: 2, min: 2 },
          { name: 'EIDE', min: 1 },
          { name: 'EIDE' },
          { name: 'INTÉGRATION', min: 1 },
          { name: 'INTÉGRATION' },
          { name: 'INTÉGRATION' },
          { name: 'INTÉGRATION' },
          { name: 'INTÉGRATION' },
          { name: 'IDE référent WE' },
        ],
      },
      {
        name: 'USC',
        missions: [
          { name: 'STAFF', max: 2, min: 2 },
          { name: 'EIDE', min: 1 },
          { name: 'Intégration' },
        ],
      },
      {
        name: 'SSPI 1',
        missions: [
          { name: 'STAFF', max: 4, min: 3 },
          { name: '9h-21h', min: 1 },
          { name: 'EIDE', min: 1 },
          { name: 'INTÉGRATION' },
          { name: 'INTÉGRATION' },
        ],
      },
      { name: 'SSPI 3', missions: [{ name: '', max: 3, min: 3 }, { name: 'INTÉGRATION' }] },
    ],
  },
  {
    name: 'AS',
    sectors: [
      {
        name: 'RÉA',
        missions: [
          { name: 'dect', max: 4, min: 3 },
          { name: 'Accueil', min: 1 },
          { name: 'INTÉGRATION' },
          { name: 'INTÉGRATION' },
          { name: 'EAS' },
        ],
      },
      {
        name: 'USC',
        missions: [{ name: 'dect', max: 3, min: 2 }, { name: 'EAS' }, { name: 'INTÉGRATION' }],
      },
      { name: 'SSPI 1', missions: [{ name: '', max: 2, min: 2 }, { name: 'INTÉGRATION' }] },
    ],
  },
];

export const caregivers: NonRequired<Caregiver, 'bigWeekType' | 'time'>[] = [
  { firstname: 'François', lastname: 'Bayrou' },
  { firstname: 'Patrick', lastname: 'Mignola' },
  { firstname: 'Aurore', lastname: 'Bergé' },
  { firstname: 'Sophie', lastname: 'Primas' },
  { firstname: 'Élisabeth', lastname: 'Borne' },
  { firstname: 'Philippe', lastname: 'Baptiste' },
  { firstname: 'Manuel', lastname: 'Valls' },
  { firstname: 'Gérald', lastname: 'Darmanin' },
  { firstname: 'Bruno', lastname: 'Retailleau' },
  { firstname: 'François-Noël', lastname: 'Buffet' },
  { firstname: 'Catherine', lastname: 'Vautrin' },
  { firstname: 'Astrid', lastname: 'Panosyan-Bouvet' },
  { firstname: 'Yannick', lastname: 'Neuder' },
  { firstname: 'Charlotte', lastname: 'Parmentier-Lecocq' },
  { firstname: 'Éric', lastname: 'Lombard' },
  { firstname: 'Marc', lastname: 'Ferracci' },
  { firstname: 'Véronique', lastname: 'Louwagie' },
  { firstname: 'Clara', lastname: 'Chappaz' },
  { firstname: 'Nathalie', lastname: 'Delattre' },
  { firstname: 'Sébastien', lastname: 'Lecornu' },
  { firstname: 'Patricia', lastname: 'Mirallès' },
  { firstname: 'Rachida', lastname: 'Dati' },
  { firstname: 'François', lastname: 'Rebsamen' },
  { firstname: 'Valérie', lastname: 'Létard' },
  { firstname: 'Philippe', lastname: 'Tabarot' },
  { firstname: 'Françoise', lastname: 'Gatel' },
  { firstname: 'Juliette', lastname: 'Méadel' },
  { firstname: 'Jean-Noël', lastname: 'Barrot' },
  { firstname: 'Benjamin', lastname: 'Haddad' },
  { firstname: 'Laurent', lastname: 'Saint-Martin' },
  { firstname: 'Agnès', lastname: 'Pannier-Runacher' },
  { firstname: 'Annie', lastname: 'Genevard' },
  { firstname: 'Laurent', lastname: 'Marcangeli' },
  { firstname: 'Alain', lastname: 'Juppé' },
  { firstname: 'Michèle', lastname: 'Alliot-Marie' },
  { firstname: 'Nathalie', lastname: 'Kosciusko-Morizet' },
  { firstname: 'Michel', lastname: 'Mercier' },
  { firstname: 'Brice', lastname: 'Hortefeux' },
  { firstname: 'Christine', lastname: 'Lagarde' },
  { firstname: 'Xavier', lastname: 'Bertrand' },
  { firstname: 'Luc', lastname: 'Chatel' },
  { firstname: 'François', lastname: 'Baroin' },
  { firstname: 'Valérie', lastname: 'Pécresse' },
  { firstname: 'Bruno', lastname: 'Le Maire' },
  { firstname: 'Frédéric', lastname: 'Mitterrand' },
  { firstname: 'Roselyne', lastname: 'Bachelot-Narquin' },
  { firstname: 'Maurice', lastname: 'Leroy' },
  { firstname: 'Chantal', lastname: 'Jouanno' },
  { firstname: 'Patrick', lastname: 'Ollier' },
  { firstname: 'Eric', lastname: 'Besson' },
  { firstname: 'Henri', lastname: 'De Raincourt' },
  { firstname: 'Philippe', lastname: 'Richert' },
  { firstname: 'Laurent', lastname: 'Wauquiez' },
  { firstname: 'Nadine', lastname: 'Morano' },
  { firstname: 'Marie-Luce', lastname: 'Penchard' },
];
