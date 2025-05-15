import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';

// Configure dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(weekday);

// Set default locale to French
dayjs.locale('fr');

export default dayjs;
