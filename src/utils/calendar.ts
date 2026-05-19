import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * .ics dosyası için tarihi yerel saat diliminde (örn. Europe/Istanbul) formatlar.
 * toISOString() GMT getirdiği için +3 saat kaymasını engeller.
 */
export const generateIcsDate = (date: Date): string => {
  // 'yyyyMMddTHHmmss' formatı .ics dosyaları için standarttır.
  // Yerel saati baz alır.
  return formatInTimeZone(date, 'Europe/Istanbul', "yyyyMMdd'T'HHmmss");
};

export const createIcsFile = (title: string, description: string, startDate: Date, endDate: Date) => {
  const startIcs = generateIcsDate(startDate);
  const endIcs = generateIcsDate(endDate);
  const nowIcs = generateIcsDate(new Date());

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PDKS//TR
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTAMP:${nowIcs}
DTSTART;TZID=Europe/Istanbul:${startIcs}
DTEND;TZID=Europe/Istanbul:${endIcs}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
