'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';

dayjs.locale('fr');

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);

export default dayjs;
